import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, UserRole } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { GOOGLE_PROVIDER } from './google-oauth.constants';
import type { OAuthProfile } from './oauth.types';
import { YANDEX_PROVIDER } from './yandex-oauth.constants';
import { slugBaseFromEmail } from './slug.util';

export type SafeUser = {
  id: string;
  email: string;
  role: UserRole;
  slug: string;
  isPremium: boolean;
  createdAt: Date;
};

export type SessionUser = {
  id: string;
  email: string;
  role: UserRole;
  slug: string;
};

export type LoginResult = {
  accessToken: string;
  user: SessionUser;
};

type SessionJwtPayload = {
  sub?: string;
  jti?: string;
  exp?: number;
};

const userSelect = {
  id: true,
  email: true,
  role: true,
  slug: true,
  isPremium: true,
  createdAt: true,
} as const;

/** bcrypt of a fixed sentinel — equalizes login work when user is missing/deleted */
const DUMMY_PASSWORD_HASH =
  '$2a$10$cFEHQSnGCl9r8sT4GSFNx.cDVLk.wHNowAE/dtLCDbOzdgLxpk8BO';

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

@Injectable()
export class AuthService {
  /** jti → expiry epoch ms; single-process denylist (Redis later for multi-instance) */
  private readonly revokedJtis = new Map<string, number>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(input: {
    email: string;
    password: string;
  }): Promise<SafeUser> {
    const email = normalizeEmail(input.email);

    const existing = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existing) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const slug = await this.allocateUniqueSlug(slugBaseFromEmail(email));
    const passwordHash = await hash(input.password, 10);
    try {
      return await this.prisma.user.create({
        data: {
          email,
          passwordHash,
          role: UserRole.USER,
          slug,
        },
        select: userSelect,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Пользователь с таким email уже существует',
        );
      }
      throw error;
    }
  }

  async login(input: {
    email: string;
    password: string;
  }): Promise<LoginResult> {
    const email = normalizeEmail(input.email);

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    const passwordHash = user?.passwordHash ?? DUMMY_PASSWORD_HASH;
    const passwordValid = await compare(input.password, passwordHash);

    if (!user || user.deletedAt || !passwordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    return this.issueLoginResult(user);
  }

  /** Google OAuth: find Account → else link by email → else create User+Account. */
  async loginWithGoogle(profile: OAuthProfile): Promise<LoginResult> {
    return this.loginWithOAuth(GOOGLE_PROVIDER, profile, 'Google');
  }

  /** Yandex OAuth: find Account → else link by email → else create User+Account. */
  async loginWithYandex(profile: OAuthProfile): Promise<LoginResult> {
    return this.loginWithOAuth(YANDEX_PROVIDER, profile, 'Яндекс');
  }

  /**
   * Shared OAuth linking: Account by (provider, providerAccountId) →
   * else link by email → else create User+Account.
   */
  private async loginWithOAuth(
    provider: string,
    profile: OAuthProfile,
    providerLabel: string,
  ): Promise<LoginResult> {
    const email = normalizeEmail(profile.email);
    if (!email) {
      throw new UnauthorizedException(
        `${providerLabel} не вернул email — вход невозможен`,
      );
    }
    if (!profile.providerAccountId) {
      throw new UnauthorizedException(`Некорректный профиль ${providerLabel}`);
    }

    const existingAccount = await this.prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId: profile.providerAccountId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            slug: true,
            deletedAt: true,
          },
        },
      },
    });

    if (existingAccount) {
      if (existingAccount.user.deletedAt) {
        throw new UnauthorizedException('Необходима авторизация');
      }
      return this.issueLoginResult(existingAccount.user);
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        slug: true,
        deletedAt: true,
      },
    });

    if (existingUser) {
      if (existingUser.deletedAt) {
        throw new UnauthorizedException('Необходима авторизация');
      }
      await this.prisma.account.create({
        data: {
          provider,
          providerAccountId: profile.providerAccountId,
          userId: existingUser.id,
        },
      });
      return this.issueLoginResult(existingUser);
    }

    const slug = await this.allocateUniqueSlug(slugBaseFromEmail(email));
    const created = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash: null,
          role: UserRole.USER,
          slug,
        },
        select: {
          id: true,
          email: true,
          role: true,
          slug: true,
        },
      });
      await tx.account.create({
        data: {
          provider,
          providerAccountId: profile.providerAccountId,
          userId: user.id,
        },
      });
      return user;
    });

    return this.issueLoginResult(created);
  }

  private issueLoginResult(user: {
    id: string;
    email: string;
    role: UserRole;
    slug: string;
  }): LoginResult {
    const jti = randomUUID();
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      jti,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        slug: user.slug,
      },
    };
  }

  async getSessionUser(token: string): Promise<SessionUser> {
    let payload: SessionJwtPayload;
    try {
      payload = this.jwtService.verify<SessionJwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Необходима авторизация');
    }

    if (!payload.sub) {
      throw new UnauthorizedException('Необходима авторизация');
    }

    if (payload.jti && this.isRevoked(payload.jti)) {
      throw new UnauthorizedException('Необходима авторизация');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        slug: true,
        deletedAt: true,
      },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('Необходима авторизация');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      slug: user.slug,
    };
  }

  /** Invalidate token by jti; safe no-op for already-invalid tokens. */
  revokeSessionToken(token: string): void {
    try {
      const payload = this.jwtService.verify<SessionJwtPayload>(token);
      if (!payload.jti) {
        return;
      }
      const expiresAtMs =
        typeof payload.exp === 'number'
          ? payload.exp * 1000
          : Date.now() + 7 * 24 * 60 * 60 * 1000;
      this.revokedJtis.set(payload.jti, expiresAtMs);
      this.pruneRevoked();
    } catch {
      // ignore invalid tokens on logout
    }
  }

  private isRevoked(jti: string): boolean {
    const expiresAt = this.revokedJtis.get(jti);
    if (expiresAt === undefined) {
      return false;
    }
    if (expiresAt <= Date.now()) {
      this.revokedJtis.delete(jti);
      return false;
    }
    return true;
  }

  private pruneRevoked(): void {
    const now = Date.now();
    for (const [jti, expiresAt] of this.revokedJtis) {
      if (expiresAt <= now) {
        this.revokedJtis.delete(jti);
      }
    }
  }

  private async allocateUniqueSlug(base: string): Promise<string> {
    let candidate = base;
    let suffix = 2;
    while (true) {
      const taken = await this.prisma.user.findUnique({
        where: { slug: candidate },
        select: { id: true },
      });
      if (!taken) {
        return candidate;
      }
      candidate = `${base}-${suffix}`;
      suffix += 1;
    }
  }
}

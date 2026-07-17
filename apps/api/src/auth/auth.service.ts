import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, UserRole } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

export type SafeUser = {
  id: string;
  email: string;
  role: UserRole;
  isPremium: boolean;
  createdAt: Date;
};

export type LoginResult = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
};

const userSelect = {
  id: true,
  email: true,
  role: true,
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

    const passwordHash = await hash(input.password, 10);
    try {
      return await this.prisma.user.create({
        data: {
          email,
          passwordHash,
          role: UserRole.USER,
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

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}

import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, UserRole } from '@prisma/client';
import { compare } from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
  };
  let jwtService: { sign: jest.Mock; verify: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('jwt-token'),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = module.get(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('creates USER with hashed password and returns safe user fields', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.findUnique
        .mockResolvedValueOnce(null) // email
        .mockResolvedValueOnce(null); // slug availability
      prisma.user.create.mockResolvedValue({
        id: 'user-id',
        email: 'new@example.com',
        role: UserRole.USER,
        slug: 'new',
        isPremium: false,
        createdAt: new Date('2026-01-01'),
      });

      const result = await authService.register({
        email: 'new@example.com',
        password: 'Secure123!',
      });

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'new@example.com',
          passwordHash: 'hashed-password',
          role: UserRole.USER,
          slug: 'new',
        },
        select: {
          id: true,
          email: true,
          role: true,
          slug: true,
          isPremium: true,
          createdAt: true,
        },
      });
      expect(result).toEqual({
        id: 'user-id',
        email: 'new@example.com',
        role: UserRole.USER,
        slug: 'new',
        isPremium: false,
        createdAt: new Date('2026-01-01'),
      });
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('throws ConflictException when email already exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        authService.register({
          email: 'taken@example.com',
          password: 'Secure123!',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('normalizes email before lookup and create', async () => {
      prisma.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      prisma.user.create.mockResolvedValue({
        id: 'user-id',
        email: 'new@example.com',
        role: UserRole.USER,
        slug: 'new',
        isPremium: false,
        createdAt: new Date('2026-01-01'),
      });

      await authService.register({
        email: '  New@Example.com ',
        password: 'Secure123!',
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'new@example.com' },
      });
      const createArgs = prisma.user.create.mock.calls[0] as
        [{ data: { email: string } }] | undefined;
      expect(createArgs?.[0].data.email).toBe('new@example.com');
    });

    it('maps unique constraint race to ConflictException', async () => {
      prisma.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      prisma.user.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: '6.0.0',
        }),
      );

      await expect(
        authService.register({
          email: 'race@example.com',
          password: 'Secure123!',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('suffixes slug when base is already taken', async () => {
      prisma.user.findUnique
        .mockResolvedValueOnce(null) // email free
        .mockResolvedValueOnce({ id: 'taken' }) // slug 'reader' taken
        .mockResolvedValueOnce(null); // slug 'reader-2' free
      prisma.user.create.mockResolvedValue({
        id: 'user-id',
        email: 'reader@example.com',
        role: UserRole.USER,
        slug: 'reader-2',
        isPremium: false,
        createdAt: new Date('2026-01-01'),
      });

      await authService.register({
        email: 'reader@example.com',
        password: 'Secure123!',
      });

      const createArgs = prisma.user.create.mock.calls[0] as
        [{ data: { slug: string } }] | undefined;
      expect(createArgs?.[0].data.slug).toBe('reader-2');
    });
  });

  describe('login', () => {
    it('returns access token for valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: 'user@bookspace.local',
        passwordHash: 'stored-hash',
        role: UserRole.USER,
        slug: 'user',
        deletedAt: null,
      });
      (compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login({
        email: 'user@bookspace.local',
        password: 'User123!',
      });

      expect(result).toEqual({
        accessToken: 'jwt-token',
        user: {
          id: 'user-id',
          email: 'user@bookspace.local',
          role: UserRole.USER,
          slug: 'user',
        },
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'user-id',
        email: 'user@bookspace.local',
        role: UserRole.USER,
        jti: expect.any(String) as string,
      });
    });

    it('normalizes email before lookup', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      (compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login({
          email: '  User@Bookspace.Local ',
          password: 'User123!',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'user@bookspace.local' },
      });
    });

    it('throws UnauthorizedException for unknown email', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      (compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login({
          email: 'missing@example.com',
          password: 'User123!',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      expect(compare).toHaveBeenCalled();
    });

    it('throws UnauthorizedException for soft-deleted user', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: 'gone@example.com',
        passwordHash: 'stored-hash',
        role: UserRole.USER,
        deletedAt: new Date('2026-01-01'),
      });
      (compare as jest.Mock).mockResolvedValue(true);

      await expect(
        authService.login({
          email: 'gone@example.com',
          password: 'User123!',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException for wrong password', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: 'user@bookspace.local',
        passwordHash: 'stored-hash',
        role: UserRole.USER,
        deletedAt: null,
      });
      (compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login({
          email: 'user@bookspace.local',
          password: 'Wrong123!',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('getSessionUser', () => {
    it('returns safe user for valid token', async () => {
      jwtService.verify = jest.fn().mockReturnValue({
        sub: 'user-id',
        jti: 'jti-1',
      });
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: 'user@bookspace.local',
        role: UserRole.USER,
        slug: 'user',
        isPremium: false,
        createdAt: new Date('2026-01-01'),
        deletedAt: null,
      });

      const result = await authService.getSessionUser('jwt-token');

      expect(jwtService.verify).toHaveBeenCalledWith('jwt-token');
      expect(result).toEqual({
        id: 'user-id',
        email: 'user@bookspace.local',
        role: UserRole.USER,
        slug: 'user',
      });
    });

    it('throws UnauthorizedException for invalid token', async () => {
      jwtService.verify = jest.fn().mockImplementation(() => {
        throw new Error('invalid');
      });

      await expect(
        authService.getSessionUser('bad-token'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws UnauthorizedException for soft-deleted user', async () => {
      jwtService.verify = jest.fn().mockReturnValue({
        sub: 'user-id',
        jti: 'jti-1',
      });
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: 'gone@example.com',
        role: UserRole.USER,
        slug: 'gone',
        isPremium: false,
        createdAt: new Date('2026-01-01'),
        deletedAt: new Date('2026-02-01'),
      });

      await expect(
        authService.getSessionUser('jwt-token'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws UnauthorizedException after revokeSessionToken', async () => {
      jwtService.verify = jest.fn().mockReturnValue({
        sub: 'user-id',
        jti: 'jti-revoked',
        exp: Math.floor(Date.now() / 1000) + 3600,
      });
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: 'user@bookspace.local',
        role: UserRole.USER,
        slug: 'user',
        deletedAt: null,
      });

      authService.revokeSessionToken('jwt-token');

      await expect(
        authService.getSessionUser('jwt-token'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});

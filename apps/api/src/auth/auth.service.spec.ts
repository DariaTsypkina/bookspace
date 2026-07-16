import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
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
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };
    jwtService = { sign: jest.fn().mockReturnValue('jwt-token') };

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
      prisma.user.create.mockResolvedValue({
        id: 'user-id',
        email: 'new@example.com',
        role: UserRole.USER,
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
        },
        select: {
          id: true,
          email: true,
          role: true,
          isPremium: true,
          createdAt: true,
        },
      });
      expect(result).toEqual({
        id: 'user-id',
        email: 'new@example.com',
        role: UserRole.USER,
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
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'user-id',
        email: 'new@example.com',
        role: UserRole.USER,
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
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ email: 'new@example.com' }),
        }),
      );
    });

    it('maps unique constraint race to ConflictException', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      const { Prisma } = jest.requireActual(
        '@prisma/client',
      ) as typeof import('@prisma/client');
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
  });

  describe('login', () => {
    it('returns access token for valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: 'user@bookspace.local',
        passwordHash: 'stored-hash',
        role: UserRole.USER,
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
        },
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'user-id',
        email: 'user@bookspace.local',
        role: UserRole.USER,
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
});

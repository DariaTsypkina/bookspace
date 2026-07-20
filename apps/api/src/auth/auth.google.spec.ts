import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService.loginWithGoogle', () => {
  let authService: AuthService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
    account: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let jwtService: { sign: jest.Mock; verify: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      account: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('jwt-google'),
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
    jwtService.sign.mockReturnValue('jwt-google');
  });

  it('creates User+Account on first Google login', async () => {
    prisma.account.findUnique.mockResolvedValue(null);
    prisma.user.findUnique
      .mockResolvedValueOnce(null) // email lookup
      .mockResolvedValueOnce(null); // slug availability

    const createdUser = {
      id: 'user-1',
      email: 'guser@example.com',
      role: UserRole.USER,
      slug: 'guser',
      isPremium: false,
      createdAt: new Date('2026-01-01'),
      deletedAt: null,
    };

    prisma.$transaction.mockImplementation(
      async (
        fn: (tx: {
          user: { create: jest.Mock };
          account: { create: jest.Mock };
        }) => Promise<unknown>,
      ) => {
        const tx = {
          user: {
            create: jest.fn().mockResolvedValue(createdUser),
          },
          account: {
            create: jest.fn().mockResolvedValue({
              id: 'acc-1',
              provider: 'google',
              providerAccountId: 'google-sub-1',
              userId: 'user-1',
            }),
          },
        };
        return fn(tx);
      },
    );

    const result = await authService.loginWithGoogle({
      providerAccountId: 'google-sub-1',
      email: 'guser@example.com',
    });

    expect(result.user).toMatchObject({
      id: 'user-1',
      email: 'guser@example.com',
      slug: 'guser',
      role: UserRole.USER,
    });
    expect(result.accessToken).toBe('jwt-google');
    expect(jwtService.sign).toHaveBeenCalledWith(
      expect.objectContaining({
        sub: 'user-1',
        email: 'guser@example.com',
        role: UserRole.USER,
        jti: expect.any(String) as string,
      }),
    );
  });

  it('reuses same User on repeat Google login by providerAccountId', async () => {
    prisma.account.findUnique.mockResolvedValue({
      id: 'acc-1',
      provider: 'google',
      providerAccountId: 'google-sub-1',
      userId: 'user-1',
      user: {
        id: 'user-1',
        email: 'guser@example.com',
        role: UserRole.USER,
        slug: 'guser',
        deletedAt: null,
      },
    });

    const result = await authService.loginWithGoogle({
      providerAccountId: 'google-sub-1',
      email: 'guser@example.com',
    });

    expect(result.user.id).toBe('user-1');
    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(prisma.account.create).not.toHaveBeenCalled();
  });

  it('links Google Account to existing User with same email', async () => {
    prisma.account.findUnique.mockResolvedValue(null);
    prisma.user.findUnique.mockResolvedValue({
      id: 'existing-1',
      email: 'same@example.com',
      role: UserRole.USER,
      slug: 'same',
      deletedAt: null,
    });
    prisma.account.create.mockResolvedValue({
      id: 'acc-2',
      provider: 'google',
      providerAccountId: 'google-sub-2',
      userId: 'existing-1',
    });

    const result = await authService.loginWithGoogle({
      providerAccountId: 'google-sub-2',
      email: 'same@example.com',
    });

    expect(result.user.id).toBe('existing-1');
    expect(prisma.account.create).toHaveBeenCalledWith({
      data: {
        provider: 'google',
        providerAccountId: 'google-sub-2',
        userId: 'existing-1',
      },
    });
  });

  it('rejects Google profile without email', async () => {
    await expect(
      authService.loginWithGoogle({
        providerAccountId: 'google-sub-x',
        email: '',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});

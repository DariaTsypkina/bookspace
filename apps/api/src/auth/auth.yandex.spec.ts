import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService.loginWithYandex', () => {
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
      sign: jest.fn().mockReturnValue('jwt-yandex'),
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
    jwtService.sign.mockReturnValue('jwt-yandex');
  });

  it('creates User+Account on first Yandex login', async () => {
    prisma.account.findUnique.mockResolvedValue(null);
    prisma.user.findUnique
      .mockResolvedValueOnce(null) // email lookup
      .mockResolvedValueOnce(null); // slug availability

    const createdUser = {
      id: 'user-ya-1',
      email: 'yauser@example.com',
      role: UserRole.USER,
      slug: 'yauser',
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
              id: 'acc-ya-1',
              provider: 'yandex',
              providerAccountId: 'yandex-id-1',
              userId: 'user-ya-1',
            }),
          },
        };
        return fn(tx);
      },
    );

    const result = await authService.loginWithYandex({
      providerAccountId: 'yandex-id-1',
      email: 'yauser@example.com',
    });

    expect(result.user).toMatchObject({
      id: 'user-ya-1',
      email: 'yauser@example.com',
      slug: 'yauser',
      role: UserRole.USER,
    });
    expect(result.accessToken).toBe('jwt-yandex');
    expect(jwtService.sign).toHaveBeenCalledWith(
      expect.objectContaining({
        sub: 'user-ya-1',
        email: 'yauser@example.com',
        role: UserRole.USER,
        jti: expect.any(String) as string,
      }),
    );
  });

  it('reuses same User on repeat Yandex login by providerAccountId', async () => {
    prisma.account.findUnique.mockResolvedValue({
      id: 'acc-ya-1',
      provider: 'yandex',
      providerAccountId: 'yandex-id-1',
      userId: 'user-ya-1',
      user: {
        id: 'user-ya-1',
        email: 'yauser@example.com',
        role: UserRole.USER,
        slug: 'yauser',
        deletedAt: null,
      },
    });

    const result = await authService.loginWithYandex({
      providerAccountId: 'yandex-id-1',
      email: 'yauser@example.com',
    });

    expect(result.user.id).toBe('user-ya-1');
    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(prisma.account.create).not.toHaveBeenCalled();
  });

  it('links Yandex Account to existing User with same email', async () => {
    prisma.account.findUnique.mockResolvedValue(null);
    prisma.user.findUnique.mockResolvedValue({
      id: 'existing-ya-1',
      email: 'same-ya@example.com',
      role: UserRole.USER,
      slug: 'same-ya',
      deletedAt: null,
    });
    prisma.account.create.mockResolvedValue({
      id: 'acc-ya-2',
      provider: 'yandex',
      providerAccountId: 'yandex-id-2',
      userId: 'existing-ya-1',
    });

    const result = await authService.loginWithYandex({
      providerAccountId: 'yandex-id-2',
      email: 'same-ya@example.com',
    });

    expect(result.user.id).toBe('existing-ya-1');
    expect(prisma.account.create).toHaveBeenCalledWith({
      data: {
        provider: 'yandex',
        providerAccountId: 'yandex-id-2',
        userId: 'existing-ya-1',
      },
    });
  });

  it('rejects Yandex profile without email', async () => {
    await expect(
      authService.loginWithYandex({
        providerAccountId: 'yandex-id-x',
        email: '',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});

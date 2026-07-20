import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthGuard } from './auth.guard';
import { AuthService, SessionUser } from '../auth.service';
import { SESSION_COOKIE } from '../session.constants';

describe('AuthGuard', () => {
  const sessionUser: SessionUser = {
    id: 'user-1',
    email: 'user@bookspace.local',
    role: UserRole.USER,
    slug: 'user',
  };

  let authService: { getSessionUser: jest.Mock };
  let guard: AuthGuard;

  beforeEach(() => {
    authService = { getSessionUser: jest.fn() };
    guard = new AuthGuard(authService as unknown as AuthService);
  });

  function createContext(cookies?: Record<string, string>): {
    context: ExecutionContext;
    request: { cookies?: Record<string, string>; user?: SessionUser };
  } {
    const request: { cookies?: Record<string, string>; user?: SessionUser } = {
      cookies,
    };
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;
    return { context, request };
  }

  it('attaches session user when cookie is valid', async () => {
    authService.getSessionUser.mockResolvedValue(sessionUser);
    const { context, request } = createContext({
      [SESSION_COOKIE]: 'valid-token',
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(authService.getSessionUser).toHaveBeenCalledWith('valid-token');
    expect(request.user).toEqual(sessionUser);
  });

  it('rejects when session cookie is missing', async () => {
    const { context } = createContext({});

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(authService.getSessionUser).not.toHaveBeenCalled();
  });

  it('rejects when getSessionUser throws UnauthorizedException', async () => {
    authService.getSessionUser.mockRejectedValue(
      new UnauthorizedException('Необходима авторизация'),
    );
    const { context } = createContext({ [SESSION_COOKIE]: 'bad-token' });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});

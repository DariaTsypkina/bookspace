import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthRateLimiterService } from '../auth-rate-limiter.service';
import { AUTH_RATE_LIMIT_KEY } from '../decorators/auth-rate-limit.decorator';
import { AuthRateLimitGuard } from './auth-rate-limit.guard';

describe('AuthRateLimitGuard', () => {
  let limiter: { tryConsume: jest.Mock };
  let reflector: { get: jest.Mock };
  let guard: AuthRateLimitGuard;
  const originalBypass = process.env.E2E_THROTTLE_BYPASS;

  beforeEach(() => {
    limiter = { tryConsume: jest.fn().mockReturnValue(true) };
    reflector = { get: jest.fn().mockReturnValue('login') };
    guard = new AuthRateLimitGuard(
      limiter as unknown as AuthRateLimiterService,
      reflector as unknown as Reflector,
    );
    delete process.env.E2E_THROTTLE_BYPASS;
  });

  afterEach(() => {
    if (originalBypass === undefined) {
      delete process.env.E2E_THROTTLE_BYPASS;
    } else {
      process.env.E2E_THROTTLE_BYPASS = originalBypass;
    }
  });

  function createContext(headers: Record<string, string> = {}): {
    context: ExecutionContext;
    request: {
      headers: Record<string, string>;
      ip?: string;
      socket?: { remoteAddress?: string };
    };
  } {
    const request = {
      headers,
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' },
    };
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext;
    return { context, request };
  }

  it('consumes limiter for decorated endpoint', () => {
    const { context } = createContext();
    expect(guard.canActivate(context)).toBe(true);
    expect(reflector.get).toHaveBeenCalledWith(
      AUTH_RATE_LIMIT_KEY,
      context.getHandler(),
    );
    expect(limiter.tryConsume).toHaveBeenCalledWith('login', '127.0.0.1');
  });

  it('throws 429 when limit exceeded', () => {
    limiter.tryConsume.mockReturnValue(false);
    const { context } = createContext();

    expect(() => guard.canActivate(context)).toThrow(HttpException);
    try {
      guard.canActivate(context);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect((error as HttpException).getStatus()).toBe(
        HttpStatus.TOO_MANY_REQUESTS,
      );
      expect((error as HttpException).getResponse()).toMatchObject({
        message: 'Слишком много попыток. Попробуйте позже.',
      });
    }
  });

  it('bypasses when E2E_THROTTLE_BYPASS and X-E2E header set', () => {
    process.env.E2E_THROTTLE_BYPASS = 'true';
    const { context } = createContext({ 'x-e2e': '1' });

    expect(guard.canActivate(context)).toBe(true);
    expect(limiter.tryConsume).not.toHaveBeenCalled();
  });

  it('uses X-Forwarded-For first hop as client IP', () => {
    const { context } = createContext({
      'x-forwarded-for': '203.0.113.1, 10.0.0.1',
    });

    guard.canActivate(context);
    expect(limiter.tryConsume).toHaveBeenCalledWith('login', '203.0.113.1');
  });
});

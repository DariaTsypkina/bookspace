import { AuthRateLimiterService } from './auth-rate-limiter.service';

describe('AuthRateLimiterService', () => {
  let limiter: AuthRateLimiterService;

  beforeEach(() => {
    limiter = new AuthRateLimiterService({
      registerMax: 2,
      registerWindowMs: 60_000,
      loginMax: 3,
      loginWindowMs: 60_000,
    });
    limiter.reset();
  });

  it('allows requests within register limit', () => {
    expect(limiter.tryConsume('register', '1.2.3.4')).toBe(true);
    expect(limiter.tryConsume('register', '1.2.3.4')).toBe(true);
  });

  it('blocks register when limit exceeded', () => {
    limiter.tryConsume('register', '1.2.3.4');
    limiter.tryConsume('register', '1.2.3.4');
    expect(limiter.tryConsume('register', '1.2.3.4')).toBe(false);
  });

  it('tracks login separately from register', () => {
    limiter.tryConsume('register', '1.2.3.4');
    limiter.tryConsume('register', '1.2.3.4');
    expect(limiter.tryConsume('login', '1.2.3.4')).toBe(true);
  });

  it('tracks limits per IP independently', () => {
    limiter.tryConsume('login', '1.2.3.4');
    limiter.tryConsume('login', '1.2.3.4');
    limiter.tryConsume('login', '1.2.3.4');
    expect(limiter.tryConsume('login', '1.2.3.4')).toBe(false);
    expect(limiter.tryConsume('login', '5.6.7.8')).toBe(true);
  });

  it('expires old attempts after window', () => {
    jest.useFakeTimers();
    limiter.tryConsume('register', '1.2.3.4');
    limiter.tryConsume('register', '1.2.3.4');
    expect(limiter.tryConsume('register', '1.2.3.4')).toBe(false);

    jest.advanceTimersByTime(60_001);
    expect(limiter.tryConsume('register', '1.2.3.4')).toBe(true);
    jest.useRealTimers();
  });
});

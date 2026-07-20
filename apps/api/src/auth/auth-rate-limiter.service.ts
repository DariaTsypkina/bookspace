export type AuthRateLimitEndpoint = 'register' | 'login';

export type AuthRateLimiterOptions = {
  registerMax: number;
  registerWindowMs: number;
  loginMax: number;
  loginWindowMs: number;
};

type Bucket = {
  timestamps: number[];
};

const DEFAULT_OPTIONS: AuthRateLimiterOptions = {
  registerMax: 5,
  registerWindowMs: 15 * 60 * 1000,
  loginMax: 10,
  loginWindowMs: 15 * 60 * 1000,
};

export class AuthRateLimiterService {
  private readonly store = new Map<string, Bucket>();
  private readonly options: AuthRateLimiterOptions;

  constructor(options: Partial<AuthRateLimiterOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  tryConsume(endpoint: AuthRateLimitEndpoint, ip: string): boolean {
    const key = `${endpoint}:${ip}`;
    const max =
      endpoint === 'register'
        ? this.options.registerMax
        : this.options.loginMax;
    const windowMs =
      endpoint === 'register'
        ? this.options.registerWindowMs
        : this.options.loginWindowMs;
    const now = Date.now();
    const bucket = this.store.get(key) ?? { timestamps: [] };
    bucket.timestamps = bucket.timestamps.filter(
      (timestamp) => now - timestamp < windowMs,
    );

    if (bucket.timestamps.length >= max) {
      this.store.set(key, bucket);
      return false;
    }

    bucket.timestamps.push(now);
    this.store.set(key, bucket);
    return true;
  }

  reset(): void {
    this.store.clear();
  }
}

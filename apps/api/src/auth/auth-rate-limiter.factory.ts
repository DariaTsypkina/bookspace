import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthRateLimiterService } from './auth-rate-limiter.service';

@Injectable()
export class AuthRateLimiterFactory {
  constructor(private readonly config: ConfigService) {}

  create(): AuthRateLimiterService {
    return new AuthRateLimiterService({
      registerMax: this.parsePositiveInt('AUTH_RATE_LIMIT_REGISTER_MAX', 5),
      registerWindowMs: this.parsePositiveInt(
        'AUTH_RATE_LIMIT_REGISTER_WINDOW_MS',
        15 * 60 * 1000,
      ),
      loginMax: this.parsePositiveInt('AUTH_RATE_LIMIT_LOGIN_MAX', 10),
      loginWindowMs: this.parsePositiveInt(
        'AUTH_RATE_LIMIT_LOGIN_WINDOW_MS',
        15 * 60 * 1000,
      ),
    });
  }

  private parsePositiveInt(key: string, fallback: number): number {
    const raw = this.config.get<string>(key);
    if (!raw) {
      return fallback;
    }
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }
}

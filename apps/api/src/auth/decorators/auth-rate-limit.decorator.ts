import { SetMetadata } from '@nestjs/common';
import type { AuthRateLimitEndpoint } from '../auth-rate-limiter.service';

export const AUTH_RATE_LIMIT_KEY = 'authRateLimit';

export const AuthRateLimit = (endpoint: AuthRateLimitEndpoint) =>
  SetMetadata(AUTH_RATE_LIMIT_KEY, endpoint);

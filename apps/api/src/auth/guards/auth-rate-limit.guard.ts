import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { AuthRateLimiterService } from '../auth-rate-limiter.service';
import type { AuthRateLimitEndpoint } from '../auth-rate-limiter.service';
import { getClientIp } from '../client-ip.util';
import { AUTH_RATE_LIMIT_KEY } from '../decorators/auth-rate-limit.decorator';

@Injectable()
export class AuthRateLimitGuard implements CanActivate {
  constructor(
    private readonly limiter: AuthRateLimiterService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    if (this.shouldBypass(request)) {
      return true;
    }

    const endpoint = this.reflector.get<AuthRateLimitEndpoint | undefined>(
      AUTH_RATE_LIMIT_KEY,
      context.getHandler(),
    );
    if (!endpoint) {
      return true;
    }

    const ip = getClientIp(request);
    if (!this.limiter.tryConsume(endpoint, ip)) {
      throw new HttpException(
        { message: 'Слишком много попыток. Попробуйте позже.' },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private shouldBypass(request: Request): boolean {
    if (process.env.E2E_THROTTLE_BYPASS !== 'true') {
      return false;
    }
    const e2eHeader = request.headers['x-e2e'];
    if (typeof e2eHeader === 'string' && e2eHeader.length > 0) {
      return true;
    }
    if (Array.isArray(e2eHeader) && e2eHeader.length > 0) {
      return true;
    }
    return false;
  }
}

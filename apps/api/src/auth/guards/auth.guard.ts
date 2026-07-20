import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService, SessionUser } from '../auth.service';
import { SESSION_COOKIE } from '../session.constants';

type RequestWithUser = Request & { user?: SessionUser };

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const cookies = request.cookies as
      Record<string, string | undefined> | undefined;
    const token = cookies?.[SESSION_COOKIE];
    if (!token) {
      throw new UnauthorizedException('Необходима авторизация');
    }

    request.user = await this.authService.getSessionUser(token);
    return true;
  }
}

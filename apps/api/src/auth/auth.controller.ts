import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { AuthService } from './auth.service';
import type { SessionUser } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { GoogleOAuthClient } from './google-oauth.client';
import { AuthGuard } from './guards/auth.guard';
import { isStrongPassword } from './password.validator';
import { SESSION_COOKIE } from './session.constants';
import { YandexOAuthClient } from './yandex-oauth.client';

const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleOAuth: GoogleOAuthClient,
    private readonly yandexOAuth: YandexOAuthClient,
    private readonly config: ConfigService,
  ) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    if (!isStrongPassword(body.password)) {
      throw new BadRequestException(
        'Пароль должен быть не короче 8 символов и содержать заглавную и строчную буквы, цифру и спецсимвол',
      );
    }

    return this.authService.register(body);
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(body);
    this.setSessionCookie(res, result.accessToken);
    return { user: result.user };
  }

  @Get('google')
  googleStart(@Res() res: Response) {
    const state = randomUUID();
    const url = this.googleOAuth.buildAuthorizeUrl(state);
    return res.redirect(url);
  }

  @Get('google/callback')
  async googleCallback(
    @Query('code') code: string | undefined,
    @Query('error') error: string | undefined,
    @Res() res: Response,
  ) {
    return this.handleOAuthCallback(res, {
      provider: 'google',
      code,
      error,
      fetchProfile: (c) => this.googleOAuth.fetchProfile(c),
      login: (profile) => this.authService.loginWithGoogle(profile),
    });
  }

  @Get('yandex')
  yandexStart(@Res() res: Response) {
    const state = randomUUID();
    const url = this.yandexOAuth.buildAuthorizeUrl(state);
    return res.redirect(url);
  }

  @Get('yandex/callback')
  async yandexCallback(
    @Query('code') code: string | undefined,
    @Query('error') error: string | undefined,
    @Res() res: Response,
  ) {
    return this.handleOAuthCallback(res, {
      provider: 'yandex',
      code,
      error,
      fetchProfile: (c) => this.yandexOAuth.fetchProfile(c),
      login: (profile) => this.authService.loginWithYandex(profile),
    });
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@CurrentUser() user: SessionUser) {
    return user;
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cookies = req.cookies as
      Record<string, string | undefined> | undefined;
    const token = cookies?.[SESSION_COOKIE];
    if (token) {
      this.authService.revokeSessionToken(token);
    }
    res.clearCookie(SESSION_COOKIE, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    return { ok: true };
  }

  private async handleOAuthCallback(
    res: Response,
    opts: {
      provider: 'google' | 'yandex';
      code: string | undefined;
      error: string | undefined;
      fetchProfile: (code: string) => Promise<{
        providerAccountId: string;
        email: string;
      }>;
      login: (profile: {
        providerAccountId: string;
        email: string;
      }) => Promise<{ accessToken: string }>;
    },
  ) {
    const webUrl =
      this.config.get<string>('WEB_URL') ?? 'http://localhost:3000';
    const providerQ = `provider=${encodeURIComponent(opts.provider)}`;

    if (opts.error) {
      const reason =
        opts.error === 'access_denied' ? 'access_denied' : 'oauth_error';
      return res.redirect(
        `${webUrl}/auth/error?reason=${encodeURIComponent(reason)}&${providerQ}`,
      );
    }

    if (!opts.code) {
      return res.redirect(
        `${webUrl}/auth/error?reason=missing_code&${providerQ}`,
      );
    }

    try {
      const profile = await opts.fetchProfile(opts.code);
      const result = await opts.login(profile);
      this.setSessionCookie(res, result.accessToken);
      return res.redirect(`${webUrl}/`);
    } catch {
      return res.redirect(
        `${webUrl}/auth/error?reason=oauth_failed&${providerQ}`,
      );
    }
  }

  private setSessionCookie(res: Response, accessToken: string): void {
    res.cookie(SESSION_COOKIE, accessToken, {
      ...SESSION_COOKIE_OPTIONS,
      secure: process.env.NODE_ENV === 'production',
    });
  }
}

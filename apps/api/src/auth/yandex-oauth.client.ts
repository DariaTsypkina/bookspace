import { HttpService } from '@nestjs/axios';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { OAUTH_TEST_CODE_PREFIX } from './oauth.constants';
import {
  YANDEX_AUTH_URL,
  YANDEX_TOKEN_URL,
  YANDEX_USERINFO_URL,
} from './yandex-oauth.constants';
import type {
  YandexOAuthProfile,
  YandexTokenResponse,
  YandexUserInfo,
} from './yandex-oauth.types';

export type YandexOAuthConfig = {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  testMode: boolean;
};

@Injectable()
export class YandexOAuthClient {
  constructor(
    private readonly config: ConfigService,
    private readonly http: HttpService,
  ) {}

  getConfig(): YandexOAuthConfig {
    const testMode = this.config.get<string>('OAUTH_TEST_MODE') === 'true';
    return {
      clientId: this.config.get<string>('YANDEX_CLIENT_ID') ?? '',
      clientSecret: this.config.get<string>('YANDEX_CLIENT_SECRET') ?? '',
      callbackUrl:
        this.config.get<string>('YANDEX_CALLBACK_URL') ??
        'http://localhost:3000/api/auth/yandex/callback',
      testMode,
    };
  }

  assertConfigured(): YandexOAuthConfig {
    const cfg = this.getConfig();
    if (cfg.testMode) {
      return cfg;
    }
    if (!cfg.clientId || !cfg.clientSecret || !cfg.callbackUrl) {
      throw new UnauthorizedException('Вход через Яндекс временно недоступен');
    }
    return cfg;
  }

  buildAuthorizeUrl(state: string): string {
    const cfg = this.assertConfigured();
    if (cfg.testMode) {
      const url = new URL(cfg.callbackUrl);
      url.searchParams.set('code', OAUTH_TEST_CODE_PREFIX);
      url.searchParams.set('state', state);
      return url.toString();
    }

    const url = new URL(YANDEX_AUTH_URL);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', cfg.clientId);
    url.searchParams.set('redirect_uri', cfg.callbackUrl);
    url.searchParams.set('scope', 'login:email login:info');
    url.searchParams.set('force_confirm', 'yes');
    url.searchParams.set('state', state);
    return url.toString();
  }

  /**
   * In test mode, optional query overrides:
   * code=oauth_test or code=oauth_test:<email>:<id>
   */
  async fetchProfile(code: string): Promise<YandexOAuthProfile> {
    const cfg = this.assertConfigured();

    if (cfg.testMode && code.startsWith(OAUTH_TEST_CODE_PREFIX)) {
      return this.profileFromTestCode(code);
    }

    const tokens = await this.exchangeCode(code, cfg);
    const info = await this.fetchUserInfo(tokens.access_token);
    const email = this.extractEmail(info);
    if (!email) {
      throw new UnauthorizedException(
        'Яндекс не вернул email — вход невозможен',
      );
    }
    if (!info.id) {
      throw new UnauthorizedException('Некорректный профиль Яндекс');
    }
    return {
      providerAccountId: String(info.id),
      email,
    };
  }

  private profileFromTestCode(code: string): YandexOAuthProfile {
    const rest = code.slice(OAUTH_TEST_CODE_PREFIX.length);
    if (!rest || rest === '') {
      return {
        providerAccountId: 'yandex-test-id',
        email: 'yandex-oauth-test@bookspace.local',
      };
    }
    // format: :email:id
    const parts = rest.startsWith(':') ? rest.slice(1).split(':') : [];
    const email = parts[0]?.trim() || 'yandex-oauth-test@bookspace.local';
    const id = parts[1]?.trim() || `yandex-test-${email}`;
    return { providerAccountId: id, email };
  }

  private extractEmail(info: YandexUserInfo): string | undefined {
    if (info.default_email?.trim()) {
      return info.default_email.trim();
    }
    const fromList = info.emails?.find((e) => e?.trim());
    return fromList?.trim();
  }

  private async exchangeCode(
    code: string,
    cfg: YandexOAuthConfig,
  ): Promise<YandexTokenResponse> {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
    });

    try {
      const { data } = await firstValueFrom(
        this.http.post<YandexTokenResponse>(YANDEX_TOKEN_URL, body.toString(), {
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
        }),
      );
      return data;
    } catch {
      throw new UnauthorizedException('Не удалось обменять код Яндекс OAuth');
    }
  }

  private async fetchUserInfo(accessToken: string): Promise<YandexUserInfo> {
    const url = new URL(YANDEX_USERINFO_URL);
    url.searchParams.set('format', 'json');

    try {
      const { data } = await firstValueFrom(
        this.http.get<YandexUserInfo>(url.toString(), {
          headers: { Authorization: `OAuth ${accessToken}` },
        }),
      );
      return data;
    } catch {
      throw new UnauthorizedException('Не удалось получить профиль Яндекс');
    }
  }
}

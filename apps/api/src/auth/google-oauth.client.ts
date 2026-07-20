import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAUTH_TEST_CODE_PREFIX } from './oauth.constants';
import {
  GOOGLE_AUTH_URL,
  GOOGLE_TOKEN_URL,
  GOOGLE_USERINFO_URL,
} from './google-oauth.constants';
import type {
  GoogleOAuthProfile,
  GoogleTokenResponse,
  GoogleUserInfo,
} from './google-oauth.types';

export type GoogleOAuthConfig = {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  testMode: boolean;
};

@Injectable()
export class GoogleOAuthClient {
  constructor(private readonly config: ConfigService) {}

  getConfig(): GoogleOAuthConfig {
    const testMode = this.config.get<string>('OAUTH_TEST_MODE') === 'true';
    return {
      clientId: this.config.get<string>('GOOGLE_CLIENT_ID') ?? '',
      clientSecret: this.config.get<string>('GOOGLE_CLIENT_SECRET') ?? '',
      callbackUrl:
        this.config.get<string>('GOOGLE_CALLBACK_URL') ??
        'http://localhost:3000/api/auth/google/callback',
      testMode,
    };
  }

  assertConfigured(): GoogleOAuthConfig {
    const cfg = this.getConfig();
    if (cfg.testMode) {
      return cfg;
    }
    if (!cfg.clientId || !cfg.clientSecret || !cfg.callbackUrl) {
      throw new UnauthorizedException('Вход через Google временно недоступен');
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

    const url = new URL(GOOGLE_AUTH_URL);
    url.searchParams.set('client_id', cfg.clientId);
    url.searchParams.set('redirect_uri', cfg.callbackUrl);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'openid email profile');
    url.searchParams.set('access_type', 'online');
    url.searchParams.set('include_granted_scopes', 'true');
    url.searchParams.set('state', state);
    url.searchParams.set('prompt', 'select_account');
    return url.toString();
  }

  /**
   * In test mode, optional query overrides:
   * code=oauth_test or code=oauth_test:<email>:<sub>
   */
  async fetchProfile(code: string): Promise<GoogleOAuthProfile> {
    const cfg = this.assertConfigured();

    if (cfg.testMode && code.startsWith(OAUTH_TEST_CODE_PREFIX)) {
      return this.profileFromTestCode(code);
    }

    const tokens = await this.exchangeCode(code, cfg);
    const info = await this.fetchUserInfo(tokens.access_token);
    if (!info.email) {
      throw new UnauthorizedException(
        'Google не вернул email — вход невозможен',
      );
    }
    return {
      providerAccountId: info.sub,
      email: info.email,
    };
  }

  private profileFromTestCode(code: string): GoogleOAuthProfile {
    const rest = code.slice(OAUTH_TEST_CODE_PREFIX.length);
    if (!rest || rest === '') {
      return {
        providerAccountId: 'google-test-sub',
        email: 'google-oauth-test@bookspace.local',
      };
    }
    // format: :email:sub
    const parts = rest.startsWith(':') ? rest.slice(1).split(':') : [];
    const email = parts[0]?.trim() || 'google-oauth-test@bookspace.local';
    const sub = parts[1]?.trim() || `google-test-${email}`;
    return { providerAccountId: sub, email };
  }

  private async exchangeCode(
    code: string,
    cfg: GoogleOAuthConfig,
  ): Promise<GoogleTokenResponse> {
    const body = new URLSearchParams({
      code,
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      redirect_uri: cfg.callbackUrl,
      grant_type: 'authorization_code',
    });

    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!response.ok) {
      throw new UnauthorizedException('Не удалось обменять код Google OAuth');
    }

    return (await response.json()) as GoogleTokenResponse;
  }

  private async fetchUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    const response = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new UnauthorizedException('Не удалось получить профиль Google');
    }

    return (await response.json()) as GoogleUserInfo;
  }
}

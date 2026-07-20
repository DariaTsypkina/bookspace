import type { OAuthProfile } from './oauth.types';

export type YandexTokenResponse = {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
};

export type YandexUserInfo = {
  id: string;
  login?: string;
  default_email?: string;
  emails?: string[];
  real_name?: string;
  display_name?: string;
};

export type YandexOAuthProfile = OAuthProfile;

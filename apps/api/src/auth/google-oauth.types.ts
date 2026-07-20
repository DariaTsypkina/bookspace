export type GoogleTokenResponse = {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  id_token?: string;
  scope?: string;
};

export type GoogleUserInfo = {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

export type GoogleOAuthProfile = {
  providerAccountId: string;
  email: string;
};

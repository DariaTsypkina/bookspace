import { HttpService } from '@nestjs/axios';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios';
import { of, throwError } from 'rxjs';
import { OAUTH_TEST_CODE_PREFIX } from './oauth.constants';
import { GoogleOAuthClient } from './google-oauth.client';
import {
  GOOGLE_TOKEN_URL,
  GOOGLE_USERINFO_URL,
} from './google-oauth.constants';

function axiosOk<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: { headers: new AxiosHeaders() },
  };
}

describe('GoogleOAuthClient', () => {
  let client: GoogleOAuthClient;
  let configValues: Record<string, string | undefined>;
  let http: { post: jest.Mock; get: jest.Mock };

  beforeEach(async () => {
    configValues = {
      OAUTH_TEST_MODE: 'true',
      GOOGLE_CLIENT_ID: '',
      GOOGLE_CLIENT_SECRET: '',
      GOOGLE_CALLBACK_URL: 'http://localhost:3000/api/auth/google/callback',
    };
    http = {
      post: jest.fn(),
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleOAuthClient,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => configValues[key],
          },
        },
        {
          provide: HttpService,
          useValue: http,
        },
      ],
    }).compile();

    client = module.get(GoogleOAuthClient);
  });

  it('injects HttpService', () => {
    expect(client).toBeDefined();
    expect(moduleGetHttp(client)).toBe(http);
  });

  it('in test mode authorize URL points to callback with oauth_test code', () => {
    const url = client.buildAuthorizeUrl('state-1');
    expect(url).toContain('/api/auth/google/callback');
    expect(url).toContain(`code=${OAUTH_TEST_CODE_PREFIX}`);
    expect(url).toContain('state=state-1');
  });

  it('in test mode fetchProfile maps default code to fixture profile', async () => {
    const profile = await client.fetchProfile(OAUTH_TEST_CODE_PREFIX);
    expect(profile).toEqual({
      providerAccountId: 'google-test-sub',
      email: 'google-oauth-test@bookspace.local',
    });
    expect(http.post).not.toHaveBeenCalled();
    expect(http.get).not.toHaveBeenCalled();
  });

  it('in test mode fetchProfile parses email and sub from code', async () => {
    const profile = await client.fetchProfile(
      `${OAUTH_TEST_CODE_PREFIX}:linked@example.com:sub-99`,
    );
    expect(profile).toEqual({
      providerAccountId: 'sub-99',
      email: 'linked@example.com',
    });
  });

  describe('live OAuth (HttpService)', () => {
    beforeEach(() => {
      configValues.OAUTH_TEST_MODE = 'false';
      configValues.GOOGLE_CLIENT_ID = 'google-client';
      configValues.GOOGLE_CLIENT_SECRET = 'google-secret';
    });

    it('exchanges code and loads userinfo via HttpService', async () => {
      http.post.mockReturnValue(
        of(axiosOk({ access_token: 'tok-google', token_type: 'Bearer' })),
      );
      http.get.mockReturnValue(
        of(
          axiosOk({
            sub: 'google-sub-1',
            email: 'user@gmail.com',
          }),
        ),
      );

      const profile = await client.fetchProfile('auth-code');

      expect(profile).toEqual({
        providerAccountId: 'google-sub-1',
        email: 'user@gmail.com',
      });
      expect(http.post).toHaveBeenCalledWith(
        GOOGLE_TOKEN_URL,
        expect.any(String),
        expect.objectContaining({
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
          },
        }),
      );
      expect(http.get).toHaveBeenCalledWith(
        GOOGLE_USERINFO_URL,
        expect.objectContaining({
          headers: { Authorization: 'Bearer tok-google' },
        }),
      );
    });

    it('maps token non-2xx to UnauthorizedException', async () => {
      http.post.mockReturnValue(
        throwError(() => {
          const err = new AxiosError('Bad Request');
          err.response = axiosOk({}) as AxiosResponse;
          err.response.status = 400;
          return err;
        }),
      );

      await expect(client.fetchProfile('bad-code')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      await expect(client.fetchProfile('bad-code')).rejects.toThrow(
        'Не удалось обменять код Google OAuth',
      );
      expect(http.get).not.toHaveBeenCalled();
    });

    it('maps userinfo non-2xx to UnauthorizedException', async () => {
      http.post.mockReturnValue(
        of(axiosOk({ access_token: 'tok-google', token_type: 'Bearer' })),
      );
      http.get.mockReturnValue(
        throwError(() => {
          const err = new AxiosError('Unauthorized');
          err.response = axiosOk({}) as AxiosResponse;
          err.response.status = 401;
          return err;
        }),
      );

      await expect(client.fetchProfile('auth-code')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      await expect(client.fetchProfile('auth-code')).rejects.toThrow(
        'Не удалось получить профиль Google',
      );
    });
  });
});

/** Peek private http for inject assertion without exposing API. */
function moduleGetHttp(client: GoogleOAuthClient): unknown {
  return (client as unknown as { http: unknown }).http;
}

import { HttpService } from '@nestjs/axios';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios';
import { of, throwError } from 'rxjs';
import { OAUTH_TEST_CODE_PREFIX } from './oauth.constants';
import { YandexOAuthClient } from './yandex-oauth.client';
import {
  YANDEX_TOKEN_URL,
  YANDEX_USERINFO_URL,
} from './yandex-oauth.constants';

function axiosOk<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: { headers: new AxiosHeaders() },
  };
}

describe('YandexOAuthClient', () => {
  let client: YandexOAuthClient;
  let configValues: Record<string, string | undefined>;
  let http: { post: jest.Mock; get: jest.Mock };

  beforeEach(async () => {
    configValues = {
      OAUTH_TEST_MODE: 'true',
      YANDEX_CLIENT_ID: '',
      YANDEX_CLIENT_SECRET: '',
      YANDEX_CALLBACK_URL: 'http://localhost:3000/api/auth/yandex/callback',
    };
    http = {
      post: jest.fn(),
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        YandexOAuthClient,
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

    client = module.get(YandexOAuthClient);
  });

  it('injects HttpService', () => {
    expect(client).toBeDefined();
    expect(moduleGetHttp(client)).toBe(http);
  });

  it('in test mode authorize URL points to callback with oauth_test code', () => {
    const url = client.buildAuthorizeUrl('state-y1');
    expect(url).toContain('/api/auth/yandex/callback');
    expect(url).toContain(`code=${OAUTH_TEST_CODE_PREFIX}`);
    expect(url).toContain('state=state-y1');
  });

  it('in test mode fetchProfile maps default code to fixture profile', async () => {
    const profile = await client.fetchProfile(OAUTH_TEST_CODE_PREFIX);
    expect(profile).toEqual({
      providerAccountId: 'yandex-test-id',
      email: 'yandex-oauth-test@bookspace.local',
    });
    expect(http.post).not.toHaveBeenCalled();
    expect(http.get).not.toHaveBeenCalled();
  });

  it('in test mode fetchProfile parses email and id from code', async () => {
    const profile = await client.fetchProfile(
      `${OAUTH_TEST_CODE_PREFIX}:linked-ya@example.com:ya-99`,
    );
    expect(profile).toEqual({
      providerAccountId: 'ya-99',
      email: 'linked-ya@example.com',
    });
  });

  describe('live OAuth (HttpService)', () => {
    beforeEach(() => {
      configValues.OAUTH_TEST_MODE = 'false';
      configValues.YANDEX_CLIENT_ID = 'yandex-client';
      configValues.YANDEX_CLIENT_SECRET = 'yandex-secret';
    });

    it('exchanges code and loads userinfo via HttpService', async () => {
      http.post.mockReturnValue(
        of(axiosOk({ access_token: 'tok-yandex', token_type: 'bearer' })),
      );
      http.get.mockReturnValue(
        of(
          axiosOk({
            id: 'ya-id-1',
            default_email: 'user@yandex.ru',
          }),
        ),
      );

      const profile = await client.fetchProfile('auth-code');

      expect(profile).toEqual({
        providerAccountId: 'ya-id-1',
        email: 'user@yandex.ru',
      });
      expect(http.post).toHaveBeenCalledWith(
        YANDEX_TOKEN_URL,
        expect.any(String),
        expect.objectContaining({
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
          },
        }),
      );
      expect(http.get).toHaveBeenCalledWith(
        expect.stringContaining(YANDEX_USERINFO_URL),
        expect.objectContaining({
          headers: { Authorization: 'OAuth tok-yandex' },
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
        'Не удалось обменять код Яндекс OAuth',
      );
      expect(http.get).not.toHaveBeenCalled();
    });

    it('maps userinfo non-2xx to UnauthorizedException', async () => {
      http.post.mockReturnValue(
        of(axiosOk({ access_token: 'tok-yandex', token_type: 'bearer' })),
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
        'Не удалось получить профиль Яндекс',
      );
    });
  });
});

/** Peek private http for inject assertion without exposing API. */
function moduleGetHttp(client: YandexOAuthClient): unknown {
  return (client as unknown as { http: unknown }).http;
}

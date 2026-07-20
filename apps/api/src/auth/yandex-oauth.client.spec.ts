import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { OAUTH_TEST_CODE_PREFIX } from './oauth.constants';
import { YandexOAuthClient } from './yandex-oauth.client';

describe('YandexOAuthClient', () => {
  let client: YandexOAuthClient;
  let configValues: Record<string, string | undefined>;

  beforeEach(async () => {
    configValues = {
      OAUTH_TEST_MODE: 'true',
      YANDEX_CLIENT_ID: '',
      YANDEX_CLIENT_SECRET: '',
      YANDEX_CALLBACK_URL: 'http://localhost:3000/api/auth/yandex/callback',
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
      ],
    }).compile();

    client = module.get(YandexOAuthClient);
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
});

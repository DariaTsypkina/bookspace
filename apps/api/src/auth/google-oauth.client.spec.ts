import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { OAUTH_TEST_CODE_PREFIX } from './oauth.constants';
import { GoogleOAuthClient } from './google-oauth.client';

describe('GoogleOAuthClient', () => {
  let client: GoogleOAuthClient;
  let configValues: Record<string, string | undefined>;

  beforeEach(async () => {
    configValues = {
      OAUTH_TEST_MODE: 'true',
      GOOGLE_CLIENT_ID: '',
      GOOGLE_CLIENT_SECRET: '',
      GOOGLE_CALLBACK_URL: 'http://localhost:3000/api/auth/google/callback',
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
      ],
    }).compile();

    client = module.get(GoogleOAuthClient);
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
});

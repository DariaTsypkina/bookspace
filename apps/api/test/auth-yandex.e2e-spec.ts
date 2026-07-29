import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { OAUTH_TEST_CODE_PREFIX } from '../src/auth/oauth.constants';
import { configureApp } from '../src/bootstrap';

const prisma = new PrismaClient();

function parseLocationQuery(location: string): URLSearchParams {
  const url = new URL(location);
  return url.searchParams;
}

describe('Auth Yandex OAuth (e2e)', () => {
  let app: INestApplication<App>;

  const yandexEmails = [
    'yandex-oauth-test@bookspace.local',
    'yandex-e2e-link@bookspace.local',
    'yandex-e2e-repeat@bookspace.local',
  ];

  beforeAll(async () => {
    process.env.OAUTH_TEST_MODE = 'true';
    process.env.E2E_THROTTLE_BYPASS = 'true';
    process.env.YANDEX_CALLBACK_URL =
      'http://localhost:8000/auth/yandex/callback';
    process.env.WEB_URL = process.env.WEB_URL ?? 'http://localhost:3000';
    process.env.SESSION_SECRET =
      process.env.SESSION_SECRET ?? 'e2e-yandex-session-secret';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  beforeEach(async () => {
    await prisma.account.deleteMany({
      where: { user: { email: { in: yandexEmails } } },
    });
    await prisma.user.deleteMany({
      where: { email: { in: yandexEmails } },
    });
  });

  afterAll(async () => {
    await prisma.account.deleteMany({
      where: { user: { email: { in: yandexEmails } } },
    });
    await prisma.user.deleteMany({
      where: { email: { in: yandexEmails } },
    });
    await app.close();
    await prisma.$disconnect();
  });

  it('GET /auth/yandex redirects to callback with test code', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/yandex')
      .redirects(0)
      .expect(302);

    const location = response.headers.location;
    expect(typeof location).toBe('string');
    const params = parseLocationQuery(String(location));
    expect(params.get('code')).toBe(OAUTH_TEST_CODE_PREFIX);
    expect(params.get('state')).toBeTruthy();
  });

  it('first Yandex login creates User+Account and sets session cookie', async () => {
    const code = OAUTH_TEST_CODE_PREFIX;
    const response = await request(app.getHttpServer())
      .get('/auth/yandex/callback')
      .query({ code })
      .redirects(0)
      .expect(302);

    expect(response.headers.location).toBe('http://localhost:3000/');
    const cookie = response.headers['set-cookie'];
    expect(cookie?.[0]).toMatch(/^session=/);
    expect(cookie?.[0]).toMatch(/HttpOnly/);

    const stored = await prisma.user.findUnique({
      where: { email: 'yandex-oauth-test@bookspace.local' },
      include: { accounts: true },
    });
    expect(stored).toBeTruthy();
    expect(stored?.passwordHash).toBeNull();
    expect(stored?.accounts).toHaveLength(1);
    expect(stored?.accounts[0]).toMatchObject({
      provider: 'yandex',
      providerAccountId: 'yandex-test-id',
    });

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Cookie', cookie ?? [])
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          email: 'yandex-oauth-test@bookspace.local',
          role: 'USER',
        });
      });
  });

  it('repeat Yandex login recognizes the same account', async () => {
    const code = `${OAUTH_TEST_CODE_PREFIX}:yandex-e2e-repeat@bookspace.local:ya-sub-repeat`;

    const first = await request(app.getHttpServer())
      .get('/auth/yandex/callback')
      .query({ code })
      .redirects(0)
      .expect(302);

    const firstUser = await prisma.user.findUnique({
      where: { email: 'yandex-e2e-repeat@bookspace.local' },
    });
    expect(firstUser).toBeTruthy();

    const second = await request(app.getHttpServer())
      .get('/auth/yandex/callback')
      .query({ code })
      .redirects(0)
      .expect(302);

    const users = await prisma.user.findMany({
      where: { email: 'yandex-e2e-repeat@bookspace.local' },
    });
    expect(users).toHaveLength(1);
    expect(users[0]?.id).toBe(firstUser?.id);

    const accounts = await prisma.account.findMany({
      where: {
        provider: 'yandex',
        providerAccountId: 'ya-sub-repeat',
      },
    });
    expect(accounts).toHaveLength(1);

    expect(first.headers['set-cookie']?.[0]).toMatch(/^session=/);
    expect(second.headers['set-cookie']?.[0]).toMatch(/^session=/);
  });

  it('links Yandex Account to existing User with same email', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .set('X-E2E', '1')
      .send({
        email: 'yandex-e2e-link@bookspace.local',
        password: 'Secure123!',
      })
      .expect(201);

    const existing = await prisma.user.findUnique({
      where: { email: 'yandex-e2e-link@bookspace.local' },
    });
    expect(existing?.passwordHash).toBeTruthy();

    const code = `${OAUTH_TEST_CODE_PREFIX}:yandex-e2e-link@bookspace.local:ya-sub-link`;
    await request(app.getHttpServer())
      .get('/auth/yandex/callback')
      .query({ code })
      .redirects(0)
      .expect(302);

    const linked = await prisma.user.findUnique({
      where: { email: 'yandex-e2e-link@bookspace.local' },
      include: { accounts: true },
    });
    expect(linked?.id).toBe(existing?.id);
    expect(linked?.accounts).toHaveLength(1);
    expect(linked?.accounts[0]?.providerAccountId).toBe('ya-sub-link');
    expect(linked?.accounts[0]?.provider).toBe('yandex');
  });

  it('cancel (access_denied) redirects to /auth/error with reason and provider', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/yandex/callback')
      .query({ error: 'access_denied' })
      .redirects(0)
      .expect(302);

    expect(response.headers.location).toBe(
      'http://localhost:3000/auth/error?reason=access_denied&provider=yandex',
    );
  });
});

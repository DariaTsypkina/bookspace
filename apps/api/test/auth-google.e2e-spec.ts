import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { OAUTH_TEST_CODE_PREFIX } from '../src/auth/google-oauth.constants';

const prisma = new PrismaClient();

function parseLocationQuery(location: string): URLSearchParams {
  const url = new URL(location);
  return url.searchParams;
}

describe('Auth Google OAuth (e2e)', () => {
  let app: INestApplication<App>;

  const googleEmails = [
    'google-oauth-test@bookspace.local',
    'google-e2e-link@bookspace.local',
    'google-e2e-repeat@bookspace.local',
  ];

  beforeAll(async () => {
    process.env.OAUTH_TEST_MODE = 'true';
    process.env.GOOGLE_CALLBACK_URL =
      'http://localhost:8000/auth/google/callback';
    process.env.WEB_URL = process.env.WEB_URL ?? 'http://localhost:3000';
    process.env.SESSION_SECRET =
      process.env.SESSION_SECRET ?? 'e2e-google-session-secret';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  beforeEach(async () => {
    await prisma.account.deleteMany({
      where: { user: { email: { in: googleEmails } } },
    });
    await prisma.user.deleteMany({
      where: { email: { in: googleEmails } },
    });
  });

  afterAll(async () => {
    await prisma.account.deleteMany({
      where: { user: { email: { in: googleEmails } } },
    });
    await prisma.user.deleteMany({
      where: { email: { in: googleEmails } },
    });
    await app.close();
    await prisma.$disconnect();
  });

  it('GET /auth/google redirects to callback with test code', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/google')
      .redirects(0)
      .expect(302);

    const location = response.headers.location;
    expect(typeof location).toBe('string');
    const params = parseLocationQuery(String(location));
    expect(params.get('code')).toBe(OAUTH_TEST_CODE_PREFIX);
    expect(params.get('state')).toBeTruthy();
  });

  it('first Google login creates User+Account and sets session cookie', async () => {
    const code = OAUTH_TEST_CODE_PREFIX;
    const response = await request(app.getHttpServer())
      .get('/auth/google/callback')
      .query({ code })
      .redirects(0)
      .expect(302);

    expect(response.headers.location).toBe('http://localhost:3000/');
    const cookie = response.headers['set-cookie'];
    expect(cookie?.[0]).toMatch(/^session=/);
    expect(cookie?.[0]).toMatch(/HttpOnly/);

    const stored = await prisma.user.findUnique({
      where: { email: 'google-oauth-test@bookspace.local' },
      include: { accounts: true },
    });
    expect(stored).toBeTruthy();
    expect(stored?.passwordHash).toBeNull();
    expect(stored?.accounts).toHaveLength(1);
    expect(stored?.accounts[0]).toMatchObject({
      provider: 'google',
      providerAccountId: 'google-test-sub',
    });

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Cookie', cookie ?? [])
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          email: 'google-oauth-test@bookspace.local',
          role: 'USER',
        });
      });
  });

  it('repeat Google login recognizes the same account', async () => {
    const code = `${OAUTH_TEST_CODE_PREFIX}:google-e2e-repeat@bookspace.local:sub-repeat`;

    const first = await request(app.getHttpServer())
      .get('/auth/google/callback')
      .query({ code })
      .redirects(0)
      .expect(302);

    const firstUser = await prisma.user.findUnique({
      where: { email: 'google-e2e-repeat@bookspace.local' },
    });
    expect(firstUser).toBeTruthy();

    const second = await request(app.getHttpServer())
      .get('/auth/google/callback')
      .query({ code })
      .redirects(0)
      .expect(302);

    const users = await prisma.user.findMany({
      where: { email: 'google-e2e-repeat@bookspace.local' },
    });
    expect(users).toHaveLength(1);
    expect(users[0]?.id).toBe(firstUser?.id);

    const accounts = await prisma.account.findMany({
      where: {
        provider: 'google',
        providerAccountId: 'sub-repeat',
      },
    });
    expect(accounts).toHaveLength(1);

    expect(first.headers['set-cookie']?.[0]).toMatch(/^session=/);
    expect(second.headers['set-cookie']?.[0]).toMatch(/^session=/);
  });

  it('links Google Account to existing User with same email', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'google-e2e-link@bookspace.local',
        password: 'Secure123!',
      })
      .expect(201);

    const existing = await prisma.user.findUnique({
      where: { email: 'google-e2e-link@bookspace.local' },
    });
    expect(existing?.passwordHash).toBeTruthy();

    const code = `${OAUTH_TEST_CODE_PREFIX}:google-e2e-link@bookspace.local:sub-link`;
    await request(app.getHttpServer())
      .get('/auth/google/callback')
      .query({ code })
      .redirects(0)
      .expect(302);

    const linked = await prisma.user.findUnique({
      where: { email: 'google-e2e-link@bookspace.local' },
      include: { accounts: true },
    });
    expect(linked?.id).toBe(existing?.id);
    expect(linked?.accounts).toHaveLength(1);
    expect(linked?.accounts[0]?.providerAccountId).toBe('sub-link');
  });

  it('cancel (access_denied) redirects to /auth/error with reason', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/google/callback')
      .query({ error: 'access_denied' })
      .redirects(0)
      .expect(302);

    expect(response.headers.location).toBe(
      'http://localhost:3000/auth/error?reason=access_denied',
    );
  });
});

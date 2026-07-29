import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap';

const prisma = new PrismaClient();
type ValidationErrorItem = { code: string; path: string; message: string };
type ValidationErrorResponse = {
  code: string;
  errors: ValidationErrorItem[];
};

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  const api = () => request(app.getHttpServer());
  const authPost = (path: string) => api().post(path).set('X-E2E', '1');

  beforeAll(async () => {
    process.env.E2E_THROTTLE_BYPASS = 'true';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  const e2eEmails = [
    'e2e-new@bookspace.local',
    'e2e-dup@bookspace.local',
    'e2e-session@bookspace.local',
    'e2e-library-val@bookspace.local',
    'e2e-admin-user@bookspace.local',
  ];

  beforeEach(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: e2eEmails } },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: e2eEmails } },
    });
    await app.close();
    await prisma.$disconnect();
  });

  it('POST /auth/register creates USER without returning password', async () => {
    const response = await authPost('/auth/register')
      .send({
        email: 'e2e-new@bookspace.local',
        password: 'Secure123!',
      })
      .expect(201);

    expect(response.body).toMatchObject({
      email: 'e2e-new@bookspace.local',
      role: 'USER',
      slug: 'e2e-new',
    });
    expect(response.body).not.toHaveProperty('passwordHash');
    expect(response.body).not.toHaveProperty('password');

    const stored = await prisma.user.findUnique({
      where: { email: 'e2e-new@bookspace.local' },
    });
    expect(stored?.role).toBe('USER');
    expect(stored?.slug).toBe('e2e-new');
    expect(stored?.passwordHash).not.toBe('Secure123!');
  });

  it('POST /auth/register rejects weak password', async () => {
    await authPost('/auth/register')
      .send({
        email: 'e2e-new@bookspace.local',
        password: 'weak',
      })
      .expect(400);
  });

  it('POST /auth/register returns normalized validation errors', async () => {
    const response = await authPost('/auth/register')
      .send({
        email: 'bad-email',
        password: 12345,
      })
      .expect(400);

    const body = response.body as ValidationErrorResponse;
    expect(body.code).toBe('VALIDATION_FAILED');
    const emailIssue = body.errors.find((issue) => issue.path === 'email');
    const passwordIssue = body.errors.find(
      (issue) => issue.path === 'password',
    );
    expect(emailIssue).toBeDefined();
    expect(passwordIssue).toBeDefined();
    expect(emailIssue?.code.length).toBeGreaterThan(0);
    expect(passwordIssue?.code.length).toBeGreaterThan(0);
    expect(emailIssue?.message.length).toBeGreaterThan(0);
    expect(passwordIssue?.message.length).toBeGreaterThan(0);
  });

  it('POST /auth/register rejects duplicate email', async () => {
    await authPost('/auth/register')
      .send({
        email: 'e2e-dup@bookspace.local',
        password: 'Secure123!',
      })
      .expect(201);

    await authPost('/auth/register')
      .send({
        email: 'e2e-dup@bookspace.local',
        password: 'Secure123!',
      })
      .expect(409);
  });

  it('POST /auth/login issues session cookie and returns user', async () => {
    await authPost('/auth/register')
      .send({
        email: 'e2e-new@bookspace.local',
        password: 'Secure123!',
      })
      .expect(201);

    const response = await authPost('/auth/login')
      .send({
        email: 'e2e-new@bookspace.local',
        password: 'Secure123!',
      })
      .expect(200);

    const cookie = response.headers['set-cookie'];
    expect(cookie).toBeDefined();
    expect(cookie?.[0]).toMatch(/^session=/);
    expect(cookie?.[0]).toMatch(/HttpOnly/);
    const body = response.body as {
      user: { email: string; role: string; slug: string };
    };
    expect(body.user).toMatchObject({
      email: 'e2e-new@bookspace.local',
      role: 'USER',
      slug: 'e2e-new',
    });
    expect(response.body as Record<string, unknown>).not.toHaveProperty(
      'passwordHash',
    );
  });

  it('GET /auth/me returns user for valid session cookie', async () => {
    await authPost('/auth/register')
      .send({
        email: 'e2e-new@bookspace.local',
        password: 'Secure123!',
      })
      .expect(201);

    const login = await authPost('/auth/login')
      .send({
        email: 'e2e-new@bookspace.local',
        password: 'Secure123!',
      })
      .expect(200);

    const cookie = login.headers['set-cookie'];
    expect(cookie).toBeDefined();

    const me = await api()
      .get('/auth/me')
      .set('Cookie', cookie ?? [])
      .expect(200);

    expect(me.body).toMatchObject({
      email: 'e2e-new@bookspace.local',
      role: 'USER',
      slug: 'e2e-new',
    });
  });

  it('GET /auth/me rejects guest without cookie', async () => {
    await api().get('/auth/me').expect(401);
  });

  it('POST /auth/login rejects invalid credentials', async () => {
    await authPost('/auth/login')
      .send({
        email: 'missing@bookspace.local',
        password: 'Secure123!',
      })
      .expect(401);
  });

  it('POST /auth/login validates payload with normalized errors', async () => {
    const response = await authPost('/auth/login')
      .send({
        email: 'bad-email',
        password: 'short',
      })
      .expect(400);

    const body = response.body as ValidationErrorResponse;
    expect(body.code).toBe('VALIDATION_FAILED');
    const emailIssue = body.errors.find((issue) => issue.path === 'email');
    const passwordIssue = body.errors.find(
      (issue) => issue.path === 'password',
    );
    expect(emailIssue).toBeDefined();
    expect(passwordIssue).toBeDefined();
    expect(emailIssue?.message.length).toBeGreaterThan(0);
    expect(passwordIssue?.message.length).toBeGreaterThan(0);
  });

  it('POST /auth/logout clears cookie and invalidates session token', async () => {
    await authPost('/auth/register')
      .send({
        email: 'e2e-session@bookspace.local',
        password: 'Secure123!',
      })
      .expect(201);

    const login = await authPost('/auth/login')
      .send({
        email: 'e2e-session@bookspace.local',
        password: 'Secure123!',
      })
      .expect(200);

    const cookie = login.headers['set-cookie'];
    expect(cookie).toBeDefined();

    await api()
      .get('/auth/me')
      .set('Cookie', cookie ?? [])
      .expect(200);

    const logout = await api()
      .post('/auth/logout')
      .set('Cookie', cookie ?? [])
      .expect(200);

    expect(logout.body).toEqual({ ok: true });
    const cleared = logout.headers['set-cookie']?.[0] ?? '';
    expect(cleared).toMatch(/^session=/);
    expect(cleared).toMatch(/Max-Age=0|Expires=/i);

    await api()
      .get('/auth/me')
      .set('Cookie', cookie ?? [])
      .expect(401);

    await api()
      .post('/me/library/items')
      .set('Cookie', cookie ?? [])
      .send({ workId: 'work-1' })
      .expect(401);
  });

  it('POST /me/library/items requires session; succeeds with cookie', async () => {
    await api()
      .post('/me/library/items')
      .send({ workId: 'work-guest' })
      .expect(401);

    await authPost('/auth/register')
      .send({
        email: 'e2e-session@bookspace.local',
        password: 'Secure123!',
      })
      .expect(201);

    const login = await authPost('/auth/login')
      .send({
        email: 'e2e-session@bookspace.local',
        password: 'Secure123!',
      })
      .expect(200);

    const cookie = login.headers['set-cookie'];

    const created = await api()
      .post('/me/library/items')
      .set('Cookie', cookie ?? [])
      .send({ workId: 'work-1' })
      .expect(201);

    expect(created.body).toMatchObject({
      ok: true,
      workId: 'work-1',
    });
    expect(created.body).toHaveProperty('userId');
  });

  it('POST /me/library/items rejects oversized workId with VALIDATION_FAILED', async () => {
    await authPost('/auth/register')
      .send({
        email: 'e2e-library-val@bookspace.local',
        password: 'Secure123!',
      })
      .expect(201);

    const login = await authPost('/auth/login')
      .send({
        email: 'e2e-library-val@bookspace.local',
        password: 'Secure123!',
      })
      .expect(200);

    const response = await api()
      .post('/me/library/items')
      .set('Cookie', login.headers['set-cookie'] ?? [])
      .send({ workId: 'w'.repeat(129) })
      .expect(400);

    const body = response.body as ValidationErrorResponse;
    expect(body.code).toBe('VALIDATION_FAILED');
    expect(body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: 'workId' })]),
    );
  });

  it('GET /admin/ping rejects USER with 403 and allows ADMIN', async () => {
    await authPost('/auth/register')
      .send({
        email: 'e2e-admin-user@bookspace.local',
        password: 'Secure123!',
      })
      .expect(201);

    const userLogin = await authPost('/auth/login')
      .send({
        email: 'e2e-admin-user@bookspace.local',
        password: 'Secure123!',
      })
      .expect(200);

    await api()
      .get('/admin/ping')
      .set('Cookie', userLogin.headers['set-cookie'] ?? [])
      .expect(403);

    await prisma.user.update({
      where: { email: 'e2e-admin-user@bookspace.local' },
      data: { role: 'ADMIN' },
    });

    const adminLogin = await authPost('/auth/login')
      .send({
        email: 'e2e-admin-user@bookspace.local',
        password: 'Secure123!',
      })
      .expect(200);

    const ping = await api()
      .get('/admin/ping')
      .set('Cookie', adminLogin.headers['set-cookie'] ?? [])
      .expect(200);

    expect(ping.body).toEqual({ ok: true });
  });
});

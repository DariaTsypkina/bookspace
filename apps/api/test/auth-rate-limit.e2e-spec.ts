import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Auth rate limit (e2e)', () => {
  let app: INestApplication<App>;
  const originalEnv = { ...process.env };

  beforeAll(async () => {
    process.env.AUTH_RATE_LIMIT_REGISTER_MAX = '2';
    process.env.AUTH_RATE_LIMIT_REGISTER_WINDOW_MS = '60000';
    process.env.AUTH_RATE_LIMIT_LOGIN_MAX = '2';
    process.env.AUTH_RATE_LIMIT_LOGIN_WINDOW_MS = '60000';
    delete process.env.E2E_THROTTLE_BYPASS;

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

  afterAll(async () => {
    await app.close();
    process.env = originalEnv;
  });

  it('POST /auth/register returns 429 after limit exceeded', async () => {
    const server = app.getHttpServer();

    await request(server)
      .post('/auth/register')
      .send({ email: 'rl-a@bookspace.local', password: 'weak' })
      .expect(400);

    await request(server)
      .post('/auth/register')
      .send({ email: 'rl-b@bookspace.local', password: 'weak' })
      .expect(400);

    const blocked = await request(server)
      .post('/auth/register')
      .send({ email: 'rl-c@bookspace.local', password: 'Secure123!' })
      .expect(429);

    expect(blocked.body).toMatchObject({
      message: 'Слишком много попыток. Попробуйте позже.',
    });
  });

  it('POST /auth/login returns 429 after limit exceeded', async () => {
    const server = app.getHttpServer();

    await request(server)
      .post('/auth/login')
      .send({ email: 'missing@bookspace.local', password: 'Secure123!' })
      .expect(401);

    await request(server)
      .post('/auth/login')
      .send({ email: 'missing2@bookspace.local', password: 'Secure123!' })
      .expect(401);

    const blocked = await request(server)
      .post('/auth/login')
      .send({ email: 'missing3@bookspace.local', password: 'Secure123!' })
      .expect(429);

    expect(blocked.body).toMatchObject({
      message: 'Слишком много попыток. Попробуйте позже.',
    });
  });

  it('allows legitimate register/login within limit when bypass enabled', async () => {
    process.env.E2E_THROTTLE_BYPASS = 'true';
    const email = `rl-ok-${Date.now()}@bookspace.local`;
    const server = app.getHttpServer();

    await request(server)
      .post('/auth/register')
      .set('X-E2E', '1')
      .send({ email, password: 'Secure123!' })
      .expect(201);

    await request(server)
      .post('/auth/login')
      .set('X-E2E', '1')
      .send({ email, password: 'Secure123!' })
      .expect(200);

    delete process.env.E2E_THROTTLE_BYPASS;
  });
});

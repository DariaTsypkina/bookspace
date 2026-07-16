import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '../src/app.module';

const prisma = new PrismaClient();

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
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
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['e2e-new@bookspace.local', 'e2e-dup@bookspace.local'],
        },
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['e2e-new@bookspace.local', 'e2e-dup@bookspace.local'],
        },
      },
    });
    await app.close();
    await prisma.$disconnect();
  });

  it('POST /auth/register creates USER without returning password', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'e2e-new@bookspace.local',
        password: 'Secure123!',
      })
      .expect(201);

    expect(response.body).toMatchObject({
      email: 'e2e-new@bookspace.local',
      role: 'USER',
    });
    expect(response.body).not.toHaveProperty('passwordHash');
    expect(response.body).not.toHaveProperty('password');

    const stored = await prisma.user.findUnique({
      where: { email: 'e2e-new@bookspace.local' },
    });
    expect(stored?.role).toBe('USER');
    expect(stored?.passwordHash).not.toBe('Secure123!');
  });

  it('POST /auth/register rejects weak password', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'e2e-new@bookspace.local',
        password: 'weak',
      })
      .expect(400);
  });

  it('POST /auth/register rejects duplicate email', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'e2e-dup@bookspace.local',
        password: 'Secure123!',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'e2e-dup@bookspace.local',
        password: 'Secure123!',
      })
      .expect(409);
  });

  it('POST /auth/login issues session cookie and returns user', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'e2e-new@bookspace.local',
        password: 'Secure123!',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/auth/login')
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
      user: { email: string; role: string };
    };
    expect(body.user).toMatchObject({
      email: 'e2e-new@bookspace.local',
      role: 'USER',
    });
    expect(response.body as Record<string, unknown>).not.toHaveProperty(
      'passwordHash',
    );
  });

  it('POST /auth/login rejects invalid credentials', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'missing@bookspace.local',
        password: 'Secure123!',
      })
      .expect(401);
  });
});

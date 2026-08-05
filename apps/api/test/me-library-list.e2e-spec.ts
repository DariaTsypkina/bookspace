import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaClient, WorkStatus } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap';

const prisma = new PrismaClient();
const TEST_PREFIX = 'me-lib-list-e2e';

async function cleanup() {
  await prisma.userBook.deleteMany({
    where: {
      OR: [
        { user: { email: { startsWith: `${TEST_PREFIX}-` } } },
        { work: { slug: { startsWith: TEST_PREFIX } } },
      ],
    },
  });
  await prisma.work.deleteMany({
    where: { slug: { startsWith: TEST_PREFIX } },
  });
  await prisma.user.deleteMany({
    where: { email: { startsWith: `${TEST_PREFIX}-` } },
  });
}

describe('Me library list (e2e) bd-cq7.4', () => {
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

  beforeEach(async () => {
    await cleanup();
  });

  afterAll(async () => {
    await cleanup();
    await app.close();
    await prisma.$disconnect();
  });

  async function registerAndLogin(email: string) {
    await authPost('/auth/register')
      .send({ email, password: 'Secure123!' })
      .expect(201);
    const login = await authPost('/auth/login')
      .send({ email, password: 'Secure123!' })
      .expect(200);
    return login.headers['set-cookie'] as unknown as string[];
  }

  it('guest 401; owner lists all and filters by status', async () => {
    await api().get('/me/library').expect(401);

    const workA = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-a`,
        titleRu: 'Книга А',
        status: WorkStatus.PUBLISHED,
      },
    });
    const workB = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-b`,
        titleRu: 'Книга Б',
        status: WorkStatus.PUBLISHED,
      },
    });

    const cookie = await registerAndLogin(
      `${TEST_PREFIX}-user@bookspace.local`,
    );

    await api()
      .post('/me/library/items')
      .set('Cookie', cookie)
      .set('X-E2E', '1')
      .send({ workSlug: workA.slug, status: 'WANT', rating: 5 })
      .expect(201);
    await api()
      .post('/me/library/items')
      .set('Cookie', cookie)
      .set('X-E2E', '1')
      .send({ workSlug: workB.slug, status: 'READING' })
      .expect(201);

    const all = await api()
      .get('/me/library')
      .set('Cookie', cookie)
      .set('X-E2E', '1')
      .expect(200);
    const allBody = all.body as {
      items: Array<{ workSlug: string; status: string; titleRu: string }>;
    };
    expect(allBody.items).toHaveLength(2);

    const want = await api()
      .get('/me/library')
      .query({ status: 'WANT' })
      .set('Cookie', cookie)
      .set('X-E2E', '1')
      .expect(200);
    const wantBody = want.body as {
      items: Array<{ workSlug: string; status: string; titleRu: string }>;
    };
    expect(wantBody.items).toHaveLength(1);
    expect(wantBody.items[0]).toMatchObject({
      workSlug: workA.slug,
      status: 'WANT',
      titleRu: 'Книга А',
    });

    await api()
      .get('/me/library')
      .query({ status: 'NOT_A_STATUS' })
      .set('Cookie', cookie)
      .set('X-E2E', '1')
      .expect(400);
  });
});

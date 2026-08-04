import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaClient, UserRole, WorkStatus } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap';

const prisma = new PrismaClient();
const TEST_PREFIX = 'user-book-e2e';

type ValidationErrorResponse = {
  code: string;
  errors: { code: string; path: string; message: string }[];
};

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

describe('User book status/rating (e2e) bd-cq7.1', () => {
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
    return login.headers['set-cookie'] as string[];
  }

  async function seedWork(slug = `${TEST_PREFIX}-work`) {
    return prisma.work.create({
      data: {
        slug,
        titleRu: 'Е2Е книга',
        status: WorkStatus.PUBLISHED,
      },
    });
  }

  it('guest cannot mutate; USER upserts status+rating; public GET shows them', async () => {
    const work = await seedWork();

    await api()
      .post('/me/library/items')
      .send({ workSlug: work.slug, status: 'READING', rating: 6 })
      .expect(401);

    const cookie = await registerAndLogin(
      `${TEST_PREFIX}-user@bookspace.local`,
    );
    const user = await prisma.user.findUniqueOrThrow({
      where: { email: `${TEST_PREFIX}-user@bookspace.local` },
    });

    const created = await api()
      .post('/me/library/items')
      .set('Cookie', cookie)
      .set('X-E2E', '1')
      .send({ workSlug: work.slug, status: 'READING', rating: 6 })
      .expect(201);

    expect(created.body).toMatchObject({
      userId: user.id,
      workId: work.id,
      workSlug: work.slug,
      status: 'READING',
      rating: 6,
      finishedAt: null,
    });

    const put = await api()
      .put(`/me/library/works/${work.slug}`)
      .set('Cookie', cookie)
      .set('X-E2E', '1')
      .send({ status: 'READ', rating: 9 })
      .expect(200);

    expect(put.body.status).toBe('READ');
    expect(put.body.rating).toBe(9);
    expect(put.body.finishedAt).toBeTruthy();

    const pub = await api().get(`/users/${user.slug}/library`).expect(200);
    expect(pub.body.slug).toBe(user.slug);
    expect(pub.body.items).toEqual([
      expect.objectContaining({
        workSlug: work.slug,
        titleRu: 'Е2Е книга',
        status: 'READ',
        rating: 9,
      }),
    ]);
  });

  it('ADMIN can upsert; rating out of range → 400; missing work → 404', async () => {
    const work = await seedWork(`${TEST_PREFIX}-admin-work`);
    const email = `${TEST_PREFIX}-admin@bookspace.local`;
    const cookie = await registerAndLogin(email);
    await prisma.user.update({
      where: { email },
      data: { role: UserRole.ADMIN },
    });
    const adminLogin = await authPost('/auth/login')
      .send({ email, password: 'Secure123!' })
      .expect(200);
    const adminCookie = adminLogin.headers['set-cookie'] as string[];

    await api()
      .put(`/me/library/works/${work.slug}`)
      .set('Cookie', adminCookie)
      .set('X-E2E', '1')
      .send({ status: 'WANT' })
      .expect(200);

    const bad = await api()
      .post('/me/library/items')
      .set('Cookie', adminCookie)
      .set('X-E2E', '1')
      .send({ workSlug: work.slug, status: 'READ', rating: 11 })
      .expect(400);
    const body = bad.body as ValidationErrorResponse;
    expect(body.code).toBe('VALIDATION_FAILED');

    await api()
      .put(`/me/library/works/${TEST_PREFIX}-missing`)
      .set('Cookie', adminCookie)
      .set('X-E2E', '1')
      .send({ status: 'WANT' })
      .expect(404);
  });

  it('PATCH requires existing item; public 404 for missing/deleted user', async () => {
    const work = await seedWork(`${TEST_PREFIX}-patch-work`);
    const cookie = await registerAndLogin(
      `${TEST_PREFIX}-patch@bookspace.local`,
    );
    const user = await prisma.user.findUniqueOrThrow({
      where: { email: `${TEST_PREFIX}-patch@bookspace.local` },
    });

    await api()
      .patch(`/me/library/works/${work.slug}`)
      .set('Cookie', cookie)
      .set('X-E2E', '1')
      .send({ rating: 4 })
      .expect(404);

    await api()
      .put(`/me/library/works/${work.slug}`)
      .set('Cookie', cookie)
      .set('X-E2E', '1')
      .send({ status: 'READING' })
      .expect(200);

    const patched = await api()
      .patch(`/me/library/works/${work.slug}`)
      .set('Cookie', cookie)
      .set('X-E2E', '1')
      .send({ rating: 4 })
      .expect(200);
    expect(patched.body.rating).toBe(4);
    expect(patched.body.status).toBe('READING');

    await api().get(`/users/${TEST_PREFIX}-nope/library`).expect(404);

    await prisma.user.update({
      where: { id: user.id },
      data: { deletedAt: new Date() },
    });
    await api().get(`/users/${user.slug}/library`).expect(404);
  });
});

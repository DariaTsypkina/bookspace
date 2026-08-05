import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaClient, UserRole, WorkStatus } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap';

const prisma = new PrismaClient();
const TEST_PREFIX = 'user-tags-e2e';

async function cleanup() {
  await prisma.userBookTag.deleteMany({
    where: {
      OR: [
        { tag: { user: { email: { startsWith: `${TEST_PREFIX}-` } } } },
        { userBook: { user: { email: { startsWith: `${TEST_PREFIX}-` } } } },
        { userBook: { work: { slug: { startsWith: TEST_PREFIX } } } },
      ],
    },
  });
  await prisma.tag.deleteMany({
    where: {
      OR: [
        { user: { email: { startsWith: `${TEST_PREFIX}-` } } },
        { name: { startsWith: TEST_PREFIX } },
      ],
    },
  });
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

describe('User tags (e2e) bd-cq7.3', () => {
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
        titleRu: 'Е2Е тег книга',
        status: WorkStatus.PUBLISHED,
      },
    });
  }

  it('guest cannot mutate; USER CRUD + assign; public library shows tags', async () => {
    const work = await seedWork();

    await api().post('/me/tags').send({ name: 'фэнтези' }).expect(401);

    const cookie = await registerAndLogin(
      `${TEST_PREFIX}-user@bookspace.local`,
    );
    const user = await prisma.user.findUniqueOrThrow({
      where: { email: `${TEST_PREFIX}-user@bookspace.local` },
    });

    const created = await api()
      .post('/me/tags')
      .set('Cookie', cookie)
      .set('X-E2E', '1')
      .send({ name: `${TEST_PREFIX}-fantasy` })
      .expect(201);

    expect(created.body).toMatchObject({ name: `${TEST_PREFIX}-fantasy` });
    const createdBody = created.body as { id: string; name: string };

    await api()
      .post(`/me/library/works/${work.slug}/tags`)
      .set('Cookie', cookie)
      .set('X-E2E', '1')
      .send({ tagId: createdBody.id })
      .expect(400);

    await api()
      .post('/me/library/items')
      .set('Cookie', cookie)
      .set('X-E2E', '1')
      .send({ workSlug: work.slug, status: 'READING', rating: 8 })
      .expect(201);

    const assigned = await api()
      .post(`/me/library/works/${work.slug}/tags`)
      .set('Cookie', cookie)
      .set('X-E2E', '1')
      .send({ name: `${TEST_PREFIX}-classic` })
      .expect(201);
    const assignedBody = assigned.body as {
      tags: Array<{ name: string }>;
    };
    expect(assignedBody.tags).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: `${TEST_PREFIX}-classic` }),
      ]),
    );

    const pub = await api().get(`/users/${user.slug}/library`).expect(200);
    const pubBody = pub.body as {
      items: Array<{
        workSlug: string;
        tags: Array<{ name: string }>;
      }>;
    };
    expect(pubBody.items).toHaveLength(1);
    expect(pubBody.items[0].workSlug).toBe(work.slug);
    expect(pubBody.items[0].tags).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: `${TEST_PREFIX}-classic` }),
      ]),
    );

    await api()
      .delete(`/me/tags/${createdBody.id}`)
      .set('Cookie', cookie)
      .set('X-E2E', '1')
      .expect(204);

    expect(
      await prisma.userBook.findUnique({
        where: { userId_workId: { userId: user.id, workId: work.id } },
      }),
    ).toBeTruthy();
  });

  it('ADMIN can create tag; missing public user → 404', async () => {
    const email = `${TEST_PREFIX}-admin@bookspace.local`;
    await registerAndLogin(email);
    await prisma.user.update({
      where: { email },
      data: { role: UserRole.ADMIN },
    });
    const adminLogin = await authPost('/auth/login')
      .send({ email, password: 'Secure123!' })
      .expect(200);
    const adminCookie = adminLogin.headers['set-cookie'] as string[];

    await api()
      .post('/me/tags')
      .set('Cookie', adminCookie)
      .set('X-E2E', '1')
      .send({ name: `${TEST_PREFIX}-admin-tag` })
      .expect(201);

    await api().get(`/users/${TEST_PREFIX}-missing/library`).expect(404);
  });
});

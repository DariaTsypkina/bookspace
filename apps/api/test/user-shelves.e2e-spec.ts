import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaClient, UserRole, WorkStatus } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap';

const prisma = new PrismaClient();
const TEST_PREFIX = 'user-shelves-e2e';

async function cleanup() {
  await prisma.shelfItem.deleteMany({
    where: {
      OR: [
        { shelf: { user: { email: { startsWith: `${TEST_PREFIX}-` } } } },
        { work: { slug: { startsWith: TEST_PREFIX } } },
      ],
    },
  });
  await prisma.shelf.deleteMany({
    where: {
      OR: [
        { user: { email: { startsWith: `${TEST_PREFIX}-` } } },
        { slug: { startsWith: TEST_PREFIX } },
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

describe('User shelves (e2e) bd-cq7.2', () => {
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
        titleRu: 'Е2Е полка книга',
        status: WorkStatus.PUBLISHED,
      },
    });
  }

  it('guest cannot mutate; USER CRUD + items; public GET; delete keeps UserBook', async () => {
    const work = await seedWork();

    await api().post('/me/shelves').send({ title: 'Любимое' }).expect(401);

    const cookie = await registerAndLogin(
      `${TEST_PREFIX}-user@bookspace.local`,
    );
    const user = await prisma.user.findUniqueOrThrow({
      where: { email: `${TEST_PREFIX}-user@bookspace.local` },
    });

    const created = await api()
      .post('/me/shelves')
      .set('Cookie', cookie)
      .set('X-E2E', '1')
      .send({ title: 'Любимое', slug: `${TEST_PREFIX}-fav` })
      .expect(201);

    expect(created.body).toMatchObject({
      title: 'Любимое',
      slug: `${TEST_PREFIX}-fav`,
      itemCount: 0,
    });
    const createdBody = created.body as {
      id: string;
      title: string;
      slug: string;
      itemCount: number;
    };

    await api()
      .post(`/me/shelves/${createdBody.id}/items`)
      .set('Cookie', cookie)
      .set('X-E2E', '1')
      .send({ workSlug: work.slug })
      .expect(400);

    await api()
      .post('/me/library/items')
      .set('Cookie', cookie)
      .set('X-E2E', '1')
      .send({ workSlug: work.slug, status: 'READING', rating: 7 })
      .expect(201);

    const withItem = await api()
      .post(`/me/shelves/${createdBody.id}/items`)
      .set('Cookie', cookie)
      .set('X-E2E', '1')
      .send({ workSlug: work.slug })
      .expect(201);
    const withItemBody = withItem.body as { itemCount: number };
    expect(withItemBody.itemCount).toBe(1);

    const pub = await api().get(`/users/${user.slug}/shelves`).expect(200);
    const pubBody = pub.body as {
      shelves: Array<{ slug: string; title: string; itemCount: number }>;
    };
    expect(pubBody.shelves).toEqual([
      expect.objectContaining({
        slug: `${TEST_PREFIX}-fav`,
        title: 'Любимое',
        itemCount: 1,
      }),
    ]);

    const detail = await api()
      .get(`/users/${user.slug}/shelves/${TEST_PREFIX}-fav`)
      .expect(200);
    const detailBody = detail.body as {
      items: Array<{ workSlug: string; titleRu: string }>;
    };
    expect(detailBody.items).toEqual([
      expect.objectContaining({
        workSlug: work.slug,
        titleRu: 'Е2Е полка книга',
      }),
    ]);

    await api()
      .delete(`/me/shelves/${createdBody.id}`)
      .set('Cookie', cookie)
      .set('X-E2E', '1')
      .expect(204);

    expect(
      await prisma.userBook.findUnique({
        where: { userId_workId: { userId: user.id, workId: work.id } },
      }),
    ).toBeTruthy();

    await api()
      .get(`/users/${user.slug}/shelves`)
      .expect(200)
      .expect((res) => {
        const body = res.body as { shelves: unknown[] };
        expect(body.shelves).toEqual([]);
      });
  });

  it('ADMIN can create shelf; missing public user → 404', async () => {
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
      .post('/me/shelves')
      .set('Cookie', adminCookie)
      .set('X-E2E', '1')
      .send({ title: 'Админская' })
      .expect(201);

    await api().get(`/users/${TEST_PREFIX}-missing/shelves`).expect(404);
  });
});

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaClient, WorkStatus } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap';
import { filterPublicNotes } from '../src/me/public-notes';
import { toPublicReadingGoal } from '../src/me/public-reading-goal';

const prisma = new PrismaClient();
const TEST_PREFIX = 'public-profile-e2e';

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

describe('Public profile (e2e) bd-cq7.5', () => {
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

  it('guest can read library + work detail without auth; notes empty; goal null', async () => {
    const work = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-work`,
        titleRu: 'Публичная книга',
        status: WorkStatus.PUBLISHED,
      },
    });

    const cookie = await registerAndLogin(
      `${TEST_PREFIX}-user@bookspace.local`,
    );
    const user = await prisma.user.findUniqueOrThrow({
      where: { email: `${TEST_PREFIX}-user@bookspace.local` },
    });

    await api()
      .post('/me/library/items')
      .set('Cookie', cookie)
      .set('X-E2E', '1')
      .send({ workSlug: work.slug, status: 'READ', rating: 9 })
      .expect(201);

    const tag = await api()
      .post('/me/tags')
      .set('Cookie', cookie)
      .set('X-E2E', '1')
      .send({ name: `${TEST_PREFIX}-tag` })
      .expect(201);

    await api()
      .post(`/me/library/works/${work.slug}/tags`)
      .set('Cookie', cookie)
      .set('X-E2E', '1')
      .send({ tagId: tag.body.id })
      .expect(201);

    const library = await api().get(`/users/${user.slug}/library`).expect(200);
    expect(library.body.slug).toBe(user.slug);
    expect(library.body.items).toHaveLength(1);
    expect(library.body.items[0]).toMatchObject({
      workSlug: work.slug,
      status: 'READ',
      rating: 9,
      tags: [{ name: `${TEST_PREFIX}-tag` }],
    });
    expect(library.body.notes).toEqual([]);
    expect(library.body.goal).toBeNull();

    const detail = await api()
      .get(`/users/${user.slug}/library/works/${work.slug}`)
      .expect(200);
    expect(detail.body).toMatchObject({
      slug: user.slug,
      workSlug: work.slug,
      titleRu: 'Публичная книга',
      status: 'READ',
      rating: 9,
      tags: [{ name: `${TEST_PREFIX}-tag` }],
      notes: [],
    });

    await api()
      .get(`/users/${user.slug}/library/works/${TEST_PREFIX}-missing`)
      .expect(404);
    await api().get(`/users/${TEST_PREFIX}-nope/library`).expect(404);
  });

  it('PRIVATE notes never appear in public payload contract', () => {
    const leaked = filterPublicNotes([
      {
        id: 'priv',
        type: 'NOTE',
        body: 'private-secret-body',
        visibility: 'PRIVATE',
      },
      {
        id: 'pub',
        type: 'QUOTE',
        body: 'ok',
        visibility: 'PUBLIC',
      },
    ]);
    expect(leaked).toEqual([{ id: 'pub', type: 'QUOTE', body: 'ok' }]);
    expect(JSON.stringify(leaked)).not.toMatch(/private-secret|PRIVATE/);

    expect(
      toPublicReadingGoal({
        year: 2026,
        targetCount: 10,
        progressCount: 1,
        showOnProfile: false,
      }),
    ).toBeNull();
  });
});

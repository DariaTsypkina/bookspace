import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { CatalogEntityStatus, PrismaClient } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap';

const prisma = new PrismaClient();
const TEST_PREFIX = 'admin-cat-ent-e2e';

async function cleanup() {
  const series = await prisma.series.findMany({
    where: { slug: { startsWith: TEST_PREFIX } },
    select: { id: true },
  });
  const characters = await prisma.character.findMany({
    where: { slug: { startsWith: TEST_PREFIX } },
    select: { id: true },
  });
  const worlds = await prisma.world.findMany({
    where: { slug: { startsWith: TEST_PREFIX } },
    select: { id: true },
  });
  const places = await prisma.place.findMany({
    where: { slug: { startsWith: TEST_PREFIX } },
    select: { id: true },
  });

  const entityIds = [
    ...series.map((r) => r.id),
    ...characters.map((r) => r.id),
    ...worlds.map((r) => r.id),
    ...places.map((r) => r.id),
  ];

  if (entityIds.length > 0) {
    await prisma.auditLog.deleteMany({
      where: {
        entityType: { in: ['Series', 'Character', 'World', 'Place'] },
        entityId: { in: entityIds },
      },
    });
  }

  await prisma.place.deleteMany({
    where: { slug: { startsWith: TEST_PREFIX } },
  });
  await prisma.world.deleteMany({
    where: { slug: { startsWith: TEST_PREFIX } },
  });
  await prisma.character.deleteMany({
    where: { slug: { startsWith: TEST_PREFIX } },
  });
  await prisma.series.deleteMany({
    where: { slug: { startsWith: TEST_PREFIX } },
  });
}

describe('Admin catalog entities CRUD (e2e)', () => {
  let app: INestApplication<App>;
  let adminCookie: string[];
  let userCookie: string[];

  beforeAll(async () => {
    process.env.JOBS_SYNC = 'true';
    process.env.E2E_THROTTLE_BYPASS = 'true';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();

    await request(app.getHttpServer())
      .post('/auth/register')
      .set('X-E2E', '1')
      .send({
        email: 'e2e-admin-cat-ent@bookspace.local',
        password: 'Secure123!',
      })
      .expect(201);

    await prisma.user.update({
      where: { email: 'e2e-admin-cat-ent@bookspace.local' },
      data: { role: 'ADMIN' },
    });

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .set('X-E2E', '1')
      .send({
        email: 'e2e-admin-cat-ent@bookspace.local',
        password: 'Secure123!',
      })
      .expect(200);

    const adminRaw = adminLogin.headers['set-cookie'];
    adminCookie = Array.isArray(adminRaw)
      ? adminRaw
      : adminRaw
        ? [adminRaw]
        : [];

    await request(app.getHttpServer())
      .post('/auth/register')
      .set('X-E2E', '1')
      .send({
        email: 'e2e-admin-cat-ent-user@bookspace.local',
        password: 'Secure123!',
      })
      .expect(201);

    const userLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .set('X-E2E', '1')
      .send({
        email: 'e2e-admin-cat-ent-user@bookspace.local',
        password: 'Secure123!',
      })
      .expect(200);

    const userRaw = userLogin.headers['set-cookie'];
    userCookie = Array.isArray(userRaw) ? userRaw : userRaw ? [userRaw] : [];
  });

  beforeEach(async () => {
    await cleanup();
  });

  afterAll(async () => {
    await cleanup();
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            'e2e-admin-cat-ent@bookspace.local',
            'e2e-admin-cat-ent-user@bookspace.local',
          ],
        },
      },
    });
    await app.close();
    await prisma.$disconnect();
  });

  it('admin CRUD series: DRAFT → publish → public; soft-delete hides', async () => {
    const create = await request(app.getHttpServer())
      .post('/admin/series')
      .set('Cookie', adminCookie)
      .set('X-E2E', '1')
      .send({ nameRu: 'Серия тест', slug: `${TEST_PREFIX}-series` })
      .expect(201);

    const created = create.body as {
      id: string;
      status: CatalogEntityStatus;
      slug: string;
    };
    expect(created.status).toBe(CatalogEntityStatus.DRAFT);

    await request(app.getHttpServer())
      .patch(`/admin/series/${created.id}`)
      .set('Cookie', adminCookie)
      .set('X-E2E', '1')
      .send({ nameOrig: 'Series Test' })
      .expect(200);

    await request(app.getHttpServer())
      .post(`/admin/series/${created.id}/publish`)
      .set('Cookie', adminCookie)
      .set('X-E2E', '1')
      .expect(201);

    await request(app.getHttpServer())
      .get(`/catalog/series/${TEST_PREFIX}-series`)
      .set('X-E2E', '1')
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/admin/series/${created.id}`)
      .set('Cookie', adminCookie)
      .set('X-E2E', '1')
      .expect(200);

    await request(app.getHttpServer())
      .get(`/catalog/series/${TEST_PREFIX}-series`)
      .set('X-E2E', '1')
      .expect(404);
  });

  it('admin CRUD character, world, place with publish and soft-delete', async () => {
    const world = await request(app.getHttpServer())
      .post('/admin/worlds')
      .set('Cookie', adminCookie)
      .set('X-E2E', '1')
      .send({
        nameRu: 'Мир тест',
        slug: `${TEST_PREFIX}-world`,
        descriptionRu: 'Описание',
      })
      .expect(201);
    const worldBody = world.body as { id: string };

    const character = await request(app.getHttpServer())
      .post('/admin/characters')
      .set('Cookie', adminCookie)
      .set('X-E2E', '1')
      .send({ nameRu: 'Персонаж тест', slug: `${TEST_PREFIX}-char` })
      .expect(201);
    const characterBody = character.body as { id: string };

    const place = await request(app.getHttpServer())
      .post('/admin/places')
      .set('Cookie', adminCookie)
      .set('X-E2E', '1')
      .send({
        nameRu: 'Локация тест',
        slug: `${TEST_PREFIX}-place`,
        worldId: worldBody.id,
      })
      .expect(201);
    const placeBody = place.body as { id: string; worldId: string };
    expect(placeBody.worldId).toBe(worldBody.id);

    for (const [path, id] of [
      ['worlds', worldBody.id],
      ['characters', characterBody.id],
      ['places', placeBody.id],
    ] as const) {
      await request(app.getHttpServer())
        .post(`/admin/${path}/${id}/publish`)
        .set('Cookie', adminCookie)
        .set('X-E2E', '1')
        .expect(201);
    }

    await request(app.getHttpServer())
      .get(`/catalog/worlds/${TEST_PREFIX}-world`)
      .set('X-E2E', '1')
      .expect(200);
    await request(app.getHttpServer())
      .get(`/catalog/characters/${TEST_PREFIX}-char`)
      .set('X-E2E', '1')
      .expect(200);
    await request(app.getHttpServer())
      .get(`/catalog/places/${TEST_PREFIX}-place`)
      .set('X-E2E', '1')
      .expect(200);

    for (const [path, id] of [
      ['places', placeBody.id],
      ['characters', characterBody.id],
      ['worlds', worldBody.id],
    ] as const) {
      await request(app.getHttpServer())
        .delete(`/admin/${path}/${id}`)
        .set('Cookie', adminCookie)
        .set('X-E2E', '1')
        .expect(200);
    }

    await request(app.getHttpServer())
      .get(`/catalog/worlds/${TEST_PREFIX}-world`)
      .set('X-E2E', '1')
      .expect(404);
  });

  it('non-admin gets 403 on entity admin endpoints', async () => {
    for (const path of ['series', 'characters', 'worlds', 'places']) {
      await request(app.getHttpServer())
        .get(`/admin/${path}`)
        .set('Cookie', userCookie)
        .set('X-E2E', '1')
        .expect(403);

      await request(app.getHttpServer())
        .post(`/admin/${path}`)
        .set('Cookie', userCookie)
        .set('X-E2E', '1')
        .send({ nameRu: 'Запрещено' })
        .expect(403);
    }
  });
});

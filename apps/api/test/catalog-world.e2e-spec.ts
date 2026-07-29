import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaClient, WorkStatus } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap';
import type { CatalogWorldResponse } from '../src/catalog/catalog-world.types';

const prisma = new PrismaClient();
const TEST_PREFIX = 'catalog-world-e2e';

async function cleanup() {
  await prisma.workPlace.deleteMany({
    where: {
      OR: [
        { work: { slug: { startsWith: TEST_PREFIX } } },
        { place: { slug: { startsWith: TEST_PREFIX } } },
      ],
    },
  });
  await prisma.work.deleteMany({
    where: { slug: { startsWith: TEST_PREFIX } },
  });
  await prisma.place.deleteMany({
    where: { slug: { startsWith: TEST_PREFIX } },
  });
  await prisma.world.deleteMany({
    where: { slug: { startsWith: TEST_PREFIX } },
  });
}

describe('Catalog world (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
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

  it('GET /catalog/worlds/:slug returns published world for guest', async () => {
    const world = await prisma.world.create({
      data: {
        slug: `${TEST_PREFIX}-wizarding`,
        nameRu: 'Волшебный мир',
        nameOrig: 'Wizarding World',
        descriptionRu: 'Мир волшебников.',
        status: 'PUBLISHED',
      },
    });
    const hogwarts = await prisma.place.create({
      data: {
        slug: `${TEST_PREFIX}-hogwarts`,
        nameRu: 'Хогвартс',
        nameOrig: 'Hogwarts',
        status: 'PUBLISHED',
        worldId: world.id,
      },
    });
    const work = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-book`,
        titleRu: 'Книга в этом мире',
        yearFirst: 1997,
        status: WorkStatus.PUBLISHED,
        places: {
          create: { placeId: hogwarts.id },
        },
      },
    });

    const response = await request(app.getHttpServer())
      .get(`/catalog/worlds/${world.slug}`)
      .expect(200);

    const body = response.body as CatalogWorldResponse;
    expect(body).toMatchObject({
      slug: world.slug,
      nameRu: 'Волшебный мир',
      nameOrig: 'Wizarding World',
      descriptionRu: 'Мир волшебников.',
      places: [
        {
          slug: hogwarts.slug,
          nameRu: 'Хогвартс',
          nameOrig: 'Hogwarts',
        },
      ],
      works: [
        {
          slug: work.slug,
          titleRu: 'Книга в этом мире',
          yearFirst: 1997,
        },
      ],
    });
  });

  it('GET /catalog/worlds/:slug returns empty lists when no places or works', async () => {
    const world = await prisma.world.create({
      data: {
        slug: `${TEST_PREFIX}-empty`,
        nameRu: 'Пустой мир',
        status: 'PUBLISHED',
      },
    });

    const response = await request(app.getHttpServer())
      .get(`/catalog/worlds/${world.slug}`)
      .expect(200);

    const body = response.body as CatalogWorldResponse;
    expect(body.places).toEqual([]);
    expect(body.works).toEqual([]);
  });

  it('GET /catalog/worlds/:slug returns 404 for draft world', async () => {
    const world = await prisma.world.create({
      data: {
        slug: `${TEST_PREFIX}-draft`,
        nameRu: 'Черновик',
        status: 'DRAFT',
      },
    });

    await request(app.getHttpServer())
      .get(`/catalog/worlds/${world.slug}`)
      .expect(404);
  });

  it('GET /catalog/worlds/:slug returns 404 for unknown slug', async () => {
    await request(app.getHttpServer())
      .get(`/catalog/worlds/${TEST_PREFIX}-missing`)
      .expect(404);
  });
});

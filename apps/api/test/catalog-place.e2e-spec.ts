import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaClient, WorkStatus } from '@prisma/client';
import { AppModule } from '../src/app.module';
import type { CatalogPlaceResponse } from '../src/catalog/catalog-place.types';

const prisma = new PrismaClient();
const TEST_PREFIX = 'catalog-place-e2e';

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

describe('Catalog place (e2e)', () => {
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
    await cleanup();
  });

  afterAll(async () => {
    await cleanup();
    await app.close();
    await prisma.$disconnect();
  });

  it('GET /catalog/places/:slug returns published place for guest', async () => {
    const world = await prisma.world.create({
      data: {
        slug: `${TEST_PREFIX}-wizarding`,
        nameRu: 'Волшебный мир',
        nameOrig: 'Wizarding World',
        status: 'PUBLISHED',
      },
    });
    const place = await prisma.place.create({
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
        titleRu: 'Книга в этой локации',
        yearFirst: 1997,
        status: WorkStatus.PUBLISHED,
        places: {
          create: { placeId: place.id },
        },
      },
    });

    const response = await request(app.getHttpServer())
      .get(`/catalog/places/${place.slug}`)
      .expect(200);

    const body = response.body as CatalogPlaceResponse;
    expect(body).toMatchObject({
      slug: place.slug,
      nameRu: 'Хогвартс',
      nameOrig: 'Hogwarts',
      world: {
        slug: world.slug,
        nameRu: 'Волшебный мир',
        nameOrig: 'Wizarding World',
      },
      works: [
        {
          slug: work.slug,
          titleRu: 'Книга в этой локации',
          yearFirst: 1997,
        },
      ],
    });
  });

  it('GET /catalog/places/:slug returns place without world when worldId is null', async () => {
    const place = await prisma.place.create({
      data: {
        slug: `${TEST_PREFIX}-standalone`,
        nameRu: 'Одиночная локация',
        status: 'PUBLISHED',
      },
    });

    const response = await request(app.getHttpServer())
      .get(`/catalog/places/${place.slug}`)
      .expect(200);

    const body = response.body as CatalogPlaceResponse;
    expect(body.world).toBeUndefined();
    expect(body.works).toEqual([]);
  });

  it('GET /catalog/places/:slug returns 404 for draft place', async () => {
    const place = await prisma.place.create({
      data: {
        slug: `${TEST_PREFIX}-draft`,
        nameRu: 'Черновик',
        status: 'DRAFT',
      },
    });

    await request(app.getHttpServer())
      .get(`/catalog/places/${place.slug}`)
      .expect(404);
  });

  it('GET /catalog/places/:slug returns 404 for unknown slug', async () => {
    await request(app.getHttpServer())
      .get(`/catalog/places/${TEST_PREFIX}-missing`)
      .expect(404);
  });
});

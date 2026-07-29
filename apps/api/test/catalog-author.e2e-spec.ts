import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaClient, WorkStatus } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap';
import type { CatalogAuthorResponse } from '../src/catalog/catalog-author.types';

const prisma = new PrismaClient();
const TEST_PREFIX = 'catalog-author-e2e';

async function cleanup() {
  await prisma.workAuthor.deleteMany({
    where: {
      OR: [
        { work: { slug: { startsWith: TEST_PREFIX } } },
        { author: { slug: { startsWith: TEST_PREFIX } } },
      ],
    },
  });
  await prisma.work.deleteMany({
    where: { slug: { startsWith: TEST_PREFIX } },
  });
  await prisma.author.deleteMany({
    where: { slug: { startsWith: TEST_PREFIX } },
  });
}

describe('Catalog author (e2e)', () => {
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

  it('GET /catalog/authors/:slug returns published author for guest', async () => {
    const author = await prisma.author.create({
      data: {
        slug: `${TEST_PREFIX}-author`,
        nameRu: 'Лев Толстой',
        nameOrig: 'Leo Tolstoy',
        status: 'PUBLISHED',
      },
    });
    const work = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-war-and-peace`,
        titleRu: 'Война и мир',
        yearFirst: 1869,
        status: WorkStatus.PUBLISHED,
        authors: {
          create: { authorId: author.id, position: 0 },
        },
      },
    });

    const response = await request(app.getHttpServer())
      .get(`/catalog/authors/${author.slug}`)
      .expect(200);

    const body = response.body as CatalogAuthorResponse;
    expect(body).toMatchObject({
      slug: author.slug,
      nameRu: 'Лев Толстой',
      nameOrig: 'Leo Tolstoy',
      works: [
        {
          slug: work.slug,
          titleRu: 'Война и мир',
          yearFirst: 1869,
        },
      ],
    });
  });

  it('GET /catalog/authors/:slug returns empty works list when no published books', async () => {
    const author = await prisma.author.create({
      data: {
        slug: `${TEST_PREFIX}-empty`,
        nameRu: 'Автор без книг',
        status: 'PUBLISHED',
      },
    });

    const response = await request(app.getHttpServer())
      .get(`/catalog/authors/${author.slug}`)
      .expect(200);

    const body = response.body as CatalogAuthorResponse;
    expect(body.works).toEqual([]);
  });

  it('GET /catalog/authors/:slug returns 404 for draft author', async () => {
    const author = await prisma.author.create({
      data: {
        slug: `${TEST_PREFIX}-draft`,
        nameRu: 'Черновик',
        status: 'DRAFT',
      },
    });

    await request(app.getHttpServer())
      .get(`/catalog/authors/${author.slug}`)
      .expect(404);
  });

  it('GET /catalog/authors/:slug returns 404 for unknown slug', async () => {
    await request(app.getHttpServer())
      .get(`/catalog/authors/${TEST_PREFIX}-missing`)
      .expect(404);
  });
});

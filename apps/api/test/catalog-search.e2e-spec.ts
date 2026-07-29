import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaClient, WorkStatus } from '@prisma/client';
import { AppModule } from '../src/app.module';
import type { CatalogSearchResponse } from '../src/catalog/catalog-search.types';

const prisma = new PrismaClient();
const TEST_PREFIX = 'catalog-search-e2e';

async function cleanup() {
  await prisma.work.deleteMany({
    where: { slug: { startsWith: TEST_PREFIX } },
  });
  await prisma.author.deleteMany({
    where: { slug: { startsWith: TEST_PREFIX } },
  });
}

describe('Catalog search (e2e)', () => {
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

  it('GET /catalog/search returns hints for empty query without auth', async () => {
    await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-hidden`,
        titleRu: 'Скрытое произведение',
        status: WorkStatus.PUBLISHED,
      },
    });

    const response = await request(app.getHttpServer())
      .get('/catalog/search')
      .expect(200);

    const body = response.body as CatalogSearchResponse;
    expect(body).toMatchObject({
      query: '',
      items: [],
    });
    expect(body.hints).toEqual(expect.arrayContaining([expect.any(String)]));
  });

  it('GET /catalog/search finds published work by titleRu for guest', async () => {
    const work = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-war-and-peace`,
        titleRu: 'Война и мир',
        status: WorkStatus.PUBLISHED,
      },
    });

    const response = await request(app.getHttpServer())
      .get('/catalog/search')
      .query({ q: 'война' })
      .expect(200);

    const body = response.body as CatalogSearchResponse;
    expect(body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'WORK',
          id: work.id,
          slug: work.slug,
          title: 'Война и мир',
        }),
      ]),
    );
  });

  it('GET /catalog/search hides draft works from guest and user', async () => {
    await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-draft-only`,
        titleRu: 'Черновик Войны',
        status: WorkStatus.DRAFT,
      },
    });

    const response = await request(app.getHttpServer())
      .get('/catalog/search')
      .query({ q: 'черновик' })
      .expect(200);

    const body = response.body as CatalogSearchResponse;
    expect(body.items).toEqual([]);
  });

  it('GET /catalog/search returns entity types in items', async () => {
    const author = await prisma.author.create({
      data: {
        slug: `${TEST_PREFIX}-dostoevsky`,
        nameRu: 'Фёдор Достоевский',
        status: 'PUBLISHED',
      },
    });

    const response = await request(app.getHttpServer())
      .get('/catalog/search')
      .query({ q: 'достоевский' })
      .expect(200);

    const body = response.body as CatalogSearchResponse;
    expect(body.items[0]).toMatchObject({
      type: 'AUTHOR',
      id: author.id,
      path: `/authors/${author.slug}`,
    });
  });

  it('GET /catalog/search finds published author by prefix роул → Роулинг', async () => {
    const author = await prisma.author.create({
      data: {
        slug: `${TEST_PREFIX}-rowling`,
        nameRu: 'Дж. К. Роулинг',
        nameOrig: 'J. K. Rowling',
        status: 'PUBLISHED',
      },
    });

    await prisma.author.create({
      data: {
        slug: `${TEST_PREFIX}-rowling-draft`,
        nameRu: 'Черновик Роулинг',
        status: 'DRAFT',
      },
    });

    const response = await request(app.getHttpServer())
      .get('/catalog/search')
      .query({ q: 'роул' })
      .expect(200);

    const body = response.body as CatalogSearchResponse;
    expect(body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'AUTHOR',
          id: author.id,
          slug: author.slug,
          title: 'Дж. К. Роулинг',
          path: `/authors/${author.slug}`,
        }),
      ]),
    );

    const scoped = body.items.filter((item) =>
      item.slug.startsWith(TEST_PREFIX),
    );
    expect(scoped.map((item) => item.slug)).toEqual([author.slug]);
  });
});

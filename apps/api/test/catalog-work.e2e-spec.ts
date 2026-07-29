import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaClient, WorkStatus } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/bootstrap';
import type { CatalogWorkResponse } from '../src/catalog/catalog-work.types';

type ValidationErrorItem = { code: string; path: string; message: string };
type ValidationErrorResponse = {
  code: string;
  errors: ValidationErrorItem[];
};

const prisma = new PrismaClient();
const TEST_PREFIX = 'catalog-work-e2e';

async function cleanup() {
  await prisma.edition.deleteMany({
    where: { work: { slug: { startsWith: TEST_PREFIX } } },
  });
  await prisma.workAuthor.deleteMany({
    where: { work: { slug: { startsWith: TEST_PREFIX } } },
  });
  await prisma.workSeries.deleteMany({
    where: { work: { slug: { startsWith: TEST_PREFIX } } },
  });
  await prisma.work.deleteMany({
    where: { slug: { startsWith: TEST_PREFIX } },
  });
  await prisma.author.deleteMany({
    where: { slug: { startsWith: TEST_PREFIX } },
  });
}

describe('Catalog work (e2e)', () => {
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

  it('GET /catalog/works/:slug returns published work for guest', async () => {
    const author = await prisma.author.create({
      data: {
        slug: `${TEST_PREFIX}-author`,
        nameRu: 'Лев Толстой',
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
        editions: {
          create: {
            language: 'ru',
            isbn13: '9785179999999',
          },
        },
      },
    });

    const response = await request(app.getHttpServer())
      .get(`/catalog/works/${work.slug}`)
      .expect(200);

    const body = response.body as CatalogWorkResponse;
    expect(body).toMatchObject({
      slug: work.slug,
      titleRu: 'Война и мир',
      yearFirst: 1869,
      authors: [{ slug: author.slug, nameRu: 'Лев Толстой' }],
      editions: [
        expect.objectContaining({
          language: 'ru',
          isbn13: '9785179999999',
        }),
      ],
    });
  });

  it('GET /catalog/works/:slug returns 404 for draft work', async () => {
    const work = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-draft`,
        titleRu: 'Черновик',
        status: WorkStatus.DRAFT,
      },
    });

    await request(app.getHttpServer())
      .get(`/catalog/works/${work.slug}`)
      .expect(404);
  });

  it('GET /catalog/works/:slug returns 404 for unknown slug', async () => {
    await request(app.getHttpServer())
      .get(`/catalog/works/${TEST_PREFIX}-missing`)
      .expect(404);
  });

  it('GET /catalog/works/:slug returns 400 VALIDATION_FAILED for oversized slug', async () => {
    const response = await request(app.getHttpServer())
      .get(`/catalog/works/${'a'.repeat(201)}`)
      .expect(400);

    const body = response.body as ValidationErrorResponse;
    expect(body.code).toBe('VALIDATION_FAILED');
    expect(body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: 'slug' })]),
    );
  });
});

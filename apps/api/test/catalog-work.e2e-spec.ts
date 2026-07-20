import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaClient, WorkStatus } from '@prisma/client';
import { AppModule } from '../src/app.module';
import type { CatalogWorkResponse } from '../src/catalog/catalog-work.types';

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
});

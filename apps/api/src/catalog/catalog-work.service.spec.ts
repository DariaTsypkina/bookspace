import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient, WorkStatus } from '@prisma/client';
import { CatalogModule } from './catalog.module';
import { CatalogWorkService } from './catalog-work.service';

const prisma = new PrismaClient();

const TEST_PREFIX = 'catalog-work-spec';

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
  await prisma.series.deleteMany({
    where: { slug: { startsWith: TEST_PREFIX } },
  });
}

describe('CatalogWorkService', () => {
  let service: CatalogWorkService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CatalogModule],
    }).compile();

    service = module.get(CatalogWorkService);
  });

  beforeEach(async () => {
    await cleanup();
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  it('returns titleRu and authors for published work', async () => {
    const author = await prisma.author.create({
      data: {
        slug: `${TEST_PREFIX}-author`,
        nameRu: 'Дж. К. Роулинг',
        status: 'PUBLISHED',
      },
    });
    const work = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-published`,
        titleRu: 'Гарри Поттер и философский камень',
        titleOrig: 'Harry Potter and the Philosopher Stone',
        yearFirst: 1997,
        status: WorkStatus.PUBLISHED,
        authors: {
          create: { authorId: author.id, position: 0 },
        },
      },
    });

    const result = await service.getBySlug(work.slug);

    expect(result).toMatchObject({
      slug: work.slug,
      titleRu: 'Гарри Поттер и философский камень',
      titleOrig: 'Harry Potter and the Philosopher Stone',
      yearFirst: 1997,
      authors: [{ slug: author.slug, nameRu: 'Дж. К. Роулинг' }],
    });
  });

  it('returns editions with language, translator and isbn13', async () => {
    const work = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-editions`,
        titleRu: 'Произведение с изданиями',
        status: WorkStatus.PUBLISHED,
        editions: {
          create: [
            {
              language: 'ru',
              translator: 'М. Спивак',
              isbn13: '9785041234567',
              publisher: 'Росмэн',
              year: 2000,
            },
            {
              language: 'en',
            },
          ],
        },
      },
    });

    const result = await service.getBySlug(work.slug);

    expect(result.editions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          language: 'ru',
          translator: 'М. Спивак',
          isbn13: '9785041234567',
        }),
        expect.objectContaining({ language: 'en' }),
      ]),
    );
  });

  it('returns series link when work belongs to a series', async () => {
    const series = await prisma.series.create({
      data: {
        slug: `${TEST_PREFIX}-series`,
        nameRu: 'Гарри Поттер',
        status: 'PUBLISHED',
      },
    });
    const work = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-with-series`,
        titleRu: 'Книга в серии',
        status: WorkStatus.PUBLISHED,
        seriesLinks: {
          create: { seriesId: series.id, positionInSeries: 1 },
        },
      },
    });

    const result = await service.getBySlug(work.slug);

    expect(result.series).toEqual({
      slug: series.slug,
      nameRu: 'Гарри Поттер',
      positionInSeries: 1,
    });
  });

  it('throws NotFoundException for draft work', async () => {
    const work = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-draft`,
        titleRu: 'Черновик',
        status: WorkStatus.DRAFT,
      },
    });

    await expect(service.getBySlug(work.slug)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws NotFoundException for unknown slug', async () => {
    await expect(
      service.getBySlug(`${TEST_PREFIX}-missing`),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws NotFoundException for soft-deleted work', async () => {
    const work = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-deleted`,
        titleRu: 'Удалённое',
        status: WorkStatus.PUBLISHED,
        deletedAt: new Date(),
      },
    });

    await expect(service.getBySlug(work.slug)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

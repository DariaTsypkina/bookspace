import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient, WorkStatus } from '@prisma/client';
import { CatalogModule } from './catalog.module';
import { CatalogSeriesService } from './catalog-series.service';

const prisma = new PrismaClient();

const TEST_PREFIX = 'catalog-series-spec';

async function cleanup() {
  await prisma.workSeries.deleteMany({
    where: {
      OR: [
        { work: { slug: { startsWith: TEST_PREFIX } } },
        { series: { slug: { startsWith: TEST_PREFIX } } },
      ],
    },
  });
  await prisma.work.deleteMany({
    where: { slug: { startsWith: TEST_PREFIX } },
  });
  await prisma.series.deleteMany({
    where: { slug: { startsWith: TEST_PREFIX } },
  });
}

describe('CatalogSeriesService', () => {
  let service: CatalogSeriesService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CatalogModule],
    }).compile();

    service = module.get(CatalogSeriesService);
  });

  beforeEach(async () => {
    await cleanup();
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  it('returns nameRu and published works with positionInSeries for published series', async () => {
    const series = await prisma.series.create({
      data: {
        slug: `${TEST_PREFIX}-series`,
        nameRu: 'Гарри Поттер',
        status: 'PUBLISHED',
      },
    });
    const work = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-book`,
        titleRu: 'Гарри Поттер и философский камень',
        yearFirst: 1997,
        status: WorkStatus.PUBLISHED,
        seriesLinks: {
          create: { seriesId: series.id, positionInSeries: 1 },
        },
      },
    });

    const result = await service.getBySlug(series.slug);

    expect(result).toMatchObject({
      slug: series.slug,
      nameRu: 'Гарри Поттер',
      works: [
        {
          slug: work.slug,
          titleRu: 'Гарри Поттер и философский камень',
          yearFirst: 1997,
          positionInSeries: 1,
        },
      ],
    });
  });

  it('returns nameOrig when present', async () => {
    const series = await prisma.series.create({
      data: {
        slug: `${TEST_PREFIX}-orig`,
        nameRu: 'Гарри Поттер',
        nameOrig: 'Harry Potter',
        status: 'PUBLISHED',
      },
    });

    const result = await service.getBySlug(series.slug);

    expect(result.nameOrig).toBe('Harry Potter');
  });

  it('omits positionInSeries when not set', async () => {
    const series = await prisma.series.create({
      data: {
        slug: `${TEST_PREFIX}-no-pos`,
        nameRu: 'Серия без позиций',
        status: 'PUBLISHED',
      },
    });
    await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-no-pos-book`,
        titleRu: 'Книга без позиции',
        status: WorkStatus.PUBLISHED,
        seriesLinks: {
          create: { seriesId: series.id, positionInSeries: null },
        },
      },
    });

    const result = await service.getBySlug(series.slug);

    expect(result.works).toHaveLength(1);
    expect(result.works[0]).not.toHaveProperty('positionInSeries');
  });

  it('excludes draft works from the list', async () => {
    const series = await prisma.series.create({
      data: {
        slug: `${TEST_PREFIX}-mixed-works`,
        nameRu: 'Серия с черновиками',
        status: 'PUBLISHED',
      },
    });
    await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-published-work`,
        titleRu: 'Опубликованная книга',
        status: WorkStatus.PUBLISHED,
        seriesLinks: {
          create: { seriesId: series.id, positionInSeries: 1 },
        },
      },
    });
    await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-draft-work`,
        titleRu: 'Черновик',
        status: WorkStatus.DRAFT,
        seriesLinks: {
          create: { seriesId: series.id, positionInSeries: 2 },
        },
      },
    });

    const result = await service.getBySlug(series.slug);

    expect(result.works).toHaveLength(1);
    expect(result.works[0]?.titleRu).toBe('Опубликованная книга');
  });

  it('returns empty works list when series has no published works', async () => {
    const series = await prisma.series.create({
      data: {
        slug: `${TEST_PREFIX}-no-works`,
        nameRu: 'Серия без книг',
        status: 'PUBLISHED',
      },
    });

    const result = await service.getBySlug(series.slug);

    expect(result.works).toEqual([]);
  });

  it('sorts works by positionInSeries ascending, nulls last, then titleRu', async () => {
    const series = await prisma.series.create({
      data: {
        slug: `${TEST_PREFIX}-sorted`,
        nameRu: 'Серия для сортировки',
        status: 'PUBLISHED',
      },
    });
    await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-work-2`,
        titleRu: 'Вторая',
        status: WorkStatus.PUBLISHED,
        seriesLinks: {
          create: { seriesId: series.id, positionInSeries: 2 },
        },
      },
    });
    await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-work-1`,
        titleRu: 'Первая',
        status: WorkStatus.PUBLISHED,
        seriesLinks: {
          create: { seriesId: series.id, positionInSeries: 1 },
        },
      },
    });
    await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-work-null-b`,
        titleRu: 'Яблоко',
        status: WorkStatus.PUBLISHED,
        seriesLinks: {
          create: { seriesId: series.id, positionInSeries: null },
        },
      },
    });
    await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-work-null-a`,
        titleRu: 'Абрикос',
        status: WorkStatus.PUBLISHED,
        seriesLinks: {
          create: { seriesId: series.id, positionInSeries: null },
        },
      },
    });

    const result = await service.getBySlug(series.slug);

    expect(result.works.map((work) => work.titleRu)).toEqual([
      'Первая',
      'Вторая',
      'Абрикос',
      'Яблоко',
    ]);
  });

  it('throws NotFoundException for draft series', async () => {
    const series = await prisma.series.create({
      data: {
        slug: `${TEST_PREFIX}-draft-series`,
        nameRu: 'Черновик серии',
        status: 'DRAFT',
      },
    });

    await expect(service.getBySlug(series.slug)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws NotFoundException for unknown slug', async () => {
    await expect(
      service.getBySlug(`${TEST_PREFIX}-missing`),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws NotFoundException for soft-deleted series', async () => {
    const series = await prisma.series.create({
      data: {
        slug: `${TEST_PREFIX}-deleted`,
        nameRu: 'Удалённая серия',
        status: 'PUBLISHED',
        deletedAt: new Date(),
      },
    });

    await expect(service.getBySlug(series.slug)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

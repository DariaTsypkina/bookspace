import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient, WorkStatus } from '@prisma/client';
import { CatalogModule } from './catalog.module';
import { CatalogWorkService } from './catalog-work.service';

const prisma = new PrismaClient();

const TEST_PREFIX = 'catalog-work-spec';

async function cleanup() {
  await prisma.workRelation.deleteMany({
    where: {
      OR: [
        { fromWork: { slug: { startsWith: TEST_PREFIX } } },
        { toWork: { slug: { startsWith: TEST_PREFIX } } },
      ],
    },
  });
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

  it('returns published work relations with distinct types', async () => {
    const source = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-source`,
        titleRu: 'Источник',
        status: WorkStatus.PUBLISHED,
      },
    });
    const sequel = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-sequel`,
        titleRu: 'Сиквел',
        status: WorkStatus.PUBLISHED,
      },
    });
    const prequel = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-prequel`,
        titleRu: 'Приквел',
        status: WorkStatus.PUBLISHED,
      },
    });
    await prisma.workRelation.createMany({
      data: [
        {
          fromWorkId: source.id,
          toWorkId: sequel.id,
          type: 'SEQUEL',
        },
        {
          fromWorkId: source.id,
          toWorkId: prequel.id,
          type: 'PREQUEL',
        },
      ],
    });

    const result = await service.getBySlug(source.slug);

    expect(result.relations).toEqual(
      expect.arrayContaining([
        {
          slug: sequel.slug,
          titleRu: 'Сиквел',
          type: 'SEQUEL',
        },
        {
          slug: prequel.slug,
          titleRu: 'Приквел',
          type: 'PREQUEL',
        },
      ]),
    );
    expect(result.relations).toHaveLength(2);
  });

  it('excludes draft and soft-deleted relation targets', async () => {
    const source = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-rel-source`,
        titleRu: 'Источник связей',
        status: WorkStatus.PUBLISHED,
      },
    });
    const published = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-rel-published`,
        titleRu: 'Опубликованная связь',
        status: WorkStatus.PUBLISHED,
      },
    });
    const draft = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-rel-draft`,
        titleRu: 'Черновик связи',
        status: WorkStatus.DRAFT,
      },
    });
    const deleted = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-rel-deleted`,
        titleRu: 'Удалённая связь',
        status: WorkStatus.PUBLISHED,
        deletedAt: new Date(),
      },
    });
    await prisma.workRelation.createMany({
      data: [
        {
          fromWorkId: source.id,
          toWorkId: published.id,
          type: 'RELATED',
        },
        {
          fromWorkId: source.id,
          toWorkId: draft.id,
          type: 'ADAPTATION',
        },
        {
          fromWorkId: source.id,
          toWorkId: deleted.id,
          type: 'SEQUEL',
        },
      ],
    });

    const result = await service.getBySlug(source.slug);

    expect(result.relations).toEqual([
      {
        slug: published.slug,
        titleRu: 'Опубликованная связь',
        type: 'RELATED',
      },
    ]);
  });

  it('returns empty relations when work has none', async () => {
    const work = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-no-relations`,
        titleRu: 'Без связей',
        status: WorkStatus.PUBLISHED,
      },
    });

    const result = await service.getBySlug(work.slug);

    expect(result.relations).toEqual([]);
  });

  it('returns readingOrder from series positions when work is in a series (bd-azl.3)', async () => {
    const series = await prisma.series.create({
      data: {
        slug: `${TEST_PREFIX}-ro-series`,
        nameRu: 'Серия порядка',
        status: 'PUBLISHED',
      },
    });
    const first = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-ro-first`,
        titleRu: 'Первая',
        status: WorkStatus.PUBLISHED,
        seriesLinks: {
          create: { seriesId: series.id, positionInSeries: 1 },
        },
      },
    });
    await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-ro-second`,
        titleRu: 'Вторая',
        status: WorkStatus.PUBLISHED,
        seriesLinks: {
          create: { seriesId: series.id, positionInSeries: 2 },
        },
      },
    });

    const result = await service.getBySlug(first.slug);

    expect(result.readingOrder).toEqual([
      {
        step: 1,
        slug: `${TEST_PREFIX}-ro-first`,
        titleRu: 'Первая',
      },
      {
        step: 2,
        slug: `${TEST_PREFIX}-ro-second`,
        titleRu: 'Вторая',
      },
    ]);
  });

  it('returns readingOrder from WorkRelation.readingOrder when no series (bd-azl.3)', async () => {
    const first = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-rel-ro-1`,
        titleRu: 'Том один',
        status: WorkStatus.PUBLISHED,
      },
    });
    const second = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-rel-ro-2`,
        titleRu: 'Том два',
        status: WorkStatus.PUBLISHED,
      },
    });
    await prisma.workRelation.create({
      data: {
        fromWorkId: first.id,
        toWorkId: second.id,
        type: 'SEQUEL',
        readingOrder: 2,
      },
    });

    const result = await service.getBySlug(first.slug);

    expect(result.readingOrder).toEqual([
      {
        step: 1,
        slug: first.slug,
        titleRu: 'Том один',
      },
      {
        step: 2,
        slug: second.slug,
        titleRu: 'Том два',
      },
    ]);
  });

  it('dedupes cyclic WorkRelation readingOrder without looping (bd-azl.3)', async () => {
    const a = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-cycle-a`,
        titleRu: 'А',
        status: WorkStatus.PUBLISHED,
      },
    });
    const b = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-cycle-b`,
        titleRu: 'Б',
        status: WorkStatus.PUBLISHED,
      },
    });
    await prisma.workRelation.createMany({
      data: [
        {
          fromWorkId: a.id,
          toWorkId: b.id,
          type: 'SEQUEL',
          readingOrder: 2,
        },
        {
          fromWorkId: b.id,
          toWorkId: a.id,
          type: 'PREQUEL',
          readingOrder: 1,
        },
      ],
    });

    const result = await service.getBySlug(a.slug);

    expect(result.readingOrder).toHaveLength(2);
    expect(result.readingOrder.map((step) => step.slug).sort()).toEqual(
      [a.slug, b.slug].sort(),
    );
    expect(result.readingOrder.map((step) => step.step)).toEqual([1, 2]);
  });

  it('returns empty readingOrder when neither series positions nor relation order', async () => {
    const work = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-no-reading-order`,
        titleRu: 'Без порядка',
        status: WorkStatus.PUBLISHED,
      },
    });

    const result = await service.getBySlug(work.slug);

    expect(result.readingOrder).toEqual([]);
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

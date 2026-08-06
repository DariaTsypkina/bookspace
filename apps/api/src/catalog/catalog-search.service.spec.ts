import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient, WorkStatus } from '@prisma/client';
import { CatalogModule } from './catalog.module';
import { CatalogSearchService } from './catalog-search.service';

const prisma = new PrismaClient();

const TEST_PREFIX = 'catalog-search-spec';

async function cleanup() {
  await prisma.work.deleteMany({
    where: { slug: { startsWith: TEST_PREFIX } },
  });
  await prisma.author.deleteMany({
    where: { slug: { startsWith: TEST_PREFIX } },
  });
  await prisma.series.deleteMany({
    where: { slug: { startsWith: TEST_PREFIX } },
  });
  await prisma.character.deleteMany({
    where: { slug: { startsWith: TEST_PREFIX } },
  });
  await prisma.world.deleteMany({
    where: { slug: { startsWith: TEST_PREFIX } },
  });
  await prisma.place.deleteMany({
    where: { slug: { startsWith: TEST_PREFIX } },
  });
}

describe('CatalogSearchService', () => {
  let service: CatalogSearchService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CatalogModule],
    }).compile();

    service = module.get(CatalogSearchService);
  });

  beforeEach(async () => {
    await cleanup();
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  it('returns empty items and hints when query is blank', async () => {
    await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-published-work`,
        titleRu: 'Опубликованное произведение',
        status: WorkStatus.PUBLISHED,
      },
    });

    const result = await service.search('   ');

    expect(result.query).toBe('');
    expect(result.items).toEqual([]);
    expect(result.hints?.length).toBeGreaterThan(0);
  });

  it('finds work by titleRu', async () => {
    const work = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-garri-potter`,
        titleRu: 'Гарри Поттер и философский камень',
        titleOrig: 'Harry Potter and the Philosopher Stone',
        status: WorkStatus.PUBLISHED,
      },
    });

    const result = await service.search('гарри');

    expect(result.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'WORK',
          id: work.id,
          slug: work.slug,
          title: 'Гарри Поттер и философский камень',
          path: `/books/${work.slug}`,
        }),
      ]),
    );
  });

  it('finds work by titleOrig', async () => {
    const work = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-hobbit`,
        titleRu: 'Хоббит',
        titleOrig: 'The Hobbit',
        status: WorkStatus.PUBLISHED,
      },
    });

    const result = await service.search('hobbit');

    expect(result.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'WORK',
          id: work.id,
          slug: work.slug,
        }),
      ]),
    );
  });

  it('includes entity type for each result', async () => {
    const author = await prisma.author.create({
      data: {
        slug: `${TEST_PREFIX}-tolstoy`,
        nameRu: 'Лев Толстой',
        status: 'PUBLISHED',
      },
    });

    const result = await service.search('толстой');

    expect(result.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'AUTHOR',
          id: author.id,
          slug: author.slug,
          title: 'Лев Толстой',
          path: `/authors/${author.slug}`,
        }),
      ]),
    );
  });

  it('does not return draft or merged works', async () => {
    await prisma.work.createMany({
      data: [
        {
          slug: `${TEST_PREFIX}-draft-work`,
          titleRu: 'Черновик Гарри',
          status: WorkStatus.DRAFT,
        },
        {
          slug: `${TEST_PREFIX}-merged-work`,
          titleRu: 'Слитый Гарри',
          status: WorkStatus.MERGED,
        },
        {
          slug: `${TEST_PREFIX}-published-garri`,
          titleRu: 'Гарри опубликованный',
          status: WorkStatus.PUBLISHED,
        },
      ],
    });

    const result = await service.search('гарри');

    const slugs = result.items
      .filter((item) => item.slug.startsWith(TEST_PREFIX))
      .map((item) => item.slug);
    expect(slugs).toEqual([`${TEST_PREFIX}-published-garri`]);
  });

  it('does not return soft-deleted entities', async () => {
    await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-deleted-work`,
        titleRu: 'Удалённый Гарри специф',
        status: WorkStatus.PUBLISHED,
        deletedAt: new Date(),
      },
    });

    const result = await service.search('специф');

    const slugs = result.items
      .filter((item) => item.slug.startsWith(TEST_PREFIX))
      .map((item) => item.slug);
    expect(slugs).toEqual([]);
  });

  it('finds published author by nameRu prefix (роул → Роулинг)', async () => {
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

    const result = await service.search('роул');

    expect(result.items).toEqual(
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

    const scoped = result.items.filter((item) =>
      item.slug.startsWith(TEST_PREFIX),
    );
    expect(scoped).toHaveLength(1);
    expect(scoped[0]?.slug).toBe(author.slug);
  });

  it('finds work by titleOrig prefix without dumping on punctuation-only q', async () => {
    await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-rowling-work`,
        titleRu: 'Гарри Поттер и узник Азкабана',
        titleOrig: 'Harry Potter and the Prisoner of Azkaban',
        status: WorkStatus.PUBLISHED,
      },
    });

    const prefixResult = await service.search('Harr');
    expect(prefixResult.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'WORK',
          slug: `${TEST_PREFIX}-rowling-work`,
        }),
      ]),
    );

    const junk = await service.search('!!!');
    expect(junk.query).toBe('!!!');
    expect(junk.items).toEqual([]);
  });
});

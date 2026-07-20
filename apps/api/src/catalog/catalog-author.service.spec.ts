import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient, WorkStatus } from '@prisma/client';
import { CatalogModule } from './catalog.module';
import { CatalogAuthorService } from './catalog-author.service';

const prisma = new PrismaClient();

const TEST_PREFIX = 'catalog-author-spec';

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

describe('CatalogAuthorService', () => {
  let service: CatalogAuthorService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CatalogModule],
    }).compile();

    service = module.get(CatalogAuthorService);
  });

  beforeEach(async () => {
    await cleanup();
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  it('returns nameRu and published works for published author', async () => {
    const author = await prisma.author.create({
      data: {
        slug: `${TEST_PREFIX}-author`,
        nameRu: 'Дж. К. Роулинг',
        status: 'PUBLISHED',
      },
    });
    const work = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-book`,
        titleRu: 'Гарри Поттер и философский камень',
        yearFirst: 1997,
        status: WorkStatus.PUBLISHED,
        authors: {
          create: { authorId: author.id, position: 0 },
        },
      },
    });

    const result = await service.getBySlug(author.slug);

    expect(result).toMatchObject({
      slug: author.slug,
      nameRu: 'Дж. К. Роулинг',
      works: [
        {
          slug: work.slug,
          titleRu: 'Гарри Поттер и философский камень',
          yearFirst: 1997,
        },
      ],
    });
  });

  it('returns nameOrig when present', async () => {
    const author = await prisma.author.create({
      data: {
        slug: `${TEST_PREFIX}-orig`,
        nameRu: 'Дж. К. Роулинг',
        nameOrig: 'J. K. Rowling',
        status: 'PUBLISHED',
      },
    });

    const result = await service.getBySlug(author.slug);

    expect(result.nameOrig).toBe('J. K. Rowling');
  });

  it('excludes draft works from the list', async () => {
    const author = await prisma.author.create({
      data: {
        slug: `${TEST_PREFIX}-mixed-works`,
        nameRu: 'Автор с черновиками',
        status: 'PUBLISHED',
      },
    });
    await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-published-work`,
        titleRu: 'Опубликованная книга',
        status: WorkStatus.PUBLISHED,
        authors: {
          create: { authorId: author.id, position: 0 },
        },
      },
    });
    await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-draft-work`,
        titleRu: 'Черновик',
        status: WorkStatus.DRAFT,
        authors: {
          create: { authorId: author.id, position: 1 },
        },
      },
    });

    const result = await service.getBySlug(author.slug);

    expect(result.works).toHaveLength(1);
    expect(result.works[0]?.titleRu).toBe('Опубликованная книга');
  });

  it('returns empty works list when author has no published works', async () => {
    const author = await prisma.author.create({
      data: {
        slug: `${TEST_PREFIX}-no-works`,
        nameRu: 'Автор без книг',
        status: 'PUBLISHED',
      },
    });

    const result = await service.getBySlug(author.slug);

    expect(result.works).toEqual([]);
  });

  it('sorts works by titleRu ascending', async () => {
    const author = await prisma.author.create({
      data: {
        slug: `${TEST_PREFIX}-sorted`,
        nameRu: 'Автор для сортировки',
        status: 'PUBLISHED',
      },
    });
    await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-work-z`,
        titleRu: 'Яблоко',
        status: WorkStatus.PUBLISHED,
        authors: { create: { authorId: author.id, position: 0 } },
      },
    });
    await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-work-a`,
        titleRu: 'Абрикос',
        status: WorkStatus.PUBLISHED,
        authors: { create: { authorId: author.id, position: 1 } },
      },
    });

    const result = await service.getBySlug(author.slug);

    expect(result.works.map((work) => work.titleRu)).toEqual([
      'Абрикос',
      'Яблоко',
    ]);
  });

  it('throws NotFoundException for draft author', async () => {
    const author = await prisma.author.create({
      data: {
        slug: `${TEST_PREFIX}-draft-author`,
        nameRu: 'Черновик автора',
        status: 'DRAFT',
      },
    });

    await expect(service.getBySlug(author.slug)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws NotFoundException for unknown slug', async () => {
    await expect(
      service.getBySlug(`${TEST_PREFIX}-missing`),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws NotFoundException for soft-deleted author', async () => {
    const author = await prisma.author.create({
      data: {
        slug: `${TEST_PREFIX}-deleted`,
        nameRu: 'Удалённый автор',
        status: 'PUBLISHED',
        deletedAt: new Date(),
      },
    });

    await expect(service.getBySlug(author.slug)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

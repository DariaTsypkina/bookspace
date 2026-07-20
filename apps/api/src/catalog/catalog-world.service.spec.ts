import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient, WorkStatus } from '@prisma/client';
import { CatalogModule } from './catalog.module';
import { CatalogWorldService } from './catalog-world.service';

const prisma = new PrismaClient();

const TEST_PREFIX = 'catalog-world-spec';

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

describe('CatalogWorldService', () => {
  let service: CatalogWorldService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CatalogModule],
    }).compile();

    service = module.get(CatalogWorldService);
  });

  beforeEach(async () => {
    await cleanup();
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  it('returns nameRu, descriptionRu and published places for published world', async () => {
    const world = await prisma.world.create({
      data: {
        slug: `${TEST_PREFIX}-wizarding`,
        nameRu: 'Волшебный мир',
        nameOrig: 'Wizarding World',
        descriptionRu: 'Мир волшебников и магии.',
        status: 'PUBLISHED',
      },
    });
    const hogwarts = await prisma.place.create({
      data: {
        slug: `${TEST_PREFIX}-hogwarts`,
        nameRu: 'Хогвартс',
        nameOrig: 'Hogwarts',
        status: 'PUBLISHED',
        worldId: world.id,
      },
    });

    const result = await service.getBySlug(world.slug);

    expect(result).toMatchObject({
      slug: world.slug,
      nameRu: 'Волшебный мир',
      nameOrig: 'Wizarding World',
      descriptionRu: 'Мир волшебников и магии.',
      places: [
        {
          slug: hogwarts.slug,
          nameRu: 'Хогвартс',
          nameOrig: 'Hogwarts',
        },
      ],
      works: [],
    });
  });

  it('returns published works linked via places in the world', async () => {
    const world = await prisma.world.create({
      data: {
        slug: `${TEST_PREFIX}-with-works`,
        nameRu: 'Мир с книгами',
        status: 'PUBLISHED',
      },
    });
    const place = await prisma.place.create({
      data: {
        slug: `${TEST_PREFIX}-place`,
        nameRu: 'Локация',
        status: 'PUBLISHED',
        worldId: world.id,
      },
    });
    const work = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-book`,
        titleRu: 'Книга в этом мире',
        yearFirst: 1997,
        status: WorkStatus.PUBLISHED,
        places: {
          create: { placeId: place.id },
        },
      },
    });

    const result = await service.getBySlug(world.slug);

    expect(result.works).toEqual([
      {
        slug: work.slug,
        titleRu: 'Книга в этом мире',
        yearFirst: 1997,
      },
    ]);
  });

  it('excludes draft places from world page', async () => {
    const world = await prisma.world.create({
      data: {
        slug: `${TEST_PREFIX}-mixed-places`,
        nameRu: 'Мир',
        status: 'PUBLISHED',
      },
    });
    await prisma.place.create({
      data: {
        slug: `${TEST_PREFIX}-published-place`,
        nameRu: 'Опубликованная локация',
        status: 'PUBLISHED',
        worldId: world.id,
      },
    });
    await prisma.place.create({
      data: {
        slug: `${TEST_PREFIX}-draft-place`,
        nameRu: 'Черновик локации',
        status: 'DRAFT',
        worldId: world.id,
      },
    });

    const result = await service.getBySlug(world.slug);

    expect(result.places).toHaveLength(1);
    expect(result.places[0]?.nameRu).toBe('Опубликованная локация');
  });

  it('excludes draft works from world page', async () => {
    const world = await prisma.world.create({
      data: {
        slug: `${TEST_PREFIX}-mixed-works`,
        nameRu: 'Мир',
        status: 'PUBLISHED',
      },
    });
    const place = await prisma.place.create({
      data: {
        slug: `${TEST_PREFIX}-place-works`,
        nameRu: 'Локация',
        status: 'PUBLISHED',
        worldId: world.id,
      },
    });
    await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-published-work`,
        titleRu: 'Опубликованная книга',
        status: WorkStatus.PUBLISHED,
        places: {
          create: { placeId: place.id },
        },
      },
    });
    await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-draft-work`,
        titleRu: 'Черновик',
        status: WorkStatus.DRAFT,
        places: {
          create: { placeId: place.id },
        },
      },
    });

    const result = await service.getBySlug(world.slug);

    expect(result.works).toHaveLength(1);
    expect(result.works[0]?.titleRu).toBe('Опубликованная книга');
  });

  it('returns empty places when world has no published locations', async () => {
    const world = await prisma.world.create({
      data: {
        slug: `${TEST_PREFIX}-no-places`,
        nameRu: 'Пустой мир',
        status: 'PUBLISHED',
      },
    });

    const result = await service.getBySlug(world.slug);

    expect(result.places).toEqual([]);
    expect(result.works).toEqual([]);
  });

  it('sorts places by nameRu ascending', async () => {
    const world = await prisma.world.create({
      data: {
        slug: `${TEST_PREFIX}-sorted-places`,
        nameRu: 'Мир',
        status: 'PUBLISHED',
      },
    });
    await prisma.place.create({
      data: {
        slug: `${TEST_PREFIX}-place-z`,
        nameRu: 'Яблоко',
        status: 'PUBLISHED',
        worldId: world.id,
      },
    });
    await prisma.place.create({
      data: {
        slug: `${TEST_PREFIX}-place-a`,
        nameRu: 'Абрикос',
        status: 'PUBLISHED',
        worldId: world.id,
      },
    });

    const result = await service.getBySlug(world.slug);

    expect(result.places.map((place) => place.nameRu)).toEqual([
      'Абрикос',
      'Яблоко',
    ]);
  });

  it('deduplicates works linked via multiple places', async () => {
    const world = await prisma.world.create({
      data: {
        slug: `${TEST_PREFIX}-dedupe`,
        nameRu: 'Мир',
        status: 'PUBLISHED',
      },
    });
    const placeA = await prisma.place.create({
      data: {
        slug: `${TEST_PREFIX}-place-a-dedupe`,
        nameRu: 'Локация А',
        status: 'PUBLISHED',
        worldId: world.id,
      },
    });
    const placeB = await prisma.place.create({
      data: {
        slug: `${TEST_PREFIX}-place-b-dedupe`,
        nameRu: 'Локация Б',
        status: 'PUBLISHED',
        worldId: world.id,
      },
    });
    const work = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-shared-work`,
        titleRu: 'Общая книга',
        status: WorkStatus.PUBLISHED,
        places: {
          createMany: {
            data: [{ placeId: placeA.id }, { placeId: placeB.id }],
          },
        },
      },
    });

    const result = await service.getBySlug(world.slug);

    expect(result.works).toEqual([
      {
        slug: work.slug,
        titleRu: 'Общая книга',
      },
    ]);
  });

  it('throws NotFoundException for draft world', async () => {
    const world = await prisma.world.create({
      data: {
        slug: `${TEST_PREFIX}-draft-world`,
        nameRu: 'Черновик',
        status: 'DRAFT',
      },
    });

    await expect(service.getBySlug(world.slug)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws NotFoundException for unknown slug', async () => {
    await expect(
      service.getBySlug(`${TEST_PREFIX}-missing`),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws NotFoundException for soft-deleted world', async () => {
    const world = await prisma.world.create({
      data: {
        slug: `${TEST_PREFIX}-deleted`,
        nameRu: 'Удалённый мир',
        status: 'PUBLISHED',
        deletedAt: new Date(),
      },
    });

    await expect(service.getBySlug(world.slug)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

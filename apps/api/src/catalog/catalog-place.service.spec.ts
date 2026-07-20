import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient, WorkStatus } from '@prisma/client';
import { CatalogModule } from './catalog.module';
import { CatalogPlaceService } from './catalog-place.service';

const prisma = new PrismaClient();

const TEST_PREFIX = 'catalog-place-spec';

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

describe('CatalogPlaceService', () => {
  let service: CatalogPlaceService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CatalogModule],
    }).compile();

    service = module.get(CatalogPlaceService);
  });

  beforeEach(async () => {
    await cleanup();
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  it('returns nameRu and linked world when place has worldId', async () => {
    const world = await prisma.world.create({
      data: {
        slug: `${TEST_PREFIX}-wizarding`,
        nameRu: 'Волшебный мир',
        nameOrig: 'Wizarding World',
        status: 'PUBLISHED',
      },
    });
    const place = await prisma.place.create({
      data: {
        slug: `${TEST_PREFIX}-hogwarts`,
        nameRu: 'Хогвартс',
        nameOrig: 'Hogwarts',
        status: 'PUBLISHED',
        worldId: world.id,
      },
    });

    const result = await service.getBySlug(place.slug);

    expect(result).toMatchObject({
      slug: place.slug,
      nameRu: 'Хогвартс',
      nameOrig: 'Hogwarts',
      world: {
        slug: world.slug,
        nameRu: 'Волшебный мир',
        nameOrig: 'Wizarding World',
      },
      works: [],
    });
  });

  it('returns published works linked to the place', async () => {
    const place = await prisma.place.create({
      data: {
        slug: `${TEST_PREFIX}-place-works`,
        nameRu: 'Локация',
        status: 'PUBLISHED',
      },
    });
    const work = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-book`,
        titleRu: 'Книга в этой локации',
        yearFirst: 1997,
        status: WorkStatus.PUBLISHED,
        places: {
          create: { placeId: place.id },
        },
      },
    });

    const result = await service.getBySlug(place.slug);

    expect(result.works).toEqual([
      {
        slug: work.slug,
        titleRu: 'Книга в этой локации',
        yearFirst: 1997,
      },
    ]);
  });

  it('omits world when place has no worldId', async () => {
    const place = await prisma.place.create({
      data: {
        slug: `${TEST_PREFIX}-standalone`,
        nameRu: 'Одиночная локация',
        status: 'PUBLISHED',
      },
    });

    const result = await service.getBySlug(place.slug);

    expect(result.world).toBeUndefined();
  });

  it('omits draft world even when worldId is set', async () => {
    const world = await prisma.world.create({
      data: {
        slug: `${TEST_PREFIX}-draft-world`,
        nameRu: 'Черновик мира',
        status: 'DRAFT',
      },
    });
    const place = await prisma.place.create({
      data: {
        slug: `${TEST_PREFIX}-with-draft-world`,
        nameRu: 'Локация',
        status: 'PUBLISHED',
        worldId: world.id,
      },
    });

    const result = await service.getBySlug(place.slug);

    expect(result.world).toBeUndefined();
  });

  it('excludes draft works from place page', async () => {
    const place = await prisma.place.create({
      data: {
        slug: `${TEST_PREFIX}-mixed-works`,
        nameRu: 'Локация',
        status: 'PUBLISHED',
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

    const result = await service.getBySlug(place.slug);

    expect(result.works).toHaveLength(1);
    expect(result.works[0]?.titleRu).toBe('Опубликованная книга');
  });

  it('sorts works by titleRu ascending', async () => {
    const place = await prisma.place.create({
      data: {
        slug: `${TEST_PREFIX}-sorted-works`,
        nameRu: 'Локация',
        status: 'PUBLISHED',
      },
    });
    await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-work-z`,
        titleRu: 'Яблоко',
        status: WorkStatus.PUBLISHED,
        places: {
          create: { placeId: place.id },
        },
      },
    });
    await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-work-a`,
        titleRu: 'Абрикос',
        status: WorkStatus.PUBLISHED,
        places: {
          create: { placeId: place.id },
        },
      },
    });

    const result = await service.getBySlug(place.slug);

    expect(result.works.map((work) => work.titleRu)).toEqual([
      'Абрикос',
      'Яблоко',
    ]);
  });

  it('throws NotFoundException for draft place', async () => {
    const place = await prisma.place.create({
      data: {
        slug: `${TEST_PREFIX}-draft-place`,
        nameRu: 'Черновик',
        status: 'DRAFT',
      },
    });

    await expect(service.getBySlug(place.slug)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws NotFoundException for unknown slug', async () => {
    await expect(
      service.getBySlug(`${TEST_PREFIX}-missing`),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws NotFoundException for soft-deleted place', async () => {
    const place = await prisma.place.create({
      data: {
        slug: `${TEST_PREFIX}-deleted`,
        nameRu: 'Удалённая локация',
        status: 'PUBLISHED',
        deletedAt: new Date(),
      },
    });

    await expect(service.getBySlug(place.slug)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

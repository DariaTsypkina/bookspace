import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient, WorkStatus } from '@prisma/client';
import { CatalogModule } from './catalog.module';
import { CatalogCharacterService } from './catalog-character.service';

const prisma = new PrismaClient();

const TEST_PREFIX = 'catalog-character-spec';

async function cleanup() {
  await prisma.characterRelation.deleteMany({
    where: {
      OR: [
        { fromCharacter: { slug: { startsWith: TEST_PREFIX } } },
        { toCharacter: { slug: { startsWith: TEST_PREFIX } } },
      ],
    },
  });
  await prisma.characterAppearance.deleteMany({
    where: {
      OR: [
        { character: { slug: { startsWith: TEST_PREFIX } } },
        { work: { slug: { startsWith: TEST_PREFIX } } },
      ],
    },
  });
  await prisma.work.deleteMany({
    where: { slug: { startsWith: TEST_PREFIX } },
  });
  await prisma.character.deleteMany({
    where: { slug: { startsWith: TEST_PREFIX } },
  });
}

describe('CatalogCharacterService', () => {
  let service: CatalogCharacterService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CatalogModule],
    }).compile();

    service = module.get(CatalogCharacterService);
  });

  beforeEach(async () => {
    await cleanup();
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  it('returns nameRu and published appearances for published character', async () => {
    const character = await prisma.character.create({
      data: {
        slug: `${TEST_PREFIX}-harry`,
        nameRu: 'Гарри Поттер',
        status: 'PUBLISHED',
      },
    });
    const work = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-book-1`,
        titleRu: 'Гарри Поттер и философский камень',
        yearFirst: 1997,
        status: WorkStatus.PUBLISHED,
        characterAppearances: {
          create: { characterId: character.id },
        },
      },
    });

    const result = await service.getBySlug(character.slug);

    expect(result).toMatchObject({
      slug: character.slug,
      nameRu: 'Гарри Поттер',
      appearances: [
        {
          slug: work.slug,
          titleRu: 'Гарри Поттер и философский камень',
          yearFirst: 1997,
        },
      ],
      relations: [],
    });
  });

  it('returns nameOrig when present', async () => {
    const character = await prisma.character.create({
      data: {
        slug: `${TEST_PREFIX}-orig`,
        nameRu: 'Гарри Поттер',
        nameOrig: 'Harry Potter',
        status: 'PUBLISHED',
      },
    });

    const result = await service.getBySlug(character.slug);

    expect(result.nameOrig).toBe('Harry Potter');
  });

  it('excludes draft works from appearances', async () => {
    const character = await prisma.character.create({
      data: {
        slug: `${TEST_PREFIX}-mixed-works`,
        nameRu: 'Герой',
        status: 'PUBLISHED',
      },
    });
    await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-published-work`,
        titleRu: 'Опубликованная книга',
        status: WorkStatus.PUBLISHED,
        characterAppearances: {
          create: { characterId: character.id },
        },
      },
    });
    await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-draft-work`,
        titleRu: 'Черновик',
        status: WorkStatus.DRAFT,
        characterAppearances: {
          create: { characterId: character.id },
        },
      },
    });

    const result = await service.getBySlug(character.slug);

    expect(result.appearances).toHaveLength(1);
    expect(result.appearances[0]?.titleRu).toBe('Опубликованная книга');
  });

  it('returns empty appearances when character has no published books', async () => {
    const character = await prisma.character.create({
      data: {
        slug: `${TEST_PREFIX}-no-books`,
        nameRu: 'Персонаж без книг',
        status: 'PUBLISHED',
      },
    });

    const result = await service.getBySlug(character.slug);

    expect(result.appearances).toEqual([]);
  });

  it('sorts appearances by titleRu ascending', async () => {
    const character = await prisma.character.create({
      data: {
        slug: `${TEST_PREFIX}-sorted`,
        nameRu: 'Герой',
        status: 'PUBLISHED',
      },
    });
    await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-work-z`,
        titleRu: 'Яблоко',
        status: WorkStatus.PUBLISHED,
        characterAppearances: {
          create: { characterId: character.id },
        },
      },
    });
    await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-work-a`,
        titleRu: 'Абрикос',
        status: WorkStatus.PUBLISHED,
        characterAppearances: {
          create: { characterId: character.id },
        },
      },
    });

    const result = await service.getBySlug(character.slug);

    expect(result.appearances.map((appearance) => appearance.titleRu)).toEqual([
      'Абрикос',
      'Яблоко',
    ]);
  });

  it('returns published character relations', async () => {
    const harry = await prisma.character.create({
      data: {
        slug: `${TEST_PREFIX}-harry-rel`,
        nameRu: 'Гарри Поттер',
        status: 'PUBLISHED',
      },
    });
    const hermione = await prisma.character.create({
      data: {
        slug: `${TEST_PREFIX}-hermione`,
        nameRu: 'Гермиона Грейнджер',
        status: 'PUBLISHED',
      },
    });
    await prisma.characterRelation.create({
      data: {
        fromCharacterId: harry.id,
        toCharacterId: hermione.id,
        type: 'FRIEND',
      },
    });

    const result = await service.getBySlug(harry.slug);

    expect(result.relations).toEqual([
      {
        slug: hermione.slug,
        nameRu: 'Гермиона Грейнджер',
        type: 'FRIEND',
      },
    ]);
  });

  it('excludes relations to draft characters', async () => {
    const harry = await prisma.character.create({
      data: {
        slug: `${TEST_PREFIX}-harry-draft-rel`,
        nameRu: 'Гарри Поттер',
        status: 'PUBLISHED',
      },
    });
    const draft = await prisma.character.create({
      data: {
        slug: `${TEST_PREFIX}-draft-char`,
        nameRu: 'Черновик персонажа',
        status: 'DRAFT',
      },
    });
    await prisma.characterRelation.create({
      data: {
        fromCharacterId: harry.id,
        toCharacterId: draft.id,
        type: 'FRIEND',
      },
    });

    const result = await service.getBySlug(harry.slug);

    expect(result.relations).toEqual([]);
  });

  it('throws NotFoundException for draft character', async () => {
    const character = await prisma.character.create({
      data: {
        slug: `${TEST_PREFIX}-draft-character`,
        nameRu: 'Черновик',
        status: 'DRAFT',
      },
    });

    await expect(service.getBySlug(character.slug)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws NotFoundException for unknown slug', async () => {
    await expect(
      service.getBySlug(`${TEST_PREFIX}-missing`),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws NotFoundException for soft-deleted character', async () => {
    const character = await prisma.character.create({
      data: {
        slug: `${TEST_PREFIX}-deleted`,
        nameRu: 'Удалённый персонаж',
        status: 'PUBLISHED',
        deletedAt: new Date(),
      },
    });

    await expect(service.getBySlug(character.slug)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaClient, WorkStatus } from '@prisma/client';
import { AppModule } from '../src/app.module';
import type { CatalogCharacterResponse } from '../src/catalog/catalog-character.types';

const prisma = new PrismaClient();
const TEST_PREFIX = 'catalog-character-e2e';

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

describe('Catalog character (e2e)', () => {
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

  it('GET /catalog/characters/:slug returns published character for guest', async () => {
    const harry = await prisma.character.create({
      data: {
        slug: `${TEST_PREFIX}-harry`,
        nameRu: 'Гарри Поттер',
        nameOrig: 'Harry Potter',
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
    const work = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-book`,
        titleRu: 'Гарри Поттер и философский камень',
        yearFirst: 1997,
        status: WorkStatus.PUBLISHED,
        characterAppearances: {
          create: { characterId: harry.id },
        },
      },
    });
    await prisma.characterRelation.create({
      data: {
        fromCharacterId: harry.id,
        toCharacterId: hermione.id,
        type: 'FRIEND',
      },
    });

    const response = await request(app.getHttpServer())
      .get(`/catalog/characters/${harry.slug}`)
      .expect(200);

    const body = response.body as CatalogCharacterResponse;
    expect(body).toMatchObject({
      slug: harry.slug,
      nameRu: 'Гарри Поттер',
      nameOrig: 'Harry Potter',
      appearances: [
        {
          slug: work.slug,
          titleRu: 'Гарри Поттер и философский камень',
          yearFirst: 1997,
        },
      ],
      relations: [
        {
          slug: hermione.slug,
          nameRu: 'Гермиона Грейнджер',
          type: 'FRIEND',
        },
      ],
    });
  });

  it('GET /catalog/characters/:slug returns empty lists when no books or relations', async () => {
    const character = await prisma.character.create({
      data: {
        slug: `${TEST_PREFIX}-empty`,
        nameRu: 'Персонаж без связей',
        status: 'PUBLISHED',
      },
    });

    const response = await request(app.getHttpServer())
      .get(`/catalog/characters/${character.slug}`)
      .expect(200);

    const body = response.body as CatalogCharacterResponse;
    expect(body.appearances).toEqual([]);
    expect(body.relations).toEqual([]);
  });

  it('GET /catalog/characters/:slug returns 404 for draft character', async () => {
    const character = await prisma.character.create({
      data: {
        slug: `${TEST_PREFIX}-draft`,
        nameRu: 'Черновик',
        status: 'DRAFT',
      },
    });

    await request(app.getHttpServer())
      .get(`/catalog/characters/${character.slug}`)
      .expect(404);
  });

  it('GET /catalog/characters/:slug returns 404 for unknown slug', async () => {
    await request(app.getHttpServer())
      .get(`/catalog/characters/${TEST_PREFIX}-missing`)
      .expect(404);
  });
});

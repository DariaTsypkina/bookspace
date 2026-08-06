import { PrismaClient, UserRole, WorkStatus } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function upsertUser(email: string, password: string, role: UserRole) {
  const passwordHash = await hash(password, 10);
  const slug = email
    .split('@')[0]!
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role, slug },
    create: { email, passwordHash, role, slug },
  });
}

async function seedCatalogDemo() {
  const author = await prisma.author.upsert({
    where: { slug: 'dzh-k-rouling' },
    update: {
      nameRu: 'Дж. К. Роулинг',
      nameOrig: 'J. K. Rowling',
      status: 'PUBLISHED',
      deletedAt: null,
    },
    create: {
      slug: 'dzh-k-rouling',
      nameRu: 'Дж. К. Роулинг',
      nameOrig: 'J. K. Rowling',
      status: 'PUBLISHED',
    },
  });

  const series = await prisma.series.upsert({
    where: { slug: 'garri-potter' },
    update: {
      nameRu: 'Гарри Поттер',
      nameOrig: 'Harry Potter',
      status: 'PUBLISHED',
      deletedAt: null,
    },
    create: {
      slug: 'garri-potter',
      nameRu: 'Гарри Поттер',
      nameOrig: 'Harry Potter',
      status: 'PUBLISHED',
    },
  });

  const publishedWork = await prisma.work.upsert({
    where: { slug: 'garri-potter-filosofskiy-kamen' },
    update: {
      titleRu: 'Гарри Поттер и философский камень',
      titleOrig: 'Harry Potter and the Philosopher Stone',
      yearFirst: 1997,
      status: WorkStatus.PUBLISHED,
      deletedAt: null,
      descriptionRu:
        'Мальчик-сирота Гарри Поттер узнаёт в одиннадцать лет, что он волшебник, и отправляется в школу Хогвартс — где его ждут друзья, тайны и встреча с прошлым.',
    },
    create: {
      slug: 'garri-potter-filosofskiy-kamen',
      titleRu: 'Гарри Поттер и философский камень',
      titleOrig: 'Harry Potter and the Philosopher Stone',
      yearFirst: 1997,
      status: WorkStatus.PUBLISHED,
      descriptionRu:
        'Мальчик-сирота Гарри Поттер узнаёт в одиннадцать лет, что он волшебник, и отправляется в школу Хогвартс — где его ждут друзья, тайны и встреча с прошлым.',
    },
  });

  const sequelWork = await prisma.work.upsert({
    where: { slug: 'garri-potter-taynaya-komnata' },
    update: {
      titleRu: 'Гарри Поттер и Тайная комната',
      titleOrig: 'Harry Potter and the Chamber of Secrets',
      yearFirst: 1998,
      status: WorkStatus.PUBLISHED,
      deletedAt: null,
    },
    create: {
      slug: 'garri-potter-taynaya-komnata',
      titleRu: 'Гарри Поттер и Тайная комната',
      titleOrig: 'Harry Potter and the Chamber of Secrets',
      yearFirst: 1998,
      status: WorkStatus.PUBLISHED,
    },
  });

  await prisma.workAuthor.upsert({
    where: {
      workId_authorId: {
        workId: publishedWork.id,
        authorId: author.id,
      },
    },
    update: { position: 0 },
    create: {
      workId: publishedWork.id,
      authorId: author.id,
      position: 0,
    },
  });

  await prisma.workAuthor.upsert({
    where: {
      workId_authorId: {
        workId: sequelWork.id,
        authorId: author.id,
      },
    },
    update: { position: 0 },
    create: {
      workId: sequelWork.id,
      authorId: author.id,
      position: 0,
    },
  });

  await prisma.workSeries.upsert({
    where: {
      workId_seriesId: {
        workId: publishedWork.id,
        seriesId: series.id,
      },
    },
    update: { positionInSeries: 1 },
    create: {
      workId: publishedWork.id,
      seriesId: series.id,
      positionInSeries: 1,
    },
  });

  await prisma.workSeries.upsert({
    where: {
      workId_seriesId: {
        workId: sequelWork.id,
        seriesId: series.id,
      },
    },
    update: { positionInSeries: 2 },
    create: {
      workId: sequelWork.id,
      seriesId: series.id,
      positionInSeries: 2,
    },
  });

  await prisma.workRelation.upsert({
    where: {
      fromWorkId_toWorkId_type: {
        fromWorkId: publishedWork.id,
        toWorkId: sequelWork.id,
        type: 'SEQUEL',
      },
    },
    update: { readingOrder: 2 },
    create: {
      fromWorkId: publishedWork.id,
      toWorkId: sequelWork.id,
      type: 'SEQUEL',
      readingOrder: 2,
    },
  });

  await prisma.edition.deleteMany({ where: { workId: publishedWork.id } });
  await prisma.edition.createMany({
    data: [
      {
        workId: publishedWork.id,
        language: 'ru',
        translator: 'М. Спивак',
        publisher: 'Росмэн',
        year: 2000,
        isbn13: '9785171234567',
      },
      {
        workId: publishedWork.id,
        language: 'en',
        publisher: 'Bloomsbury',
        year: 1997,
      },
    ],
  });

  await prisma.work.upsert({
    where: { slug: 'garri-potter-draft' },
    update: {
      titleRu: 'Гарри Поттер — черновик',
      status: WorkStatus.DRAFT,
    },
    create: {
      slug: 'garri-potter-draft',
      titleRu: 'Гарри Поттер — черновик',
      status: WorkStatus.DRAFT,
    },
  });

  const harry = await prisma.character.upsert({
    where: { slug: 'garri-potter' },
    update: {
      nameRu: 'Гарри Поттер',
      nameOrig: 'Harry Potter',
      status: 'PUBLISHED',
      deletedAt: null,
    },
    create: {
      slug: 'garri-potter',
      nameRu: 'Гарри Поттер',
      nameOrig: 'Harry Potter',
      status: 'PUBLISHED',
    },
  });

  const hermione = await prisma.character.upsert({
    where: { slug: 'germiona-greindzher' },
    update: {
      nameRu: 'Гермиона Грейнджер',
      nameOrig: 'Hermione Granger',
      status: 'PUBLISHED',
      deletedAt: null,
    },
    create: {
      slug: 'germiona-greindzher',
      nameRu: 'Гермиона Грейнджер',
      nameOrig: 'Hermione Granger',
      status: 'PUBLISHED',
    },
  });

  const ron = await prisma.character.upsert({
    where: { slug: 'ron-uizli' },
    update: {
      nameRu: 'Рон Уизли',
      nameOrig: 'Ron Weasley',
      status: 'PUBLISHED',
      deletedAt: null,
    },
    create: {
      slug: 'ron-uizli',
      nameRu: 'Рон Уизли',
      nameOrig: 'Ron Weasley',
      status: 'PUBLISHED',
    },
  });

  await prisma.characterAppearance.upsert({
    where: {
      characterId_workId: {
        characterId: harry.id,
        workId: publishedWork.id,
      },
    },
    update: {},
    create: {
      characterId: harry.id,
      workId: publishedWork.id,
    },
  });

  await prisma.characterAppearance.upsert({
    where: {
      characterId_workId: {
        characterId: hermione.id,
        workId: publishedWork.id,
      },
    },
    update: {},
    create: {
      characterId: hermione.id,
      workId: publishedWork.id,
    },
  });

  await prisma.characterRelation.upsert({
    where: {
      fromCharacterId_toCharacterId_type: {
        fromCharacterId: harry.id,
        toCharacterId: hermione.id,
        type: 'FRIEND',
      },
    },
    update: {},
    create: {
      fromCharacterId: harry.id,
      toCharacterId: hermione.id,
      type: 'FRIEND',
    },
  });

  await prisma.characterRelation.upsert({
    where: {
      fromCharacterId_toCharacterId_type: {
        fromCharacterId: harry.id,
        toCharacterId: ron.id,
        type: 'FRIEND',
      },
    },
    update: {},
    create: {
      fromCharacterId: harry.id,
      toCharacterId: ron.id,
      type: 'FRIEND',
    },
  });

  const wizardingWorld = await prisma.world.upsert({
    where: { slug: 'volshebnyy-mir' },
    update: {
      nameRu: 'Волшебный мир',
      nameOrig: 'Wizarding World',
      descriptionRu: 'Мир волшебников и магии.',
      status: 'PUBLISHED',
      deletedAt: null,
    },
    create: {
      slug: 'volshebnyy-mir',
      nameRu: 'Волшебный мир',
      nameOrig: 'Wizarding World',
      descriptionRu: 'Мир волшебников и магии.',
      status: 'PUBLISHED',
    },
  });

  const hogwarts = await prisma.place.upsert({
    where: { slug: 'hogvarts' },
    update: {
      nameRu: 'Хогвартс',
      nameOrig: 'Hogwarts',
      status: 'PUBLISHED',
      worldId: wizardingWorld.id,
      deletedAt: null,
    },
    create: {
      slug: 'hogvarts',
      nameRu: 'Хогвартс',
      nameOrig: 'Hogwarts',
      status: 'PUBLISHED',
      worldId: wizardingWorld.id,
    },
  });

  await prisma.place.upsert({
    where: { slug: 'kosoy-pereulok' },
    update: {
      nameRu: 'Косой переулок',
      nameOrig: 'Diagon Alley',
      status: 'PUBLISHED',
      worldId: wizardingWorld.id,
      deletedAt: null,
    },
    create: {
      slug: 'kosoy-pereulok',
      nameRu: 'Косой переулок',
      nameOrig: 'Diagon Alley',
      status: 'PUBLISHED',
      worldId: wizardingWorld.id,
    },
  });

  await prisma.workPlace.upsert({
    where: {
      workId_placeId: {
        workId: publishedWork.id,
        placeId: hogwarts.id,
      },
    },
    update: {},
    create: {
      workId: publishedWork.id,
      placeId: hogwarts.id,
    },
  });
}

async function main() {
  await upsertUser('admin@bookspace.local', 'Admin123!', UserRole.ADMIN);
  await upsertUser('user@bookspace.local', 'User123!', UserRole.USER);
  await seedCatalogDemo();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

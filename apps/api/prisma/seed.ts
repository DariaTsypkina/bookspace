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
    },
    create: {
      slug: 'garri-potter-filosofskiy-kamen',
      titleRu: 'Гарри Поттер и философский камень',
      titleOrig: 'Harry Potter and the Philosopher Stone',
      yearFirst: 1997,
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

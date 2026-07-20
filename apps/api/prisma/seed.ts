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
  await prisma.work.upsert({
    where: { slug: 'garri-potter-filosofskiy-kamen' },
    update: {
      titleRu: 'Гарри Поттер и философский камень',
      titleOrig: 'Harry Potter and the Philosopher Stone',
      status: WorkStatus.PUBLISHED,
      deletedAt: null,
    },
    create: {
      slug: 'garri-potter-filosofskiy-kamen',
      titleRu: 'Гарри Поттер и философский камень',
      titleOrig: 'Harry Potter and the Philosopher Stone',
      status: WorkStatus.PUBLISHED,
    },
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

  await prisma.author.upsert({
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

import { ContextReadingStatus, PrismaClient, WorkStatus } from '@prisma/client';

const prefix = process.argv[2];
const action = process.argv[3];

if (!prefix || !action) {
  console.error('Usage: tsx admin-context-fixture.ts <prefix> seed|cleanup');
  process.exit(1);
}

const prisma = new PrismaClient();

async function seed() {
  const subject = await prisma.work.upsert({
    where: { slug: `${prefix}-subject` },
    update: {
      titleRu: 'PW Subject',
      status: WorkStatus.PUBLISHED,
      deletedAt: null,
    },
    create: {
      slug: `${prefix}-subject`,
      titleRu: 'PW Subject',
      status: WorkStatus.PUBLISHED,
    },
  });
  const recommended = await prisma.work.upsert({
    where: { slug: `${prefix}-rec` },
    update: {
      titleRu: 'PW Rec',
      status: WorkStatus.PUBLISHED,
      deletedAt: null,
    },
    create: {
      slug: `${prefix}-rec`,
      titleRu: 'PW Rec',
      status: WorkStatus.PUBLISHED,
    },
  });
  await prisma.contextReading.upsert({
    where: {
      subjectWorkId_recommendedWorkId: {
        subjectWorkId: subject.id,
        recommendedWorkId: recommended.id,
      },
    },
    update: {
      whyText: 'Playwright why text',
      importanceRank: 2,
      status: ContextReadingStatus.PUBLISHED,
      publishedAt: new Date(),
    },
    create: {
      subjectWorkId: subject.id,
      recommendedWorkId: recommended.id,
      whyText: 'Playwright why text',
      importanceRank: 2,
      status: ContextReadingStatus.PUBLISHED,
      publishedAt: new Date(),
    },
  });
}

async function cleanup() {
  const works = await prisma.work.findMany({
    where: { slug: { startsWith: prefix } },
    select: { id: true },
  });
  const ids = works.map((work: { id: string }) => work.id);
  if (ids.length > 0) {
    await prisma.contextReading.deleteMany({
      where: { subjectWorkId: { in: ids } },
    });
    await prisma.work.deleteMany({ where: { id: { in: ids } } });
  }
}

async function main() {
  if (action === 'seed') {
    await seed();
    return;
  }
  if (action === 'cleanup') {
    await cleanup();
    return;
  }
  throw new Error(`Unknown action: ${action}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

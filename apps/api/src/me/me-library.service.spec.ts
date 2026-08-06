import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient, UserRole, WorkStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MeLibraryService } from './me-library.service';

const prisma = new PrismaClient();
const TEST_PREFIX = 'me-library-svc';

async function cleanup() {
  await prisma.userBook.deleteMany({
    where: {
      OR: [
        { user: { email: { startsWith: `${TEST_PREFIX}-` } } },
        { work: { slug: { startsWith: TEST_PREFIX } } },
      ],
    },
  });
  await prisma.work.deleteMany({
    where: { slug: { startsWith: TEST_PREFIX } },
  });
  await prisma.user.deleteMany({
    where: { email: { startsWith: `${TEST_PREFIX}-` } },
  });
}

describe('MeLibraryService', () => {
  let service: MeLibraryService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MeLibraryService, PrismaService],
    }).compile();
    service = module.get(MeLibraryService);
  });

  beforeEach(async () => {
    await cleanup();
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  async function seedUserAndWork(opts?: {
    role?: UserRole;
    workStatus?: WorkStatus;
  }) {
    const user = await prisma.user.create({
      data: {
        email: `${TEST_PREFIX}-user@bookspace.local`,
        slug: `${TEST_PREFIX}-user`,
        role: opts?.role ?? UserRole.USER,
        passwordHash: 'x',
      },
    });
    const work = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-work`,
        titleRu: 'Тестовая книга',
        status: opts?.workStatus ?? WorkStatus.PUBLISHED,
      },
    });
    return { user, work };
  }

  it('upserts status and rating for published work; sets finishedAt on READ', async () => {
    const { user, work } = await seedUserAndWork();

    const created = await service.upsert(user.id, {
      workSlug: work.slug,
      status: 'READING',
      rating: 7,
    });

    expect(created).toMatchObject({
      userId: user.id,
      workId: work.id,
      workSlug: work.slug,
      titleRu: 'Тестовая книга',
      status: 'READING',
      rating: 7,
      finishedAt: null,
      tags: [],
    });
    expect(created.id).toBeTruthy();

    const read = await service.upsert(user.id, {
      workId: work.id,
      status: 'READ',
      rating: 9,
    });
    expect(read.status).toBe('READ');
    expect(read.rating).toBe(9);
    expect(read.finishedAt).toBeTruthy();

    const stored = await prisma.userBook.findUnique({
      where: { userId_workId: { userId: user.id, workId: work.id } },
    });
    expect(stored?.status).toBe('READ');
    expect(stored?.rating).toBe(9);
    expect(stored?.finishedAt).not.toBeNull();
  });

  it('clears finishedAt when leaving READ', async () => {
    const { user, work } = await seedUserAndWork();
    await service.upsert(user.id, {
      workSlug: work.slug,
      status: 'READ',
      rating: 5,
    });
    const again = await service.upsert(user.id, {
      workSlug: work.slug,
      status: 'ABANDONED',
    });
    expect(again.status).toBe('ABANDONED');
    expect(again.finishedAt).toBeNull();
  });

  it('rejects missing/draft work with NotFoundException', async () => {
    const { user } = await seedUserAndWork({
      workStatus: WorkStatus.DRAFT,
    });
    await expect(
      service.upsert(user.id, {
        workSlug: `${TEST_PREFIX}-work`,
        status: 'WANT',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);

    await expect(
      service.upsert(user.id, {
        workSlug: `${TEST_PREFIX}-missing`,
        status: 'WANT',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects upsert without workId/workSlug', async () => {
    const { user } = await seedUserAndWork();
    await expect(
      service.upsert(user.id, { status: 'WANT' } as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('getByWorkSlug returns own item or null', async () => {
    const { user, work } = await seedUserAndWork();
    expect(await service.getByWorkSlug(user.id, work.slug)).toBeNull();
    await service.upsert(user.id, {
      workSlug: work.slug,
      status: 'WANT',
    });
    const item = await service.getByWorkSlug(user.id, work.slug);
    expect(item?.status).toBe('WANT');
  });

  it('patch updates fields; 404 if item missing', async () => {
    const { user, work } = await seedUserAndWork();
    await expect(
      service.patch(user.id, work.slug, { rating: 3 }),
    ).rejects.toBeInstanceOf(NotFoundException);

    await service.upsert(user.id, {
      workSlug: work.slug,
      status: 'READING',
    });
    const patched = await service.patch(user.id, work.slug, {
      status: 'READ',
      rating: 10,
    });
    expect(patched.status).toBe('READ');
    expect(patched.rating).toBe(10);
    expect(patched.finishedAt).toBeTruthy();
  });

  it('listPublicBySlug returns published items for guest; 404 deleted/missing', async () => {
    const { user, work } = await seedUserAndWork();
    await service.upsert(user.id, {
      workSlug: work.slug,
      status: 'READ',
      rating: 8,
    });

    const pub = await service.listPublicBySlug(user.slug);
    expect(pub.slug).toBe(user.slug);
    expect(pub.items).toHaveLength(1);
    expect(pub.items[0]).toMatchObject({
      workSlug: work.slug,
      titleRu: 'Тестовая книга',
      status: 'READ',
      rating: 8,
      tags: [],
    });
    expect(pub.items[0].finishedAt).toBeTruthy();

    await expect(
      service.listPublicBySlug(`${TEST_PREFIX}-nope`),
    ).rejects.toBeInstanceOf(NotFoundException);

    await prisma.user.update({
      where: { id: user.id },
      data: { deletedAt: new Date() },
    });
    await expect(service.listPublicBySlug(user.slug)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('listPublicBySlug hides draft works', async () => {
    const { user, work } = await seedUserAndWork();
    await service.upsert(user.id, {
      workSlug: work.slug,
      status: 'WANT',
    });
    await prisma.work.update({
      where: { id: work.id },
      data: { status: WorkStatus.DRAFT },
    });
    const pub = await service.listPublicBySlug(user.slug);
    expect(pub.items).toHaveLength(0);
  });

  it('listPublicBySlug returns empty PUBLIC notes and null goal (no Note/ReadingGoal yet)', async () => {
    const { user, work } = await seedUserAndWork();
    await service.upsert(user.id, {
      workSlug: work.slug,
      status: 'READING',
    });
    const pub = await service.listPublicBySlug(user.slug);
    expect(pub.notes).toEqual([]);
    expect(pub.goal).toBeNull();
  });

  it('getPublicBySlugAndWorkSlug returns owner status/rating/tags; 404 missing', async () => {
    const { user, work } = await seedUserAndWork();
    await service.upsert(user.id, {
      workSlug: work.slug,
      status: 'READ',
      rating: 8,
    });

    const detail = await service.getPublicBySlugAndWorkSlug(
      user.slug,
      work.slug,
    );
    expect(detail).toMatchObject({
      slug: user.slug,
      workSlug: work.slug,
      titleRu: 'Тестовая книга',
      status: 'READ',
      rating: 8,
      tags: [],
      notes: [],
    });
    expect(detail.finishedAt).toBeTruthy();

    await expect(
      service.getPublicBySlugAndWorkSlug(user.slug, `${TEST_PREFIX}-nope`),
    ).rejects.toBeInstanceOf(NotFoundException);

    await expect(
      service.getPublicBySlugAndWorkSlug(`${TEST_PREFIX}-nope`, work.slug),
    ).rejects.toBeInstanceOf(NotFoundException);

    const otherWork = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-other`,
        titleRu: 'Другая',
        status: WorkStatus.PUBLISHED,
      },
    });
    await expect(
      service.getPublicBySlugAndWorkSlug(user.slug, otherWork.slug),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('list returns owner collection; filters by status; hides drafts', async () => {
    const user = await prisma.user.create({
      data: {
        email: `${TEST_PREFIX}-list@bookspace.local`,
        slug: `${TEST_PREFIX}-list`,
        role: UserRole.USER,
        passwordHash: 'x',
      },
    });
    const want = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-want`,
        titleRu: 'Хочу',
        status: WorkStatus.PUBLISHED,
      },
    });
    const reading = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-reading`,
        titleRu: 'Читаю',
        status: WorkStatus.PUBLISHED,
      },
    });
    const draft = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-draft`,
        titleRu: 'Черновик',
        status: WorkStatus.PUBLISHED,
      },
    });

    await service.upsert(user.id, {
      workSlug: want.slug,
      status: 'WANT',
      rating: 4,
    });
    await service.upsert(user.id, {
      workSlug: reading.slug,
      status: 'READING',
    });
    await service.upsert(user.id, {
      workSlug: draft.slug,
      status: 'READ',
    });
    await prisma.work.update({
      where: { id: draft.id },
      data: { status: WorkStatus.DRAFT },
    });

    const all = await service.list(user.id);
    expect(all.map((i) => i.workSlug).sort()).toEqual(
      [`${TEST_PREFIX}-reading`, `${TEST_PREFIX}-want`].sort(),
    );

    const filtered = await service.list(user.id, 'WANT');
    expect(filtered).toHaveLength(1);
    expect(filtered[0]).toMatchObject({
      workSlug: want.slug,
      titleRu: 'Хочу',
      status: 'WANT',
      rating: 4,
    });

    const empty = await service.list(user.id, 'ABANDONED');
    expect(empty).toEqual([]);
  });
});

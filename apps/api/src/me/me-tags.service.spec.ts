import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient, UserRole, WorkStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MeTagsService } from './me-tags.service';

const prisma = new PrismaClient();
const TEST_PREFIX = 'me-tags-svc';

async function cleanup() {
  await prisma.userBookTag.deleteMany({
    where: {
      OR: [
        { tag: { user: { email: { startsWith: `${TEST_PREFIX}-` } } } },
        { userBook: { user: { email: { startsWith: `${TEST_PREFIX}-` } } } },
        { userBook: { work: { slug: { startsWith: TEST_PREFIX } } } },
      ],
    },
  });
  await prisma.tag.deleteMany({
    where: {
      OR: [
        { user: { email: { startsWith: `${TEST_PREFIX}-` } } },
        { name: { startsWith: TEST_PREFIX } },
      ],
    },
  });
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

describe('MeTagsService (bd-cq7.3)', () => {
  let service: MeTagsService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MeTagsService, PrismaService],
    }).compile();
    service = module.get(MeTagsService);
  });

  beforeEach(async () => {
    await cleanup();
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  async function seedUserAndWork() {
    const user = await prisma.user.create({
      data: {
        email: `${TEST_PREFIX}-user@bookspace.local`,
        slug: `${TEST_PREFIX}-user`,
        role: UserRole.USER,
        passwordHash: 'x',
      },
    });
    const work = await prisma.work.create({
      data: {
        slug: `${TEST_PREFIX}-work`,
        titleRu: 'Книга с тегом',
        status: WorkStatus.PUBLISHED,
      },
    });
    return { user, work };
  }

  it('creates and lists tags; duplicate name → Conflict', async () => {
    const { user } = await seedUserAndWork();

    const created = await service.create(user.id, { name: 'фэнтези' });
    expect(created).toMatchObject({ name: 'фэнтези' });
    expect(created.id).toBeTruthy();

    await expect(
      service.create(user.id, { name: 'фэнтези' }),
    ).rejects.toBeInstanceOf(ConflictException);

    const listed = await service.list(user.id);
    expect(listed).toEqual([expect.objectContaining({ name: 'фэнтези' })]);
  });

  it('assigns by name only if UserBook exists; unassign and delete keep UserBook', async () => {
    const { user, work } = await seedUserAndWork();

    await expect(
      service.assignToWork(user.id, work.slug, { name: 'классика' }),
    ).rejects.toBeInstanceOf(BadRequestException);

    await prisma.userBook.create({
      data: {
        userId: user.id,
        workId: work.id,
        status: 'READING',
      },
    });

    const assigned = await service.assignToWork(user.id, work.slug, {
      name: 'классика',
    });
    expect(assigned.tags).toEqual([
      expect.objectContaining({ name: 'классика' }),
    ]);

    const tagId = assigned.tags[0].id;
    const afterUnassign = await service.unassignFromWork(
      user.id,
      work.slug,
      tagId,
    );
    expect(afterUnassign.tags).toEqual([]);

    await service.assignToWork(user.id, work.slug, { tagId });
    await service.remove(user.id, tagId);

    expect(
      await prisma.userBook.findUnique({
        where: { userId_workId: { userId: user.id, workId: work.id } },
      }),
    ).toBeTruthy();
    expect(await prisma.tag.findUnique({ where: { id: tagId } })).toBeNull();
  });

  it('foreign tag → 404; missing work → 404', async () => {
    const { user, work } = await seedUserAndWork();
    const other = await prisma.user.create({
      data: {
        email: `${TEST_PREFIX}-other@bookspace.local`,
        slug: `${TEST_PREFIX}-other`,
        role: UserRole.USER,
        passwordHash: 'x',
      },
    });
    const foreignTag = await prisma.tag.create({
      data: { userId: other.id, name: 'чужой' },
    });
    await prisma.userBook.create({
      data: { userId: user.id, workId: work.id, status: 'WANT' },
    });

    await expect(
      service.assignToWork(user.id, work.slug, { tagId: foreignTag.id }),
    ).rejects.toBeInstanceOf(NotFoundException);

    await expect(
      service.assignToWork(user.id, `${TEST_PREFIX}-missing`, {
        name: 'x',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

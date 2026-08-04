import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient, UserRole, WorkStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MeShelvesService } from './me-shelves.service';

const prisma = new PrismaClient();
const TEST_PREFIX = 'me-shelves-svc';

async function cleanup() {
  await prisma.shelfItem.deleteMany({
    where: {
      OR: [
        { shelf: { user: { email: { startsWith: `${TEST_PREFIX}-` } } } },
        { work: { slug: { startsWith: TEST_PREFIX } } },
      ],
    },
  });
  await prisma.shelf.deleteMany({
    where: {
      OR: [
        { user: { email: { startsWith: `${TEST_PREFIX}-` } } },
        { slug: { startsWith: TEST_PREFIX } },
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

describe('MeShelvesService (bd-cq7.2)', () => {
  let service: MeShelvesService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MeShelvesService, PrismaService],
    }).compile();
    service = module.get(MeShelvesService);
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
        titleRu: 'Книга на полку',
        status: WorkStatus.PUBLISHED,
      },
    });
    return { user, work };
  }

  it('creates shelf with slug from title; lists and gets with empty items', async () => {
    const { user } = await seedUserAndWork();

    const created = await service.create(user.id, {
      title: 'Любимое',
      description: 'На вечер',
    });

    expect(created).toMatchObject({
      title: 'Любимое',
      description: 'На вечер',
      itemCount: 0,
    });
    expect(created.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    expect(created.id).toBeTruthy();

    const listed = await service.list(user.id);
    expect(listed).toHaveLength(1);
    expect(listed[0].id).toBe(created.id);

    const one = await service.get(user.id, created.id);
    expect(one.items).toEqual([]);
    expect(one.itemCount).toBe(0);
  });

  it('adds work only if UserBook exists; remove item keeps UserBook; delete shelf keeps UserBook', async () => {
    const { user, work } = await seedUserAndWork();
    const shelf = await service.create(user.id, {
      title: 'Читаю',
      slug: `${TEST_PREFIX}-reading`,
    });

    await expect(
      service.addItem(user.id, shelf.id, { workSlug: work.slug }),
    ).rejects.toBeInstanceOf(BadRequestException);

    await prisma.userBook.create({
      data: {
        userId: user.id,
        workId: work.id,
        status: 'READING',
      },
    });

    const withItem = await service.addItem(user.id, shelf.id, {
      workSlug: work.slug,
    });
    expect(withItem.itemCount).toBe(1);
    expect(withItem.items?.[0]).toMatchObject({
      workSlug: work.slug,
      titleRu: 'Книга на полку',
    });

    await service.removeItem(user.id, shelf.id, work.slug);
    const afterRemove = await service.get(user.id, shelf.id);
    expect(afterRemove.itemCount).toBe(0);
    expect(
      await prisma.userBook.findUnique({
        where: { userId_workId: { userId: user.id, workId: work.id } },
      }),
    ).toBeTruthy();

    await service.addItem(user.id, shelf.id, { workId: work.id });
    await service.remove(user.id, shelf.id);
    await expect(service.get(user.id, shelf.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(
      await prisma.userBook.findUnique({
        where: { userId_workId: { userId: user.id, workId: work.id } },
      }),
    ).toBeTruthy();
  });

  it('update renames; foreign shelf → 404; public list by slug', async () => {
    const { user, work } = await seedUserAndWork();
    const other = await prisma.user.create({
      data: {
        email: `${TEST_PREFIX}-other@bookspace.local`,
        slug: `${TEST_PREFIX}-other`,
        role: UserRole.USER,
        passwordHash: 'x',
      },
    });
    const shelf = await service.create(user.id, {
      title: 'Старое',
      slug: `${TEST_PREFIX}-old`,
    });
    await prisma.userBook.create({
      data: { userId: user.id, workId: work.id, status: 'WANT' },
    });
    await service.addItem(user.id, shelf.id, { workSlug: work.slug });

    const updated = await service.update(user.id, shelf.id, {
      title: 'Новое',
      description: null,
    });
    expect(updated.title).toBe('Новое');
    expect(updated.description).toBeNull();

    await expect(service.get(other.id, shelf.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );

    const pub = await service.listPublicByUserSlug(user.slug);
    expect(pub.slug).toBe(user.slug);
    expect(pub.shelves).toEqual([
      expect.objectContaining({
        slug: `${TEST_PREFIX}-old`,
        title: 'Новое',
        itemCount: 1,
      }),
    ]);

    const detail = await service.getPublicByUserAndShelfSlug(
      user.slug,
      `${TEST_PREFIX}-old`,
    );
    expect(detail.items).toEqual([
      expect.objectContaining({
        workSlug: work.slug,
        titleRu: 'Книга на полку',
      }),
    ]);
  });

  it('public missing user → 404', async () => {
    await expect(
      service.listPublicByUserSlug(`${TEST_PREFIX}-missing`),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

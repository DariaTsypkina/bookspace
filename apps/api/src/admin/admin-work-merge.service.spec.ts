import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  ExternalIdEntityType,
  UserBookStatus,
  WorkStatus,
} from '@prisma/client';
import { AUDIT_ACTION, AUDIT_ENTITY } from '../audit/audit.constants';
import { AdminWorkMergeService } from './admin-work-merge.service';

describe('AdminWorkMergeService', () => {
  const tx = {
    work: {
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    userBook: {
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    contextReading: {
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    externalId: {
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    edition: {
      updateMany: jest.fn(),
    },
    workAuthor: {
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
    },
    workSeries: {
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
    },
    workPlace: {
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
    },
    characterAppearance: {
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
    },
    shelfItem: {
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    workRelation: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    matchQueue: {
      updateMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  };

  const prisma = {
    work: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    externalId: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  let service: AdminWorkMergeService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(
      async (fn: (client: typeof tx) => Promise<unknown>) => fn(tx),
    );
    service = new AdminWorkMergeService(prisma as never);
  });

  describe('mergeWorks', () => {
    it('reassigns UserBook/ExternalId, marks duplicates MERGED, writes WORK_MERGE audit', async () => {
      const canonical = {
        id: 'canon',
        slug: 'canon',
        titleRu: 'Канон',
        status: WorkStatus.PUBLISHED,
        deletedAt: null,
        mergedIntoId: null,
      };
      const duplicate = {
        id: 'dup',
        slug: 'dup',
        titleRu: 'Дубль',
        status: WorkStatus.DRAFT,
        deletedAt: null,
        mergedIntoId: null,
      };

      prisma.work.findMany.mockResolvedValue([canonical, duplicate]);

      tx.userBook.findMany
        .mockResolvedValueOnce([
          {
            id: 'ub-dup',
            userId: 'u1',
            workId: 'dup',
            status: UserBookStatus.READ,
          },
        ])
        .mockResolvedValueOnce([]);
      tx.userBook.update.mockResolvedValue({});

      tx.contextReading.findMany.mockResolvedValue([]);
      tx.externalId.findMany
        .mockResolvedValueOnce([
          {
            id: 'ext-dup',
            entityType: ExternalIdEntityType.WORK,
            entityId: 'dup',
            source: 'openlibrary',
            externalKey: 'OL123',
          },
        ])
        .mockResolvedValueOnce([]);
      tx.externalId.update.mockResolvedValue({});

      tx.workAuthor.findMany.mockResolvedValue([]);
      tx.workSeries.findMany.mockResolvedValue([]);
      tx.workPlace.findMany.mockResolvedValue([]);
      tx.characterAppearance.findMany.mockResolvedValue([]);
      tx.shelfItem.findMany.mockResolvedValue([]);
      tx.workRelation.findMany.mockResolvedValue([]);
      tx.edition.updateMany.mockResolvedValue({ count: 1 });
      tx.matchQueue.updateMany.mockResolvedValue({ count: 0 });
      tx.work.update.mockResolvedValue({
        ...duplicate,
        status: WorkStatus.MERGED,
        mergedIntoId: 'canon',
      });
      tx.auditLog.create.mockResolvedValue({});

      const result = await service.mergeWorks('canon', ['dup'], 'admin-1');

      expect(tx.userBook.update).toHaveBeenCalledWith({
        where: { id: 'ub-dup' },
        data: { workId: 'canon' },
      });
      expect(tx.externalId.update).toHaveBeenCalledWith({
        where: { id: 'ext-dup' },
        data: { entityId: 'canon' },
      });
      expect(tx.work.update).toHaveBeenCalledWith({
        where: { id: 'dup' },
        data: {
          status: WorkStatus.MERGED,
          mergedIntoId: 'canon',
        },
      });
      expect(tx.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          actorUserId: 'admin-1',
          action: AUDIT_ACTION.WORK_MERGE,
          entityType: AUDIT_ENTITY.WORK,
          entityId: 'canon',
        }) as Record<string, unknown>,
      });
      expect(result).toEqual(
        expect.objectContaining({
          canonicalId: 'canon',
          mergedIds: ['dup'],
        }),
      );
    });

    it('keeps canonical UserBook and deletes duplicate on userId+workId conflict', async () => {
      prisma.work.findMany.mockResolvedValue([
        {
          id: 'canon',
          slug: 'canon',
          titleRu: 'Канон',
          status: WorkStatus.PUBLISHED,
          deletedAt: null,
          mergedIntoId: null,
        },
        {
          id: 'dup',
          slug: 'dup',
          titleRu: 'Дубль',
          status: WorkStatus.DRAFT,
          deletedAt: null,
          mergedIntoId: null,
        },
      ]);

      tx.userBook.findMany
        .mockResolvedValueOnce([
          {
            id: 'ub-dup',
            userId: 'u1',
            workId: 'dup',
            status: UserBookStatus.WANT,
          },
        ])
        .mockResolvedValueOnce([
          {
            id: 'ub-canon',
            userId: 'u1',
            workId: 'canon',
            status: UserBookStatus.READ,
          },
        ]);
      tx.userBook.delete.mockResolvedValue({});
      tx.contextReading.findMany.mockResolvedValue([]);
      tx.externalId.findMany.mockResolvedValue([]);
      tx.workAuthor.findMany.mockResolvedValue([]);
      tx.workSeries.findMany.mockResolvedValue([]);
      tx.workPlace.findMany.mockResolvedValue([]);
      tx.characterAppearance.findMany.mockResolvedValue([]);
      tx.shelfItem.findMany.mockResolvedValue([]);
      tx.workRelation.findMany.mockResolvedValue([]);
      tx.edition.updateMany.mockResolvedValue({ count: 0 });
      tx.matchQueue.updateMany.mockResolvedValue({ count: 0 });
      tx.work.update.mockResolvedValue({});
      tx.auditLog.create.mockResolvedValue({});

      await service.mergeWorks('canon', ['dup'], 'admin-1');

      expect(tx.userBook.delete).toHaveBeenCalledWith({
        where: { id: 'ub-dup' },
      });
      expect(tx.userBook.update).not.toHaveBeenCalled();
    });

    it('rejects when canonical is in duplicates', async () => {
      await expect(
        service.mergeWorks('canon', ['canon'], 'admin-1'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects empty duplicates', async () => {
      await expect(
        service.mergeWorks('canon', [], 'admin-1'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects missing works', async () => {
      prisma.work.findMany.mockResolvedValue([
        {
          id: 'canon',
          slug: 'canon',
          titleRu: 'Канон',
          status: WorkStatus.PUBLISHED,
          deletedAt: null,
          mergedIntoId: null,
        },
      ]);

      await expect(
        service.mergeWorks('canon', ['missing'], 'admin-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects already MERGED or soft-deleted works', async () => {
      prisma.work.findMany.mockResolvedValue([
        {
          id: 'canon',
          slug: 'canon',
          titleRu: 'Канон',
          status: WorkStatus.PUBLISHED,
          deletedAt: null,
          mergedIntoId: null,
        },
        {
          id: 'dup',
          slug: 'dup',
          titleRu: 'Дубль',
          status: WorkStatus.MERGED,
          deletedAt: null,
          mergedIntoId: 'other',
        },
      ]);

      await expect(
        service.mergeWorks('canon', ['dup'], 'admin-1'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});

import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import {
  CatalogEntityStatus,
  ExternalIdEntityType,
  NeedsContext,
  WorkStatus,
} from '@prisma/client';
import { AUDIT_ACTION, AUDIT_ENTITY } from '../audit/audit.constants';
import type { AuditLogInput } from '../audit/audit.service';
import { AdminCatalogService } from './admin-catalog.service';

describe('AdminCatalogService', () => {
  const namedCrud = () => ({
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  });

  const prisma = {
    work: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    author: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    workAuthor: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    edition: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    externalId: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    series: namedCrud(),
    character: namedCrud(),
    world: namedCrud(),
    place: namedCrud(),
  };

  const audit = {
    log: jest.fn(),
  };

  let service: AdminCatalogService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AdminCatalogService(prisma as never, audit as never);
  });

  describe('createWork', () => {
    it('creates a DRAFT work with generated slug', async () => {
      prisma.work.findFirst.mockResolvedValue(null);
      prisma.work.create.mockResolvedValue({
        id: 'w1',
        slug: 'vojna-i-mir',
        titleRu: 'Война и мир',
        titleOrig: null,
        yearFirst: 1869,
        descriptionRu: null,
        status: WorkStatus.DRAFT,
        needsContext: NeedsContext.UNKNOWN,
        deletedAt: null,
      });

      const work = await service.createWork({
        titleRu: 'Война и мир',
        yearFirst: 1869,
      });

      expect(prisma.work.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          titleRu: 'Война и мир',
          yearFirst: 1869,
          status: WorkStatus.DRAFT,
          needsContext: NeedsContext.UNKNOWN,
          slug: expect.stringMatching(/^[a-z0-9-]+$/) as string,
        }) as Record<string, unknown>,
      });
      expect(work.status).toBe(WorkStatus.DRAFT);
    });
  });

  describe('updateWork', () => {
    it('updates mutable fields on a non-deleted work', async () => {
      prisma.work.findUnique.mockResolvedValue({
        id: 'w1',
        status: WorkStatus.DRAFT,
        deletedAt: null,
      });
      prisma.work.update.mockResolvedValue({
        id: 'w1',
        titleRu: 'Новое название',
        status: WorkStatus.DRAFT,
      });

      await service.updateWork('w1', {
        titleRu: 'Новое название',
        needsContext: 'YES',
      });

      expect(prisma.work.update).toHaveBeenCalledWith({
        where: { id: 'w1' },
        data: expect.objectContaining({
          titleRu: 'Новое название',
          needsContext: NeedsContext.YES,
        }) as Record<string, unknown>,
      });
    });

    it('rejects update of soft-deleted work', async () => {
      prisma.work.findUnique.mockResolvedValue({
        id: 'w1',
        deletedAt: new Date(),
      });

      await expect(
        service.updateWork('w1', { titleRu: 'X' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('publishWork', () => {
    it('publishes DRAFT → PUBLISHED and writes audit', async () => {
      prisma.work.findUnique.mockResolvedValue({
        id: 'w1',
        status: WorkStatus.DRAFT,
        deletedAt: null,
        titleRu: 'Книга',
      });
      prisma.work.update.mockResolvedValue({
        id: 'w1',
        status: WorkStatus.PUBLISHED,
        deletedAt: null,
        titleRu: 'Книга',
      });

      const result = await service.publishWork('w1', 'admin-1');

      expect(result.status).toBe(WorkStatus.PUBLISHED);
      expect(audit.log).toHaveBeenCalledWith({
        actorUserId: 'admin-1',
        action: AUDIT_ACTION.WORK_PUBLISH,
        entityType: AUDIT_ENTITY.WORK,
        entityId: 'w1',
        before: expect.objectContaining({
          status: WorkStatus.DRAFT,
        }) as AuditLogInput['before'],
        after: expect.objectContaining({
          status: WorkStatus.PUBLISHED,
        }) as AuditLogInput['after'],
      });
    });

    it('rejects publish of non-DRAFT work', async () => {
      prisma.work.findUnique.mockResolvedValue({
        id: 'w1',
        status: WorkStatus.PUBLISHED,
        deletedAt: null,
      });

      await expect(service.publishWork('w1', 'admin-1')).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(audit.log).not.toHaveBeenCalled();
    });

    it('rejects publish of MERGED work', async () => {
      prisma.work.findUnique.mockResolvedValue({
        id: 'w1',
        status: WorkStatus.MERGED,
        deletedAt: null,
      });

      await expect(service.publishWork('w1', 'admin-1')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe('softDeleteWork', () => {
    it('sets deletedAt and writes audit', async () => {
      prisma.work.findUnique.mockResolvedValue({
        id: 'w1',
        status: WorkStatus.PUBLISHED,
        deletedAt: null,
        titleRu: 'Книга',
      });
      prisma.work.update.mockResolvedValue({
        id: 'w1',
        status: WorkStatus.PUBLISHED,
        deletedAt: new Date('2026-08-06T12:00:00Z'),
        titleRu: 'Книга',
      });

      const result = await service.softDeleteWork('w1', 'admin-1');

      expect(result.deletedAt).toBeTruthy();
      expect(prisma.work.update).toHaveBeenCalledWith({
        where: { id: 'w1' },
        data: { deletedAt: expect.any(Date) as Date },
      });
      expect(audit.log).toHaveBeenCalledWith({
        actorUserId: 'admin-1',
        action: AUDIT_ACTION.WORK_SOFT_DELETE,
        entityType: AUDIT_ENTITY.WORK,
        entityId: 'w1',
        before: expect.objectContaining({
          deletedAt: null,
        }) as AuditLogInput['before'],
        after: expect.objectContaining({
          deletedAt: expect.any(String) as string,
        }) as AuditLogInput['after'],
      });
    });
  });

  describe('externalIds', () => {
    it('creates ExternalId for a Work', async () => {
      prisma.work.findUnique.mockResolvedValue({
        id: 'w1',
        deletedAt: null,
      });
      prisma.externalId.findUnique.mockResolvedValue(null);
      prisma.externalId.create.mockResolvedValue({
        id: 'ext-1',
        entityType: ExternalIdEntityType.WORK,
        entityId: 'w1',
        source: 'openlibrary',
        externalKey: 'OL123W',
      });

      const ext = await service.addWorkExternalId('w1', {
        source: 'openlibrary',
        externalKey: 'OL123W',
      });

      expect(ext.source).toBe('openlibrary');
      expect(prisma.externalId.create).toHaveBeenCalledWith({
        data: {
          entityType: ExternalIdEntityType.WORK,
          entityId: 'w1',
          source: 'openlibrary',
          externalKey: 'OL123W',
        },
      });
    });

    it('rejects duplicate source+externalKey', async () => {
      prisma.work.findUnique.mockResolvedValue({
        id: 'w1',
        deletedAt: null,
      });
      prisma.externalId.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        service.addWorkExternalId('w1', {
          source: 'openlibrary',
          externalKey: 'OL123W',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('deletes ExternalId belonging to the Work', async () => {
      prisma.externalId.findFirst.mockResolvedValue({
        id: 'ext-1',
        entityType: ExternalIdEntityType.WORK,
        entityId: 'w1',
      });
      prisma.externalId.delete.mockResolvedValue({ id: 'ext-1' });

      await service.deleteWorkExternalId('w1', 'ext-1');

      expect(prisma.externalId.delete).toHaveBeenCalledWith({
        where: { id: 'ext-1' },
      });
    });
  });

  describe('authors and editions', () => {
    it('creates an author as DRAFT', async () => {
      prisma.author.findFirst.mockResolvedValue(null);
      prisma.author.create.mockResolvedValue({
        id: 'a1',
        slug: 'tolstoy',
        nameRu: 'Толстой',
        status: 'DRAFT',
      });

      const author = await service.createAuthor({ nameRu: 'Толстой' });

      expect(author.nameRu).toBe('Толстой');
      expect(prisma.author.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          nameRu: 'Толстой',
          status: 'DRAFT',
        }) as Record<string, unknown>,
      });
    });

    it('links an author to a work', async () => {
      prisma.work.findUnique.mockResolvedValue({ id: 'w1', deletedAt: null });
      prisma.author.findUnique.mockResolvedValue({
        id: 'a1',
        deletedAt: null,
      });
      prisma.workAuthor.findUnique.mockResolvedValue(null);
      prisma.workAuthor.create.mockResolvedValue({
        workId: 'w1',
        authorId: 'a1',
        role: 'author',
        position: 0,
      });

      await service.linkWorkAuthor('w1', { authorId: 'a1', role: 'author' });

      expect(prisma.workAuthor.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          workId: 'w1',
          authorId: 'a1',
          role: 'author',
        }) as Record<string, unknown>,
      });
    });

    it('creates an edition for a work', async () => {
      prisma.work.findUnique.mockResolvedValue({ id: 'w1', deletedAt: null });
      prisma.edition.create.mockResolvedValue({
        id: 'e1',
        workId: 'w1',
        language: 'ru',
        title: 'Война и мир',
      });

      const edition = await service.createEdition('w1', {
        language: 'ru',
        title: 'Война и мир',
      });

      expect(edition.workId).toBe('w1');
    });
  });

  describe('series CRUD', () => {
    it('creates DRAFT series with slug', async () => {
      prisma.series.findFirst.mockResolvedValue(null);
      prisma.series.create.mockResolvedValue({
        id: 's1',
        slug: 'duna',
        nameRu: 'Дюна',
        status: CatalogEntityStatus.DRAFT,
      });

      const series = await service.createSeries({ nameRu: 'Дюна' });
      expect(series.status).toBe(CatalogEntityStatus.DRAFT);
      expect(prisma.series.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          nameRu: 'Дюна',
          status: CatalogEntityStatus.DRAFT,
        }) as Record<string, unknown>,
      });
    });

    it('publishes DRAFT → PUBLISHED with audit', async () => {
      prisma.series.findUnique.mockResolvedValue({
        id: 's1',
        status: CatalogEntityStatus.DRAFT,
        deletedAt: null,
        nameRu: 'Дюна',
      });
      prisma.series.update.mockResolvedValue({
        id: 's1',
        status: CatalogEntityStatus.PUBLISHED,
        nameRu: 'Дюна',
      });

      const result = await service.publishSeries('s1', 'admin-1');
      expect(result.status).toBe(CatalogEntityStatus.PUBLISHED);
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AUDIT_ACTION.SERIES_PUBLISH,
          entityType: AUDIT_ENTITY.SERIES,
        }) as AuditLogInput,
      );
    });

    it('soft-deletes series with audit', async () => {
      prisma.series.findUnique.mockResolvedValue({
        id: 's1',
        status: CatalogEntityStatus.PUBLISHED,
        deletedAt: null,
        nameRu: 'Дюна',
      });
      prisma.series.update.mockResolvedValue({
        id: 's1',
        status: CatalogEntityStatus.PUBLISHED,
        deletedAt: new Date('2026-08-06T12:00:00Z'),
        nameRu: 'Дюна',
      });

      const result = await service.softDeleteSeries('s1', 'admin-1');
      expect(result.deletedAt).toBeTruthy();
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AUDIT_ACTION.SERIES_SOFT_DELETE,
        }) as AuditLogInput,
      );
    });

    it('rejects publish of non-DRAFT series', async () => {
      prisma.series.findUnique.mockResolvedValue({
        id: 's1',
        status: CatalogEntityStatus.PUBLISHED,
        deletedAt: null,
        nameRu: 'Дюна',
      });
      await expect(
        service.publishSeries('s1', 'admin-1'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('character / world / place CRUD', () => {
    it('creates DRAFT character, world and place', async () => {
      prisma.character.findFirst.mockResolvedValue(null);
      prisma.character.create.mockResolvedValue({
        id: 'c1',
        nameRu: 'Пол',
        status: CatalogEntityStatus.DRAFT,
      });
      prisma.world.findFirst.mockResolvedValue(null);
      prisma.world.create.mockResolvedValue({
        id: 'w1',
        nameRu: 'Арракис',
        status: CatalogEntityStatus.DRAFT,
      });
      prisma.world.findUnique.mockResolvedValue({
        id: 'w1',
        deletedAt: null,
        status: CatalogEntityStatus.DRAFT,
      });
      prisma.place.findFirst.mockResolvedValue(null);
      prisma.place.create.mockResolvedValue({
        id: 'p1',
        nameRu: 'Сиетч',
        worldId: 'w1',
        status: CatalogEntityStatus.DRAFT,
      });

      await service.createCharacter({ nameRu: 'Пол' });
      await service.createWorld({
        nameRu: 'Арракис',
        descriptionRu: 'Пустыня',
      });
      await service.createPlace({ nameRu: 'Сиетч', worldId: 'w1' });

      expect(prisma.character.create).toHaveBeenCalled();
      expect(prisma.world.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          descriptionRu: 'Пустыня',
          status: CatalogEntityStatus.DRAFT,
        }) as Record<string, unknown>,
      });
      expect(prisma.place.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          worldId: 'w1',
          status: CatalogEntityStatus.DRAFT,
        }) as Record<string, unknown>,
      });
    });

    it('publishes and soft-deletes character with audit', async () => {
      prisma.character.findUnique.mockResolvedValue({
        id: 'c1',
        status: CatalogEntityStatus.DRAFT,
        deletedAt: null,
        nameRu: 'Пол',
      });
      prisma.character.update.mockResolvedValue({
        id: 'c1',
        status: CatalogEntityStatus.PUBLISHED,
        nameRu: 'Пол',
        deletedAt: null,
      });
      await service.publishCharacter('c1', 'admin-1');
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AUDIT_ACTION.CHARACTER_PUBLISH,
        }) as AuditLogInput,
      );

      prisma.character.findUnique.mockResolvedValue({
        id: 'c1',
        status: CatalogEntityStatus.PUBLISHED,
        deletedAt: null,
        nameRu: 'Пол',
      });
      prisma.character.update.mockResolvedValue({
        id: 'c1',
        deletedAt: new Date(),
        status: CatalogEntityStatus.PUBLISHED,
        nameRu: 'Пол',
      });
      await service.softDeleteCharacter('c1', 'admin-1');
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AUDIT_ACTION.CHARACTER_SOFT_DELETE,
        }) as AuditLogInput,
      );
    });

    it('rejects update of soft-deleted place', async () => {
      prisma.place.findUnique.mockResolvedValue({
        id: 'p1',
        deletedAt: new Date(),
      });
      await expect(
        service.updatePlace('p1', { nameRu: 'X' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});

import {
  ExternalIdEntityType,
  MatchQueueKind,
  MatchQueueStatus,
  WorkStatus,
} from '@prisma/client';
import {
  buildImportRows,
  normalizeIsbn,
  titleNorm,
} from './catalog-import.normalize';
import { CatalogImportService } from './catalog-import.service';

describe('catalog-import.normalize', () => {
  it('normalizes ISBN-13 and converts ISBN-10', () => {
    expect(normalizeIsbn('978-0-306-40615-7')).toBe('9780306406157');
    expect(normalizeIsbn('0306406152')).toBe('9780306406157');
    expect(normalizeIsbn('bad')).toBeNull();
  });

  it('builds titleNorm without punctuation', () => {
    expect(titleNorm('  Война и мир! ')).toBe('война и мир');
  });

  it('builds isbn_list and stub OL rows', () => {
    const isbnRows = buildImportRows({
      source: 'isbn_list',
      isbns: ['9780306406157', 'not-an-isbn'],
    });
    expect(isbnRows).toHaveLength(2);
    expect(isbnRows[0].isbn13).toBe('9780306406157');
    expect(isbnRows[0].externalIds[0]).toEqual({
      source: 'isbn',
      externalKey: '9780306406157',
    });
    expect(isbnRows[1].isbn13).toBeNull();
    expect(isbnRows[1].externalIds).toEqual([]);

    const ol = buildImportRows({
      source: 'openlibrary',
      query: 'War and Peace',
    });
    expect(ol).toHaveLength(1);
    expect(ol[0].externalIds[0].source).toBe('openlibrary');
    expect(ol[0].externalIds[0].externalKey).toContain('stub:');
  });
});

describe('CatalogImportService', () => {
  const prisma = {
    externalId: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    edition: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    work: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    matchQueue: {
      create: jest.fn(),
    },
  };

  let service: CatalogImportService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CatalogImportService(prisma as never);
    prisma.work.findFirst.mockResolvedValue(null);
  });

  it('creates DRAFT work for new ISBN with ExternalId', async () => {
    prisma.externalId.findUnique.mockResolvedValue(null);
    prisma.edition.findUnique.mockResolvedValue(null);
    prisma.work.create.mockResolvedValue({ id: 'work-1' });
    prisma.externalId.create.mockResolvedValue({});
    prisma.edition.create.mockResolvedValue({});

    const report = await service.runBatch({
      source: 'isbn_list',
      isbns: ['9780306406157'],
    });

    expect(report).toEqual({
      created: 1,
      updated: 0,
      queued: 0,
      drafts: 1,
      failed: 0,
    });
    expect(prisma.work.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: WorkStatus.DRAFT,
          titleRu: 'ISBN 9780306406157',
        }),
      }),
    );
    expect(prisma.externalId.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          entityType: ExternalIdEntityType.WORK,
          entityId: 'work-1',
          source: 'isbn',
          externalKey: '9780306406157',
        }),
      }),
    );
  });

  it('updates existing work on ExternalId match', async () => {
    prisma.externalId.findUnique
      .mockResolvedValueOnce({
        entityType: ExternalIdEntityType.WORK,
        entityId: 'existing-work',
      })
      .mockResolvedValue({ id: 'ext-1' });
    prisma.work.findUnique.mockResolvedValue({
      id: 'existing-work',
      deletedAt: null,
      titleOrig: null,
      yearFirst: null,
    });
    prisma.edition.findUnique.mockResolvedValue(null);

    const report = await service.runBatch({
      source: 'json_upload',
      rows: [
        {
          titleRu: 'Книга',
          isbn13: '9780306406157',
          externalIds: [{ source: 'openlibrary', externalKey: 'OL123' }],
        },
      ],
    });

    expect(report.updated).toBe(1);
    expect(report.created).toBe(0);
    expect(prisma.work.create).not.toHaveBeenCalled();
  });

  it('queues MatchQueue when row has no identifiers', async () => {
    prisma.matchQueue.create.mockResolvedValue({ id: 'mq-1' });

    const report = await service.runBatch({
      source: 'json_upload',
      rows: [{ titleRu: 'Без идентификаторов' }],
    });

    expect(report).toEqual({
      created: 0,
      updated: 0,
      queued: 1,
      drafts: 0,
      failed: 0,
      matchQueueIds: ['mq-1'],
    });
    expect(prisma.matchQueue.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          kind: MatchQueueKind.IMPORT_ROW,
          status: MatchQueueStatus.OPEN,
        }),
      }),
    );
  });

  it('attaches via Edition ISBN match', async () => {
    prisma.externalId.findUnique.mockResolvedValue(null);
    prisma.edition.findUnique.mockResolvedValue({ workId: 'work-isbn' });
    prisma.work.findUnique.mockResolvedValue({
      id: 'work-isbn',
      titleOrig: 'x',
      yearFirst: 1900,
    });

    const report = await service.runBatch({
      source: 'isbn_list',
      isbns: ['9780306406157'],
    });

    expect(report.updated).toBe(1);
    expect(prisma.work.create).not.toHaveBeenCalled();
  });
});

import { MatchQueueKind, MatchQueueStatus, WorkStatus } from '@prisma/client';
import { AdminMatchQueueService } from './admin-match-queue.service';

describe('AdminMatchQueueService', () => {
  const prisma = {
    matchQueue: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    work: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    edition: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    contextReading: {
      upsert: jest.fn(),
    },
  };

  let service: AdminMatchQueueService;

  beforeEach(() => {
    jest.resetAllMocks();
    service = new AdminMatchQueueService(prisma as never);
    prisma.work.findMany.mockResolvedValue([
      {
        id: 'w-canon',
        titleRu: 'Преступление и наказание',
        titleOrig: 'Crime and Punishment',
        yearFirst: 1866,
      },
    ]);
  });

  it('lists OPEN items with suggestions', async () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    prisma.matchQueue.findMany.mockResolvedValue([
      {
        id: 'mq-1',
        kind: MatchQueueKind.IMPORT_ROW,
        status: MatchQueueStatus.OPEN,
        payload: {
          titleRu: 'Преступление и наказание',
          yearFirst: 1866,
        },
        resolvedWorkId: null,
        createdAt,
        updatedAt: createdAt,
        resolvedWork: null,
      },
    ]);

    const items = await service.list({});

    expect(items).toHaveLength(1);
    expect(items[0]?.id).toBe('mq-1');
    expect(items[0]?.suggestions.length).toBeGreaterThan(0);
    expect(items[0]?.suggestions[0]?.workId).toBe('w-canon');
  });

  it('resolves IMPORT_ROW and marks item RESOLVED', async () => {
    prisma.matchQueue.findUnique.mockResolvedValue({
      id: 'mq-1',
      kind: MatchQueueKind.IMPORT_ROW,
      status: MatchQueueStatus.OPEN,
      payload: { titleRu: 'Тест', isbn13: '9780000000001' },
    });
    prisma.work.findUnique.mockResolvedValue({
      id: 'w1',
      deletedAt: null,
      titleRu: 'Тест',
      titleOrig: null,
      yearFirst: null,
    });
    prisma.edition.findUnique.mockResolvedValue(null);
    prisma.edition.create.mockResolvedValue({});
    prisma.matchQueue.update.mockResolvedValue({
      id: 'mq-1',
      kind: MatchQueueKind.IMPORT_ROW,
      status: MatchQueueStatus.RESOLVED,
      payload: { titleRu: 'Тест', isbn13: '9780000000001' },
      resolvedWorkId: 'w1',
      createdAt: new Date(),
      updatedAt: new Date(),
      resolvedWork: {
        id: 'w1',
        slug: 'test',
        titleRu: 'Тест',
        status: WorkStatus.PUBLISHED,
      },
    });

    const result = await service.resolve('mq-1', 'w1');

    expect(prisma.matchQueue.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'mq-1' },
        data: {
          status: MatchQueueStatus.RESOLVED,
          resolvedWorkId: 'w1',
        },
      }),
    );
    expect(result.followUp?.importRowApplied).toBe(true);
    expect(result.status).toBe(MatchQueueStatus.RESOLVED);
  });

  it('creates DRAFT work and resolves CONTEXT_CANDIDATE', async () => {
    prisma.matchQueue.findUnique.mockResolvedValue({
      id: 'mq-ctx',
      kind: MatchQueueKind.CONTEXT_CANDIDATE,
      status: MatchQueueStatus.OPEN,
      payload: {
        subjectWorkId: 'subject-1',
        title: 'Идиот',
        importanceRank: 2,
        whyTextRu: 'Параллели',
      },
    });
    prisma.work.findFirst.mockResolvedValue(null);
    prisma.work.create.mockResolvedValue({ id: 'draft-1' });
    prisma.contextReading.upsert.mockResolvedValue({});
    prisma.matchQueue.update.mockResolvedValue({
      id: 'mq-ctx',
      kind: MatchQueueKind.CONTEXT_CANDIDATE,
      status: MatchQueueStatus.RESOLVED,
      payload: {
        subjectWorkId: 'subject-1',
        title: 'Идиот',
      },
      resolvedWorkId: 'draft-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      resolvedWork: {
        id: 'draft-1',
        slug: 'idiot',
        titleRu: 'Идиот',
        status: WorkStatus.DRAFT,
      },
    });

    const result = await service.createDraftAndResolve('mq-ctx');

    expect(prisma.work.create).toHaveBeenCalled();
    expect(prisma.contextReading.upsert).toHaveBeenCalled();
    expect(result.followUp?.contextPublished).toBe(true);
    expect(result.resolvedWorkId).toBe('draft-1');
  });

  it('dismisses OPEN item', async () => {
    prisma.matchQueue.findUnique.mockResolvedValue({
      id: 'mq-2',
      kind: MatchQueueKind.IMPORT_ROW,
      status: MatchQueueStatus.OPEN,
      payload: { titleRu: 'X' },
    });
    prisma.matchQueue.update.mockResolvedValue({
      id: 'mq-2',
      kind: MatchQueueKind.IMPORT_ROW,
      status: MatchQueueStatus.DISMISSED,
      payload: { titleRu: 'X' },
      resolvedWorkId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      resolvedWork: null,
    });

    const result = await service.dismiss('mq-2');

    expect(result.status).toBe(MatchQueueStatus.DISMISSED);
  });
});

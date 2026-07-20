import { NotFoundException } from '@nestjs/common';
import { ContextReadingStatus } from '@prisma/client';
import { AUDIT_ACTION, AUDIT_ENTITY } from '../audit/audit.constants';
import { AuditService } from '../audit/audit.service';
import { AdminContextService } from './admin-context.service';

describe('AdminContextService', () => {
  const prisma = {
    contextReading: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  const audit = {
    log: jest.fn(),
  };

  let service: AdminContextService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AdminContextService(
      prisma as never,
      audit as unknown as AuditService,
    );
  });

  it('listRecentAutoPublished returns published readings within window', async () => {
    const publishedAt = new Date('2026-07-20T10:00:00.000Z');
    prisma.contextReading.findMany.mockResolvedValue([
      {
        id: 'cr-1',
        importanceRank: 1,
        whyText: 'Помогает понять контекст.',
        status: ContextReadingStatus.PUBLISHED,
        sourceUrl: 'https://ru.wikipedia.org/wiki/Test',
        sourceSnippet: 'snippet',
        llmModel: 'fake',
        llmRunId: 'run-1',
        publishedAt,
        createdAt: publishedAt,
        updatedAt: publishedAt,
        subjectWork: {
          id: 'w-subject',
          slug: 'subject-slug',
          titleRu: 'Субъект',
        },
        recommendedWork: {
          id: 'w-rec',
          slug: 'rec-slug',
          titleRu: 'Рекомендация',
        },
      },
    ]);

    const result = await service.listRecentAutoPublished({ days: 7 });

    expect(prisma.contextReading.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: ContextReadingStatus.PUBLISHED,
          publishedAt: expect.objectContaining({ gte: expect.any(Date) }),
        }),
      }),
    );
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      id: 'cr-1',
      subjectWork: { slug: 'subject-slug', titleRu: 'Субъект' },
      recommendedWork: { slug: 'rec-slug', titleRu: 'Рекомендация' },
      sourceUrl: 'https://ru.wikipedia.org/wiki/Test',
    });
  });

  it('updateReading patches fields and writes audit', async () => {
    const before = {
      id: 'cr-1',
      importanceRank: 2,
      whyText: 'Старый текст',
      status: ContextReadingStatus.PUBLISHED,
      sourceUrl: null,
      sourceSnippet: null,
      llmModel: null,
      llmRunId: null,
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      subjectWork: { id: 'w1', slug: 's', titleRu: 'S' },
      recommendedWork: { id: 'w2', slug: 'r', titleRu: 'R' },
    };
    const after = {
      ...before,
      importanceRank: 1,
      whyText: 'Новый текст',
      updatedAt: new Date('2026-07-20T12:00:00.000Z'),
    };

    prisma.contextReading.findUnique.mockResolvedValue(before);
    prisma.contextReading.update.mockResolvedValue(after);

    const result = await service.updateReading('cr-1', 'admin-1', {
      importanceRank: 1,
      whyText: 'Новый текст',
    });

    expect(prisma.contextReading.update).toHaveBeenCalledWith({
      where: { id: 'cr-1' },
      data: { importanceRank: 1, whyText: 'Новый текст' },
      include: expect.any(Object),
    });
    expect(audit.log).toHaveBeenCalledWith({
      actorUserId: 'admin-1',
      action: AUDIT_ACTION.CONTEXT_UPDATE,
      entityType: AUDIT_ENTITY.CONTEXT_READING,
      entityId: 'cr-1',
      before: expect.objectContaining({ whyText: 'Старый текст' }),
      after: expect.objectContaining({ whyText: 'Новый текст' }),
    });
    expect(result.whyText).toBe('Новый текст');
  });

  it('unpublishReading sets DRAFT and clears publishedAt with audit', async () => {
    const before = {
      id: 'cr-1',
      importanceRank: 1,
      whyText: 'Текст',
      status: ContextReadingStatus.PUBLISHED,
      sourceUrl: null,
      sourceSnippet: null,
      llmModel: null,
      llmRunId: null,
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      subjectWork: { id: 'w1', slug: 's', titleRu: 'S' },
      recommendedWork: { id: 'w2', slug: 'r', titleRu: 'R' },
    };
    const after = {
      ...before,
      status: ContextReadingStatus.DRAFT,
      publishedAt: null,
    };

    prisma.contextReading.findUnique.mockResolvedValue(before);
    prisma.contextReading.update.mockResolvedValue(after);

    const result = await service.unpublishReading('cr-1', 'admin-1');

    expect(prisma.contextReading.update).toHaveBeenCalledWith({
      where: { id: 'cr-1' },
      data: { status: ContextReadingStatus.DRAFT, publishedAt: null },
      include: expect.any(Object),
    });
    expect(audit.log).toHaveBeenCalledWith({
      actorUserId: 'admin-1',
      action: AUDIT_ACTION.CONTEXT_UNPUBLISH,
      entityType: AUDIT_ENTITY.CONTEXT_READING,
      entityId: 'cr-1',
      before: expect.objectContaining({
        status: ContextReadingStatus.PUBLISHED,
      }),
      after: expect.objectContaining({ status: ContextReadingStatus.DRAFT }),
    });
    expect(result.status).toBe(ContextReadingStatus.DRAFT);
  });

  it('rejectReading sets REJECTED with audit', async () => {
    const before = {
      id: 'cr-1',
      importanceRank: 1,
      whyText: 'Текст',
      status: ContextReadingStatus.PUBLISHED,
      sourceUrl: null,
      sourceSnippet: null,
      llmModel: null,
      llmRunId: null,
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      subjectWork: { id: 'w1', slug: 's', titleRu: 'S' },
      recommendedWork: { id: 'w2', slug: 'r', titleRu: 'R' },
    };
    const after = {
      ...before,
      status: ContextReadingStatus.REJECTED,
      publishedAt: null,
    };

    prisma.contextReading.findUnique.mockResolvedValue(before);
    prisma.contextReading.update.mockResolvedValue(after);

    const result = await service.rejectReading('cr-1', 'admin-1');

    expect(result.status).toBe(ContextReadingStatus.REJECTED);
    expect(audit.log).toHaveBeenCalledWith({
      actorUserId: 'admin-1',
      action: AUDIT_ACTION.CONTEXT_REJECT,
      entityType: AUDIT_ENTITY.CONTEXT_READING,
      entityId: 'cr-1',
      before: expect.any(Object),
      after: expect.objectContaining({ status: ContextReadingStatus.REJECTED }),
    });
  });

  it('updateReading throws when reading missing', async () => {
    prisma.contextReading.findUnique.mockResolvedValue(null);

    await expect(
      service.updateReading('missing', 'admin-1', { whyText: 'x' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

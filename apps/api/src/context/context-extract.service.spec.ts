import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  ContextReadingStatus,
  MatchQueueKind,
  MatchQueueStatus,
  NeedsContext,
  Prisma,
  WorkStatus,
} from '@prisma/client';
import { FakeLlmProvider } from '../llm/fake-llm.provider';
import { LLM_PROVIDER } from '../llm/llm.provider';
import type { ExtractContextOutput } from '../llm/llm.types';
import { PrismaService } from '../prisma/prisma.service';
import { ContextExtractService } from './context-extract.service';
import {
  WHITELIST_FETCHER,
  type WhitelistFetcher,
} from './context-whitelist.fetcher';

describe('ContextExtractService', () => {
  let service: ContextExtractService;
  let prisma: {
    work: {
      findFirst: jest.Mock;
      findMany: jest.Mock;
    };
    contextReading: {
      findFirst: jest.Mock;
      upsert: jest.Mock;
    };
    matchQueue: {
      create: jest.Mock;
    };
  };
  let fakeLlm: FakeLlmProvider;
  let whitelistFetcher: jest.Mocked<WhitelistFetcher>;

  const subjectWork = {
    id: 'subject-id',
    slug: 'subject-slug',
    titleRu: 'Преступление и наказание',
    titleOrig: 'Crime and Punishment',
    yearFirst: 1866,
    status: WorkStatus.PUBLISHED,
    needsContext: NeedsContext.YES,
    needsContextAdminSetAt: new Date(),
    deletedAt: null,
  };

  const matchedWork = {
    id: 'recommended-id',
    slug: 'recommended-slug',
    titleRu: 'Записки из подполья',
    titleOrig: 'Notes from Underground',
    yearFirst: 1864,
    status: WorkStatus.PUBLISHED,
    deletedAt: null,
  };

  beforeEach(async () => {
    prisma = {
      work: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
      contextReading: {
        findFirst: jest.fn(),
        upsert: jest.fn(),
      },
      matchQueue: {
        create: jest.fn(),
      },
    };

    whitelistFetcher = {
      fetchForWork: jest.fn().mockResolvedValue([
        {
          url: 'https://ru.wikipedia.org/wiki/Преступление_и_наказание',
          snippet: 'Краткий фрагмент энциклопедии о романе.',
        },
      ]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContextExtractService,
        FakeLlmProvider,
        {
          provide: LLM_PROVIDER,
          useExisting: FakeLlmProvider,
        },
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: WHITELIST_FETCHER,
          useValue: whitelistFetcher,
        },
      ],
    }).compile();

    service = module.get(ContextExtractService);
    fakeLlm = module.get<FakeLlmProvider>(LLM_PROVIDER);
  });

  function mockExtractOutput(
    overrides: Partial<ExtractContextOutput> = {},
  ): ExtractContextOutput {
    return {
      candidates: [
        {
          title: 'Записки из подполья',
          author: 'Ф. М. Достоевский',
          year: 1864,
          importance_rank: 1,
          why_text_ru: 'Предшествующий психологический этюд того же автора.',
          evidence_quote: 'подпольный человек',
        },
        {
          title: 'Неизвестная книга XYZ',
          author: 'Неизвестный',
          year: null,
          importance_rank: 2,
          why_text_ru: 'Связь не подтверждена.',
          evidence_quote: null,
        },
      ],
      disclaimer_ok: true,
      ...overrides,
    };
  }

  it('throws when work not found', async () => {
    prisma.work.findFirst.mockResolvedValue(null);

    await expect(service.extractAndPublish('missing')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('skips when work is not extract eligible', async () => {
    prisma.work.findFirst.mockResolvedValue({
      ...subjectWork,
      needsContext: NeedsContext.NO,
    });

    const result = await service.extractAndPublish(subjectWork.id);

    expect(result).toEqual({
      published: 0,
      queued: 0,
      skipped: true,
      reason: 'not_eligible',
    });
    expect(whitelistFetcher.fetchForWork.mock.calls).toHaveLength(0);
  });

  it('does not publish when disclaimer_ok is false', async () => {
    prisma.work.findFirst.mockResolvedValue(subjectWork);
    fakeLlm.setExtractHandler(() =>
      mockExtractOutput({ disclaimer_ok: false }),
    );

    const result = await service.extractAndPublish(subjectWork.id);

    expect(result).toEqual({
      published: 0,
      queued: 0,
      skipped: true,
      reason: 'disclaimer_not_ok',
    });
    expect(prisma.contextReading.upsert).not.toHaveBeenCalled();
  });

  it('autopublishes matched candidates as PUBLISHED', async () => {
    prisma.work.findFirst.mockResolvedValue(subjectWork);
    prisma.work.findMany.mockResolvedValue([matchedWork]);
    prisma.contextReading.findFirst.mockResolvedValue(null);
    prisma.contextReading.upsert.mockResolvedValue({});
    fakeLlm.setExtractHandler(() =>
      mockExtractOutput({
        candidates: [
          {
            title: 'Записки из подполья',
            author: 'Ф. М. Достоевский',
            year: 1864,
            importance_rank: 1,
            why_text_ru: 'Предшествующий психологический этюд.',
            evidence_quote: 'подпольный человек',
          },
        ],
      }),
    );

    const result = await service.extractAndPublish(subjectWork.id);

    expect(result.published).toBe(1);
    expect(result.queued).toBe(0);
    expect(result.skipped).toBe(false);
    expect(prisma.contextReading.upsert).toHaveBeenCalledTimes(1);
  });

  it('queues unmatched candidates in MatchQueue', async () => {
    prisma.work.findFirst.mockResolvedValue(subjectWork);
    prisma.work.findMany.mockResolvedValue([matchedWork]);
    prisma.contextReading.findFirst.mockResolvedValue(null);
    prisma.contextReading.upsert.mockResolvedValue({});
    prisma.matchQueue.create.mockResolvedValue({});
    fakeLlm.setExtractHandler(() => mockExtractOutput());

    const result = await service.extractAndPublish(subjectWork.id);

    expect(result.published).toBe(1);
    expect(result.queued).toBe(1);
    expect(prisma.matchQueue.create).toHaveBeenCalledWith({
      data: {
        kind: MatchQueueKind.CONTEXT_CANDIDATE,
        status: MatchQueueStatus.OPEN,
        payload: expect.objectContaining({
          subjectWorkId: subjectWork.id,
          title: 'Неизвестная книга XYZ',
          author: 'Неизвестный',
        }) as Prisma.InputJsonValue,
      },
    });
  });

  it('uses whitelist sources when extracting', async () => {
    prisma.work.findFirst.mockResolvedValue(subjectWork);
    prisma.work.findMany.mockResolvedValue([matchedWork]);
    prisma.contextReading.findFirst.mockResolvedValue(null);
    prisma.contextReading.upsert.mockResolvedValue({});
    fakeLlm.setExtractHandler(() =>
      mockExtractOutput({
        candidates: [
          {
            title: 'Записки из подполья',
            author: 'Ф. М. Достоевский',
            year: 1864,
            importance_rank: 1,
            why_text_ru: 'Краткое обоснование.',
            evidence_quote: null,
          },
        ],
      }),
    );

    await service.extractAndPublish(subjectWork.id);

    expect(whitelistFetcher.fetchForWork.mock.calls.length).toBe(1);
    expect(whitelistFetcher.fetchForWork.mock.calls[0]?.[0]).toEqual({
      titleRu: subjectWork.titleRu,
      titleOrig: subjectWork.titleOrig,
    });
  });

  it('does not overwrite REJECTED without force', async () => {
    prisma.work.findFirst.mockResolvedValue(subjectWork);
    prisma.work.findMany.mockResolvedValue([matchedWork]);
    prisma.contextReading.findFirst.mockResolvedValue({
      status: ContextReadingStatus.REJECTED,
    });
    fakeLlm.setExtractHandler(() =>
      mockExtractOutput({
        candidates: [
          {
            title: 'Записки из подполья',
            author: 'Ф. М. Достоевский',
            year: 1864,
            importance_rank: 1,
            why_text_ru: 'Новое обоснование.',
            evidence_quote: null,
          },
        ],
      }),
    );

    const result = await service.extractAndPublish(subjectWork.id);

    expect(result.published).toBe(0);
    expect(prisma.contextReading.upsert).not.toHaveBeenCalled();
  });
});

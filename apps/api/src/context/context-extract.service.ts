import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  ContextReadingStatus,
  MatchQueueKind,
  MatchQueueStatus,
  Prisma,
} from '@prisma/client';
import { LLM_PROVIDER, type LlmProvider } from '../llm/llm.provider';
import {
  FUZZY_MATCH_HIGH_THRESHOLD,
  type ExtractContextCandidate,
} from '../llm/llm.types';
import { PrismaService } from '../prisma/prisma.service';
import {
  MAX_EXTRACT_CANDIDATES,
  MAX_SOURCE_SNIPPET_LENGTH,
} from './context.constants';
import { isExtractEligible } from './context-eligibility';
import { findBestWorkMatch } from './context-matching';
import { truncateSnippet } from './config-whitelist.fetcher';
import {
  WHITELIST_FETCHER,
  type WhitelistFetcher,
} from './context-whitelist.fetcher';

export interface ExtractAndPublishResult {
  published: number;
  queued: number;
  skipped: boolean;
  reason?: string;
}

@Injectable()
export class ContextExtractService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(LLM_PROVIDER) private readonly llm: LlmProvider,
    @Inject(WHITELIST_FETCHER)
    private readonly whitelistFetcher: WhitelistFetcher,
  ) {}

  async extractAndPublish(
    workId: string,
    options: { force?: boolean } = {},
  ): Promise<ExtractAndPublishResult> {
    const work = await this.prisma.work.findFirst({
      where: { id: workId, deletedAt: null },
    });
    if (!work) {
      throw new NotFoundException('Work not found');
    }

    if (!isExtractEligible(work.needsContext)) {
      return {
        published: 0,
        queued: 0,
        skipped: true,
        reason: 'not_eligible',
      };
    }

    const sources = await this.whitelistFetcher.fetchForWork({
      titleRu: work.titleRu,
      titleOrig: work.titleOrig,
    });

    const llmResult = await this.llm.extractContext({
      subjectTitleRu: work.titleRu,
      subjectTitleOrig: work.titleOrig,
      sources,
    });

    if (!llmResult.disclaimer_ok) {
      return {
        published: 0,
        queued: 0,
        skipped: true,
        reason: 'disclaimer_not_ok',
      };
    }

    const candidates = llmResult.candidates.slice(0, MAX_EXTRACT_CANDIDATES);
    if (candidates.length === 0) {
      return {
        published: 0,
        queued: 0,
        skipped: true,
        reason: 'no_candidates',
      };
    }

    const catalogWorks = await this.prisma.work.findMany({
      where: { deletedAt: null, id: { not: work.id } },
      select: {
        id: true,
        titleRu: true,
        titleOrig: true,
        yearFirst: true,
      },
    });

    const primarySource = sources[0];
    let published = 0;
    let queued = 0;

    for (const candidate of candidates) {
      const match = findBestWorkMatch(
        { title: candidate.title, year: candidate.year },
        catalogWorks,
        FUZZY_MATCH_HIGH_THRESHOLD,
      );

      if (match) {
        const didPublish = await this.upsertPublishedReading(
          work.id,
          match.work.id,
          candidate,
          primarySource,
          options.force ?? false,
        );
        if (didPublish) {
          published += 1;
        }
      } else {
        await this.prisma.matchQueue.create({
          data: {
            kind: MatchQueueKind.CONTEXT_CANDIDATE,
            status: MatchQueueStatus.OPEN,
            payload: this.buildQueuePayload(work.id, candidate),
          },
        });
        queued += 1;
      }
    }

    return { published, queued, skipped: false };
  }

  private buildQueuePayload(
    subjectWorkId: string,
    candidate: ExtractContextCandidate,
  ): Prisma.InputJsonValue {
    return {
      subjectWorkId,
      title: candidate.title,
      author: candidate.author,
      year: candidate.year,
      importanceRank: candidate.importance_rank,
      whyTextRu: candidate.why_text_ru,
      evidenceQuote: candidate.evidence_quote,
    };
  }

  private async upsertPublishedReading(
    subjectWorkId: string,
    recommendedWorkId: string,
    candidate: ExtractContextCandidate,
    source: { url: string; snippet: string } | undefined,
    force: boolean,
  ): Promise<boolean> {
    const existing = await this.prisma.contextReading.findFirst({
      where: { subjectWorkId, recommendedWorkId },
    });

    if (existing?.status === ContextReadingStatus.REJECTED && !force) {
      return false;
    }

    const now = new Date();
    const sourceSnippet = source ? truncateSnippet(source.snippet) : null;

    if (sourceSnippet && sourceSnippet.length > MAX_SOURCE_SNIPPET_LENGTH) {
      throw new Error('sourceSnippet exceeds max length');
    }

    await this.prisma.contextReading.upsert({
      where: {
        subjectWorkId_recommendedWorkId: {
          subjectWorkId,
          recommendedWorkId,
        },
      },
      create: {
        subjectWorkId,
        recommendedWorkId,
        importanceRank: candidate.importance_rank,
        whyText: candidate.why_text_ru,
        status: ContextReadingStatus.PUBLISHED,
        sourceUrl: source?.url ?? null,
        sourceSnippet,
        publishedAt: now,
      },
      update: {
        importanceRank: candidate.importance_rank,
        whyText: candidate.why_text_ru,
        status: ContextReadingStatus.PUBLISHED,
        sourceUrl: source?.url ?? null,
        sourceSnippet,
        publishedAt: now,
      },
    });

    return true;
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ContextReadingStatus,
  MatchQueueKind,
  MatchQueueStatus,
  Prisma,
  WorkStatus,
} from '@prisma/client';
import type { AdminMatchQueueListQuery } from '@bookspace/schemas';
import { FUZZY_MATCH_LOW_THRESHOLD } from '../llm/llm.types';
import {
  findWorkMatchSuggestions,
  type MatchCandidateInput,
} from '../context/context-matching';
import { PrismaService } from '../prisma/prisma.service';

const SUGGESTION_LIMIT = 8;

type ImportRowPayload = {
  titleRu?: string;
  titleOrig?: string | null;
  titleNorm?: string;
  yearFirst?: number | null;
  isbn13?: string | null;
  raw?: unknown;
};

type ContextCandidatePayload = {
  subjectWorkId?: string;
  title?: string;
  author?: string | null;
  year?: number | null;
  importanceRank?: number | null;
  whyTextRu?: string | null;
  evidenceQuote?: string | null;
};

type RankingEntryPayload = {
  titleRu?: string;
  titleOrig?: string | null;
  year?: number | null;
  rankingEntryId?: string;
  externalSourceId?: string;
};

@Injectable()
export class AdminMatchQueueService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: AdminMatchQueueListQuery) {
    const status = query.status ?? MatchQueueStatus.OPEN;
    const items = await this.prisma.matchQueue.findMany({
      where: {
        status,
        ...(query.id ? { id: query.id } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: query.id ? 1 : 100,
      include: {
        resolvedWork: {
          select: {
            id: true,
            slug: true,
            titleRu: true,
            status: true,
          },
        },
      },
    });

    const works = await this.loadMatchableWorks();
    return items.map((item) => this.toListItem(item, works));
  }

  async resolve(matchQueueId: string, workId: string) {
    const item = await this.requireOpenItem(matchQueueId);
    await this.assertWorkExists(workId);
    const followUp = await this.applyFollowUp(item, workId);
    const updated = await this.prisma.matchQueue.update({
      where: { id: matchQueueId },
      data: {
        status: MatchQueueStatus.RESOLVED,
        resolvedWorkId: workId,
      },
      include: {
        resolvedWork: {
          select: {
            id: true,
            slug: true,
            titleRu: true,
            status: true,
          },
        },
      },
    });
    const works = await this.loadMatchableWorks();
    const listItem = this.toListItem(updated, works);
    return { ...listItem, followUp };
  }

  async createDraftAndResolve(matchQueueId: string) {
    const item = await this.requireOpenItem(matchQueueId);
    const workId = await this.createDraftFromPayload(item.kind, item.payload);
    const followUp = await this.applyFollowUp(item, workId);
    const updated = await this.prisma.matchQueue.update({
      where: { id: matchQueueId },
      data: {
        status: MatchQueueStatus.RESOLVED,
        resolvedWorkId: workId,
      },
      include: {
        resolvedWork: {
          select: {
            id: true,
            slug: true,
            titleRu: true,
            status: true,
          },
        },
      },
    });
    const works = await this.loadMatchableWorks();
    const listItem = this.toListItem(updated, works);
    return { ...listItem, followUp };
  }

  async dismiss(matchQueueId: string) {
    const item = await this.requireOpenItem(matchQueueId);
    const updated = await this.prisma.matchQueue.update({
      where: { id: item.id },
      data: { status: MatchQueueStatus.DISMISSED },
      include: {
        resolvedWork: {
          select: {
            id: true,
            slug: true,
            titleRu: true,
            status: true,
          },
        },
      },
    });
    const works = await this.loadMatchableWorks();
    return this.toListItem(updated, works);
  }

  private async requireOpenItem(id: string) {
    const item = await this.prisma.matchQueue.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('Элемент очереди не найден');
    }
    if (item.status !== MatchQueueStatus.OPEN) {
      throw new BadRequestException('Элемент уже обработан');
    }
    return item;
  }

  private async assertWorkExists(workId: string) {
    const work = await this.prisma.work.findUnique({
      where: { id: workId },
      select: { id: true, deletedAt: true },
    });
    if (!work || work.deletedAt) {
      throw new NotFoundException('Произведение не найдено');
    }
  }

  private async loadMatchableWorks() {
    return this.prisma.work.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        titleRu: true,
        titleOrig: true,
        yearFirst: true,
      },
      take: 5000,
      orderBy: { updatedAt: 'desc' },
    });
  }

  private candidateFromPayload(
    kind: MatchQueueKind,
    payload: Prisma.JsonValue,
  ): MatchCandidateInput | null {
    const data = payload as Record<string, unknown>;
    if (kind === MatchQueueKind.IMPORT_ROW) {
      const p = data as ImportRowPayload;
      const title = p.titleRu?.trim();
      if (!title) {
        return null;
      }
      return { title, year: p.yearFirst ?? null };
    }
    if (kind === MatchQueueKind.CONTEXT_CANDIDATE) {
      const p = data as ContextCandidatePayload;
      const title = p.title?.trim();
      if (!title) {
        return null;
      }
      return { title, year: p.year ?? null };
    }
    if (kind === MatchQueueKind.RANKING_ENTRY) {
      const p = data as RankingEntryPayload;
      const title = (p.titleRu ?? p.titleOrig)?.trim();
      if (!title) {
        return null;
      }
      return { title, year: p.year ?? null };
    }
    return null;
  }

  private toListItem(
    item: {
      id: string;
      kind: MatchQueueKind;
      status: MatchQueueStatus;
      payload: Prisma.JsonValue;
      resolvedWorkId: string | null;
      createdAt: Date;
      updatedAt: Date;
      resolvedWork: {
        id: string;
        slug: string;
        titleRu: string;
        status: WorkStatus;
      } | null;
    },
    works: Awaited<ReturnType<AdminMatchQueueService['loadMatchableWorks']>>,
  ) {
    const candidate = this.candidateFromPayload(item.kind, item.payload);
    const suggestions = candidate
      ? findWorkMatchSuggestions(
          candidate,
          works,
          FUZZY_MATCH_LOW_THRESHOLD,
          SUGGESTION_LIMIT,
        ).map((match) => ({
          workId: match.work.id,
          titleRu: match.work.titleRu,
          titleOrig: match.work.titleOrig,
          yearFirst: match.work.yearFirst,
          score: match.score,
        }))
      : [];

    return {
      id: item.id,
      kind: item.kind,
      status: item.status,
      payload: item.payload as Record<string, unknown>,
      resolvedWorkId: item.resolvedWorkId,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      suggestions,
      resolvedWork: item.resolvedWork,
    };
  }

  private async createDraftFromPayload(
    kind: MatchQueueKind,
    payload: Prisma.JsonValue,
  ): Promise<string> {
    const data = payload as Record<string, unknown>;
    if (kind === MatchQueueKind.IMPORT_ROW) {
      const p = data as ImportRowPayload;
      const titleRu = p.titleRu?.trim();
      if (!titleRu) {
        throw new BadRequestException('В payload нет названия для DRAFT');
      }
      const slug = await this.ensureUniqueWorkSlug(this.slugify(titleRu));
      const work = await this.prisma.work.create({
        data: {
          slug,
          titleRu,
          titleOrig: p.titleOrig ?? undefined,
          yearFirst: p.yearFirst ?? undefined,
          status: WorkStatus.DRAFT,
        },
      });
      if (p.isbn13) {
        const existing = await this.prisma.edition.findUnique({
          where: { isbn13: p.isbn13 },
        });
        if (!existing) {
          await this.prisma.edition.create({
            data: {
              workId: work.id,
              language: 'ru',
              title: titleRu,
              isbn13: p.isbn13,
              year: p.yearFirst ?? undefined,
            },
          });
        }
      }
      return work.id;
    }

    const candidate = this.candidateFromPayload(kind, payload);
    if (!candidate?.title) {
      throw new BadRequestException('В payload нет названия для DRAFT');
    }
    const slug = await this.ensureUniqueWorkSlug(this.slugify(candidate.title));
    const work = await this.prisma.work.create({
      data: {
        slug,
        titleRu: candidate.title,
        yearFirst: candidate.year ?? undefined,
        status: WorkStatus.DRAFT,
      },
    });
    return work.id;
  }

  private async applyFollowUp(
    item: { kind: MatchQueueKind; payload: Prisma.JsonValue },
    workId: string,
  ): Promise<{ contextPublished?: boolean; importRowApplied?: boolean }> {
    if (item.kind === MatchQueueKind.IMPORT_ROW) {
      const p = item.payload as ImportRowPayload;
      await this.applyImportRowFollowUp(workId, p);
      return { importRowApplied: true };
    }
    if (item.kind === MatchQueueKind.CONTEXT_CANDIDATE) {
      const published = await this.applyContextFollowUp(
        item.payload as ContextCandidatePayload,
        workId,
      );
      return { contextPublished: published };
    }
    return {};
  }

  private async applyImportRowFollowUp(
    workId: string,
    payload: ImportRowPayload,
  ): Promise<void> {
    const work = await this.prisma.work.findUnique({ where: { id: workId } });
    if (!work) {
      return;
    }
    const data: {
      titleOrig?: string;
      yearFirst?: number;
    } = {};
    if (!work.titleOrig && payload.titleOrig) {
      data.titleOrig = payload.titleOrig;
    }
    if (work.yearFirst == null && payload.yearFirst != null) {
      data.yearFirst = payload.yearFirst;
    }
    if (Object.keys(data).length > 0) {
      await this.prisma.work.update({ where: { id: workId }, data });
    }
    if (payload.isbn13) {
      const existing = await this.prisma.edition.findUnique({
        where: { isbn13: payload.isbn13 },
      });
      if (!existing) {
        await this.prisma.edition.create({
          data: {
            workId,
            language: 'ru',
            title: payload.titleRu ?? work.titleRu,
            isbn13: payload.isbn13,
            year: payload.yearFirst ?? undefined,
          },
        });
      }
    }
  }

  private async applyContextFollowUp(
    payload: ContextCandidatePayload,
    recommendedWorkId: string,
  ): Promise<boolean> {
    const subjectWorkId = payload.subjectWorkId;
    if (!subjectWorkId) {
      return false;
    }
    const importanceRank = payload.importanceRank ?? 3;
    const whyText = payload.whyTextRu?.trim() || 'Рекомендация из контекста';
    const now = new Date();

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
        importanceRank,
        whyText,
        status: ContextReadingStatus.PUBLISHED,
        publishedAt: now,
      },
      update: {
        importanceRank,
        whyText,
        status: ContextReadingStatus.PUBLISHED,
        publishedAt: now,
      },
    });
    return true;
  }

  private async ensureUniqueWorkSlug(base: string): Promise<string> {
    let candidate = base;
    let n = 2;
    while (
      await this.prisma.work.findFirst({
        where: { slug: candidate },
        select: { id: true },
      })
    ) {
      candidate = `${base}-${n}`;
      n += 1;
    }
    return candidate;
  }

  slugify(text: string): string {
    const CYRILLIC_TO_LATIN: Record<string, string> = {
      а: 'a',
      б: 'b',
      в: 'v',
      г: 'g',
      д: 'd',
      е: 'e',
      ё: 'e',
      ж: 'zh',
      з: 'z',
      и: 'i',
      й: 'y',
      к: 'k',
      л: 'l',
      м: 'm',
      н: 'n',
      о: 'o',
      п: 'p',
      р: 'r',
      с: 's',
      т: 't',
      у: 'u',
      ф: 'f',
      х: 'h',
      ц: 'ts',
      ч: 'ch',
      ш: 'sh',
      щ: 'sch',
      ъ: '',
      ы: 'y',
      ь: '',
      э: 'e',
      ю: 'yu',
      я: 'ya',
    };
    const lowered = text.trim().toLowerCase();
    let out = '';
    for (const char of lowered) {
      if (CYRILLIC_TO_LATIN[char] !== undefined) {
        out += CYRILLIC_TO_LATIN[char];
        continue;
      }
      if (/[a-z0-9]/.test(char)) {
        out += char;
        continue;
      }
      out += '-';
    }
    const normalized = out
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 200);
    return normalized.length > 0 ? normalized : 'match-queue-work';
  }
}

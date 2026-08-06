import { Injectable } from '@nestjs/common';
import {
  ExternalIdEntityType,
  MatchQueueKind,
  MatchQueueStatus,
  WorkStatus,
} from '@prisma/client';
import type {
  AdminCatalogImportReport,
  AdminCatalogImportStart,
} from '@bookspace/schemas';
import { PrismaService } from '../prisma/prisma.service';
import { buildImportRows } from './catalog-import.normalize';
import type {
  CatalogImportExternalId,
  NormalizedImportRow,
} from './catalog-import.types';

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

@Injectable()
export class CatalogImportService {
  constructor(private readonly prisma: PrismaService) {}

  async runBatch(
    input: AdminCatalogImportStart,
  ): Promise<AdminCatalogImportReport> {
    const rows = buildImportRows(input);
    const report: AdminCatalogImportReport = {
      created: 0,
      updated: 0,
      queued: 0,
      drafts: 0,
      failed: 0,
      matchQueueIds: [],
    };

    for (const row of rows) {
      try {
        const outcome = await this.processRow(row);
        if (outcome === 'updated') {
          report.updated += 1;
        } else if (outcome === 'created') {
          report.created += 1;
          report.drafts += 1;
        } else if (outcome.kind === 'queued') {
          report.queued += 1;
          report.matchQueueIds!.push(outcome.id);
        }
      } catch {
        report.failed += 1;
      }
    }

    if (report.matchQueueIds!.length === 0) {
      delete report.matchQueueIds;
    }
    return report;
  }

  private async processRow(
    row: NormalizedImportRow,
  ): Promise<'updated' | 'created' | { kind: 'queued'; id: string }> {
    const matchedWorkId = await this.findWorkByExternalIds(row.externalIds);
    if (matchedWorkId) {
      await this.attachExternalIds(matchedWorkId, row.externalIds);
      await this.ensureEdition(matchedWorkId, row);
      await this.fillEmptyWorkFields(matchedWorkId, row);
      return 'updated';
    }

    if (row.isbn13) {
      const edition = await this.prisma.edition.findUnique({
        where: { isbn13: row.isbn13 },
        select: { workId: true },
      });
      if (edition) {
        await this.attachExternalIds(edition.workId, row.externalIds);
        await this.fillEmptyWorkFields(edition.workId, row);
        return 'updated';
      }
    }

    const hasId = row.externalIds.length > 0 || Boolean(row.isbn13);
    if (!hasId) {
      const queued = await this.prisma.matchQueue.create({
        data: {
          kind: MatchQueueKind.IMPORT_ROW,
          status: MatchQueueStatus.OPEN,
          payload: {
            titleRu: row.titleRu,
            titleOrig: row.titleOrig ?? null,
            titleNorm: row.titleNorm,
            yearFirst: row.yearFirst ?? null,
            isbn13: row.isbn13 ?? null,
            raw: row.raw as object,
          },
        },
        select: { id: true },
      });
      return { kind: 'queued', id: queued.id };
    }

    await this.createDraftWork(row);
    return 'created';
  }

  private async findWorkByExternalIds(
    externalIds: CatalogImportExternalId[],
  ): Promise<string | null> {
    for (const ext of externalIds) {
      const found = await this.prisma.externalId.findUnique({
        where: {
          source_externalKey: {
            source: ext.source,
            externalKey: ext.externalKey,
          },
        },
        select: { entityType: true, entityId: true },
      });
      if (found?.entityType === ExternalIdEntityType.WORK) {
        const work = await this.prisma.work.findUnique({
          where: { id: found.entityId },
          select: { id: true, deletedAt: true },
        });
        if (work && !work.deletedAt) {
          return work.id;
        }
      }
    }
    return null;
  }

  private async attachExternalIds(
    workId: string,
    externalIds: CatalogImportExternalId[],
  ): Promise<void> {
    for (const ext of externalIds) {
      const existing = await this.prisma.externalId.findUnique({
        where: {
          source_externalKey: {
            source: ext.source,
            externalKey: ext.externalKey,
          },
        },
      });
      if (!existing) {
        await this.prisma.externalId.create({
          data: {
            entityType: ExternalIdEntityType.WORK,
            entityId: workId,
            source: ext.source,
            externalKey: ext.externalKey,
          },
        });
      }
    }
  }

  private async ensureEdition(
    workId: string,
    row: NormalizedImportRow,
  ): Promise<void> {
    if (!row.isbn13) {
      return;
    }
    const existing = await this.prisma.edition.findUnique({
      where: { isbn13: row.isbn13 },
    });
    if (existing) {
      return;
    }
    await this.prisma.edition.create({
      data: {
        workId,
        language: 'ru',
        title: row.titleRu,
        isbn13: row.isbn13,
        year: row.yearFirst ?? undefined,
      },
    });
  }

  private async fillEmptyWorkFields(
    workId: string,
    row: NormalizedImportRow,
  ): Promise<void> {
    const work = await this.prisma.work.findUnique({ where: { id: workId } });
    if (!work) {
      return;
    }
    const data: {
      titleOrig?: string;
      yearFirst?: number;
      descriptionRu?: string;
    } = {};
    if (!work.titleOrig && row.titleOrig) {
      data.titleOrig = row.titleOrig;
    }
    if (work.yearFirst == null && row.yearFirst != null) {
      data.yearFirst = row.yearFirst;
    }
    if (Object.keys(data).length > 0) {
      await this.prisma.work.update({ where: { id: workId }, data });
    }
  }

  private async createDraftWork(row: NormalizedImportRow): Promise<string> {
    const baseSlug = this.slugify(row.titleRu);
    const slug = await this.ensureUniqueWorkSlug(baseSlug);
    const work = await this.prisma.work.create({
      data: {
        slug,
        titleRu: row.titleRu,
        titleOrig: row.titleOrig,
        yearFirst: row.yearFirst ?? undefined,
        status: WorkStatus.DRAFT,
      },
    });
    await this.attachExternalIds(work.id, row.externalIds);
    await this.ensureEdition(work.id, row);
    return work.id;
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
    return normalized.length > 0 ? normalized : 'import-work';
  }
}

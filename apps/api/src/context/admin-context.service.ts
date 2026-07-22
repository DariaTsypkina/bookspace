import { Injectable, NotFoundException } from '@nestjs/common';
import { ContextReadingStatus } from '@prisma/client';
import { AUDIT_ACTION, AUDIT_ENTITY } from '../audit/audit.constants';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import type { AdminContextReadingItem } from './admin-context.types';
import { DEFAULT_RECENT_CONTEXT_DAYS } from './context.constants';

const readingInclude = {
  subjectWork: {
    select: { id: true, slug: true, titleRu: true },
  },
  recommendedWork: {
    select: { id: true, slug: true, titleRu: true },
  },
} as const;

function toAuditSnapshot(reading: {
  importanceRank: number;
  whyText: string;
  status: string;
  publishedAt: Date | null;
}) {
  return {
    importanceRank: reading.importanceRank,
    whyText: reading.whyText,
    status: reading.status,
    publishedAt: reading.publishedAt?.toISOString() ?? null,
  };
}

function toAdminItem(reading: {
  id: string;
  importanceRank: number;
  whyText: string;
  status: ContextReadingStatus;
  sourceUrl: string | null;
  sourceSnippet: string | null;
  llmModel: string | null;
  llmRunId: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  subjectWork: { id: string; slug: string; titleRu: string };
  recommendedWork: { id: string; slug: string; titleRu: string };
}): AdminContextReadingItem {
  return {
    id: reading.id,
    subjectWork: reading.subjectWork,
    recommendedWork: reading.recommendedWork,
    importanceRank: reading.importanceRank,
    whyText: reading.whyText,
    status: reading.status,
    sourceUrl: reading.sourceUrl,
    sourceSnippet: reading.sourceSnippet,
    llmModel: reading.llmModel,
    llmRunId: reading.llmRunId,
    publishedAt: reading.publishedAt?.toISOString() ?? null,
    createdAt: reading.createdAt.toISOString(),
    updatedAt: reading.updatedAt.toISOString(),
  };
}

@Injectable()
export class AdminContextService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async listRecentAutoPublished(
    options: { days?: number; limit?: number } = {},
  ): Promise<{ items: AdminContextReadingItem[] }> {
    const days = options.days ?? DEFAULT_RECENT_CONTEXT_DAYS;
    const limit = options.limit ?? 50;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const readings = await this.prisma.contextReading.findMany({
      where: {
        status: ContextReadingStatus.PUBLISHED,
        publishedAt: { gte: since },
      },
      include: readingInclude,
      orderBy: [{ publishedAt: 'desc' }, { importanceRank: 'asc' }],
      take: limit,
    });

    return { items: readings.map(toAdminItem) };
  }

  async updateReading(
    id: string,
    actorUserId: string,
    data: { whyText?: string; importanceRank?: number },
  ): Promise<AdminContextReadingItem> {
    const existing = await this.requireReading(id);
    const updated = await this.prisma.contextReading.update({
      where: { id },
      data,
      include: readingInclude,
    });

    await this.audit.log({
      actorUserId,
      action: AUDIT_ACTION.CONTEXT_UPDATE,
      entityType: AUDIT_ENTITY.CONTEXT_READING,
      entityId: id,
      before: toAuditSnapshot(existing),
      after: toAuditSnapshot(updated),
    });

    return toAdminItem(updated);
  }

  async unpublishReading(
    id: string,
    actorUserId: string,
  ): Promise<AdminContextReadingItem> {
    const existing = await this.requireReading(id);
    const updated = await this.prisma.contextReading.update({
      where: { id },
      data: {
        status: ContextReadingStatus.DRAFT,
        publishedAt: null,
      },
      include: readingInclude,
    });

    await this.audit.log({
      actorUserId,
      action: AUDIT_ACTION.CONTEXT_UNPUBLISH,
      entityType: AUDIT_ENTITY.CONTEXT_READING,
      entityId: id,
      before: toAuditSnapshot(existing),
      after: toAuditSnapshot(updated),
    });

    return toAdminItem(updated);
  }

  async rejectReading(
    id: string,
    actorUserId: string,
  ): Promise<AdminContextReadingItem> {
    const existing = await this.requireReading(id);
    const updated = await this.prisma.contextReading.update({
      where: { id },
      data: {
        status: ContextReadingStatus.REJECTED,
        publishedAt: null,
      },
      include: readingInclude,
    });

    await this.audit.log({
      actorUserId,
      action: AUDIT_ACTION.CONTEXT_REJECT,
      entityType: AUDIT_ENTITY.CONTEXT_READING,
      entityId: id,
      before: toAuditSnapshot(existing),
      after: toAuditSnapshot(updated),
    });

    return toAdminItem(updated);
  }

  private async requireReading(id: string) {
    const reading = await this.prisma.contextReading.findUnique({
      where: { id },
      include: readingInclude,
    });
    if (!reading) {
      throw new NotFoundException('ContextReading not found');
    }
    return reading;
  }
}

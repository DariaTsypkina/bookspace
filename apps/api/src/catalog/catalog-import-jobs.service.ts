import { InjectQueue } from '@nestjs/bullmq';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { randomUUID } from 'crypto';
import {
  assertCatalogImportStartPayload,
  type AdminCatalogImportStart,
} from '@bookspace/schemas';
import { AUDIT_ACTION, AUDIT_ENTITY } from '../audit/audit.constants';
import { AuditService } from '../audit/audit.service';
import { CATALOG_IMPORT_BATCH_JOB, CATALOG_QUEUE } from './catalog.constants';
import { CatalogImportService } from './catalog-import.service';
import type {
  CatalogImportJobData,
  CatalogImportJobResult,
  CatalogImportJobView,
} from './catalog-import.types';

const syncResults = new Map<string, CatalogImportJobResult>();

@Injectable()
export class CatalogImportJobsService {
  constructor(
    @InjectQueue(CATALOG_QUEUE) private readonly queue: Queue,
    private readonly importService: CatalogImportService,
    private readonly audit: AuditService,
  ) {}

  async startJob(
    input: AdminCatalogImportStart,
    actorUserId: string,
  ): Promise<{ jobId: string; status: 'queued' | 'completed' }> {
    try {
      assertCatalogImportStartPayload(input);
    } catch (err) {
      throw new BadRequestException(
        err instanceof Error ? err.message : 'Некорректный запрос импорта',
      );
    }

    const jobId = input.idempotencyKey?.trim() || randomUUID();

    await this.audit.log({
      actorUserId,
      action: AUDIT_ACTION.CATALOG_IMPORT_START,
      entityType: AUDIT_ENTITY.WORK,
      entityId: jobId,
      after: {
        source: input.source,
        jobId,
      },
    });

    if (process.env.JOBS_SYNC === 'true') {
      if (syncResults.has(jobId)) {
        return { jobId, status: 'completed' };
      }
      const report = await this.importService.runBatch(input);
      syncResults.set(jobId, { report });
      return { jobId, status: 'completed' };
    }

    const existing = await this.queue.getJob(jobId);
    if (existing) {
      const state = await existing.getState();
      if (state === 'completed') {
        return { jobId, status: 'completed' };
      }
      return { jobId, status: 'queued' };
    }

    await this.queue.add(
      CATALOG_IMPORT_BATCH_JOB,
      {
        ...input,
        actorUserId,
      } satisfies CatalogImportJobData,
      {
        jobId,
        removeOnComplete: false,
        removeOnFail: false,
      },
    );
    return { jobId, status: 'queued' };
  }

  async getJob(jobId: string): Promise<CatalogImportJobView> {
    if (process.env.JOBS_SYNC === 'true') {
      const sync = syncResults.get(jobId);
      if (!sync) {
        throw new NotFoundException('Задача импорта не найдена');
      }
      return { jobId, status: 'completed', report: sync.report };
    }

    const job = await this.queue.getJob(jobId);
    if (!job) {
      throw new NotFoundException('Задача импорта не найдена');
    }

    const state = await job.getState();
    if (state === 'completed') {
      const result = job.returnvalue as CatalogImportJobResult | undefined;
      return {
        jobId,
        status: 'completed',
        report: result?.report,
      };
    }
    if (state === 'failed') {
      return {
        jobId,
        status: 'failed',
        error: job.failedReason ?? 'Ошибка импорта',
      };
    }
    if (state === 'active') {
      return { jobId, status: 'active' };
    }
    return { jobId, status: 'queued' };
  }

  /** Test helper: clear sync job store. */
  static clearSyncResults(): void {
    syncResults.clear();
  }
}

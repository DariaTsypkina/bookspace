import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { CATALOG_IMPORT_BATCH_JOB, CATALOG_QUEUE } from './catalog.constants';
import { CatalogImportService } from './catalog-import.service';
import type {
  CatalogImportJobData,
  CatalogImportJobResult,
} from './catalog-import.types';

@Injectable()
@Processor(CATALOG_QUEUE)
export class CatalogImportProcessor extends WorkerHost {
  constructor(private readonly importService: CatalogImportService) {
    super();
  }

  async process(
    job: Job<CatalogImportJobData>,
  ): Promise<CatalogImportJobResult> {
    if (job.name !== CATALOG_IMPORT_BATCH_JOB) {
      throw new Error(`Unknown catalog job: ${job.name}`);
    }
    const report = await this.importService.runBatch(job.data);
    return { report };
  }
}

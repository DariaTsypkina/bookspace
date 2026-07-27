import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { CONTEXT_CLASSIFY_JOB, CONTEXT_EXTRACT_JOB } from './context.constants';
import type {
  ContextClassifyJobData,
  ContextExtractJobData,
} from './context-jobs.processor';
import { CONTEXT_QUEUE } from './context-jobs.processor';
import { ContextClassifyService } from './context-classify.service';
import { ContextExtractService } from './context-extract.service';

@Injectable()
export class ContextJobsService {
  constructor(
    @InjectQueue(CONTEXT_QUEUE) private readonly queue: Queue,
    private readonly classifyService: ContextClassifyService,
    private readonly extractService: ContextExtractService,
  ) {}

  async enqueueClassify(workId: string): Promise<{ jobId: string }> {
    if (process.env.JOBS_SYNC === 'true') {
      await this.classifyService.classifyWork(workId);
      return { jobId: 'sync' };
    }

    const job = await this.queue.add(
      CONTEXT_CLASSIFY_JOB,
      { workId } satisfies ContextClassifyJobData,
      { removeOnComplete: true },
    );
    return { jobId: job.id ?? 'unknown' };
  }

  async enqueueExtract(
    workId: string,
    force = false,
  ): Promise<{ jobId: string }> {
    if (process.env.JOBS_SYNC === 'true') {
      await this.extractService.extractAndPublish(workId, { force });
      return { jobId: 'sync' };
    }

    const job = await this.queue.add(
      CONTEXT_EXTRACT_JOB,
      { workId, force } satisfies ContextExtractJobData,
      { removeOnComplete: true },
    );
    return { jobId: job.id ?? 'unknown' };
  }
}

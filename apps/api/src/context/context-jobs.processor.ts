import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { CONTEXT_CLASSIFY_JOB, CONTEXT_EXTRACT_JOB } from './context.constants';
import { ContextClassifyService } from './context-classify.service';
import { ContextExtractService } from './context-extract.service';

export const CONTEXT_QUEUE = 'context';

export interface ContextClassifyJobData {
  workId: string;
}

export interface ContextExtractJobData {
  workId: string;
  force?: boolean;
}

@Injectable()
@Processor(CONTEXT_QUEUE)
export class ContextJobsProcessor extends WorkerHost {
  constructor(
    private readonly classifyService: ContextClassifyService,
    private readonly extractService: ContextExtractService,
  ) {
    super();
  }

  async process(
    job: Job<ContextClassifyJobData | ContextExtractJobData>,
  ): Promise<unknown> {
    switch (job.name) {
      case CONTEXT_CLASSIFY_JOB:
        return this.classifyService.classifyWork(job.data.workId);
      case CONTEXT_EXTRACT_JOB:
        return this.extractService.extractAndPublish(
          (job.data as ContextExtractJobData).workId,
          { force: (job.data as ContextExtractJobData).force },
        );
      default:
        throw new Error(`Unknown context job: ${job.name}`);
    }
  }
}

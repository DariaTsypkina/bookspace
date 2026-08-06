import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { ContextReadingStatus, MatchQueueStatus } from '@prisma/client';
import { Queue } from 'bullmq';
import { DEFAULT_RECENT_CONTEXT_DAYS } from '../context/context.constants';
import { CONTEXT_QUEUE } from '../context/context-jobs.processor';
import { PrismaService } from '../prisma/prisma.service';
import type { AdminDashboardSummary } from './admin-dashboard.types';

@Injectable()
export class AdminDashboardService {
  private readonly logger = new Logger(AdminDashboardService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(CONTEXT_QUEUE) private readonly contextQueue: Queue,
  ) {}

  async getSummary(
    options: { days?: number } = {},
  ): Promise<AdminDashboardSummary> {
    const days = options.days ?? DEFAULT_RECENT_CONTEXT_DAYS;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [matchQueueOpen, recentContext] = await Promise.all([
      this.prisma.matchQueue.count({
        where: { status: MatchQueueStatus.OPEN },
      }),
      this.prisma.contextReading.count({
        where: {
          status: ContextReadingStatus.PUBLISHED,
          publishedAt: { gte: since },
        },
      }),
    ]);

    const failedJobs = await this.countFailedJobs();

    return {
      matchQueueOpen,
      recentContext,
      failedJobs,
      recentContextDays: days,
    };
  }

  private async countFailedJobs(): Promise<number> {
    const queues: Queue[] = [this.contextQueue];
    let total = 0;
    for (const queue of queues) {
      try {
        total += await queue.getFailedCount();
      } catch (error) {
        // Redis may be unavailable (e.g. JOBS_SYNC tests); failed-job count is best-effort.
        this.logger.debug(
          `Skipping failed-job count for queue ${queue.name}: ${String(error)}`,
        );
      }
    }
    return total;
  }
}

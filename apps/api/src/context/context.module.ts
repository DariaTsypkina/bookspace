import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { AdminWorkController } from '../admin/admin-work.controller';
import { AuditService } from '../audit/audit.service';
import { AdminContextController } from './admin-context.controller';
import { AdminContextService } from './admin-context.service';
import { AuthModule } from '../auth/auth.module';
import { FakeLlmProvider } from '../llm/fake-llm.provider';
import { LLM_PROVIDER } from '../llm/llm.provider';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigWhitelistFetcher } from './config-whitelist.fetcher';
import { ContextClassifyService } from './context-classify.service';
import { ContextExtractService } from './context-extract.service';
import { ContextJobsProcessor, CONTEXT_QUEUE } from './context-jobs.processor';
import { ContextJobsService } from './context-jobs.service';
import { WHITELIST_FETCHER } from './context-whitelist.fetcher';

function redisConnection() {
  const url = process.env.REDIS_URL ?? 'redis://localhost:6379';
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: Number(parsed.port || 6379),
  };
}

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    BullModule.registerQueue({
      name: CONTEXT_QUEUE,
      connection: redisConnection(),
    }),
  ],
  controllers: [AdminWorkController, AdminContextController],
  providers: [
    AuditService,
    AdminContextService,
    ContextClassifyService,
    ContextExtractService,
    ContextJobsService,
    ContextJobsProcessor,
    ConfigWhitelistFetcher,
    FakeLlmProvider,
    {
      provide: LLM_PROVIDER,
      useExisting: FakeLlmProvider,
    },
    {
      provide: WHITELIST_FETCHER,
      useExisting: ConfigWhitelistFetcher,
    },
  ],
  exports: [
    ContextClassifyService,
    ContextExtractService,
    ContextJobsService,
    LLM_PROVIDER,
    FakeLlmProvider,
  ],
})
export class ContextModule {}

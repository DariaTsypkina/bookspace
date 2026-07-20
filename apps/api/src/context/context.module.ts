import { Module } from '@nestjs/common';
import { AdminWorkController } from '../admin/admin-work.controller';
import { AuthModule } from '../auth/auth.module';
import { FakeLlmProvider } from '../llm/fake-llm.provider';
import { LLM_PROVIDER } from '../llm/llm.provider';
import { PrismaModule } from '../prisma/prisma.module';
import { ContextClassifyService } from './context-classify.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AdminWorkController],
  providers: [
    ContextClassifyService,
    FakeLlmProvider,
    {
      provide: LLM_PROVIDER,
      useExisting: FakeLlmProvider,
    },
  ],
  exports: [ContextClassifyService, LLM_PROVIDER, FakeLlmProvider],
})
export class ContextModule {}

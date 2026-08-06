import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NeedsContext } from '@prisma/client';
import { LLM_CLASSIFY_CONFIDENCE_THRESHOLD } from '../llm/llm.types';
import { LLM_PROVIDER, type LlmProvider } from '../llm/llm.provider';
import { PrismaService } from '../prisma/prisma.service';

export interface ClassifyWorkResult {
  needsContext: NeedsContext;
  skipped: boolean;
}

@Injectable()
export class ContextClassifyService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(LLM_PROVIDER) private readonly llm: LlmProvider,
  ) {}

  async classifyWork(workId: string): Promise<ClassifyWorkResult> {
    const work = await this.prisma.work.findFirst({
      where: { id: workId, deletedAt: null },
    });
    if (!work) {
      throw new NotFoundException('Work not found');
    }

    if (work.needsContextAdminSetAt !== null) {
      return { needsContext: work.needsContext, skipped: true };
    }

    const llmResult = await this.llm.classifyNeed({
      titleRu: work.titleRu,
      titleOrig: work.titleOrig,
      yearFirst: work.yearFirst,
      relationCount: 0,
    });

    const needsContext = this.mapLlmResult(llmResult);

    await this.prisma.work.update({
      where: { id: work.id },
      data: { needsContext },
    });

    return { needsContext, skipped: false };
  }

  async setAdminNeedsContext(
    workId: string,
    needsContext: NeedsContext,
  ): Promise<{ needsContext: NeedsContext }> {
    const work = await this.prisma.work.findFirst({
      where: { id: workId, deletedAt: null },
    });
    if (!work) {
      throw new NotFoundException('Work not found');
    }

    const needsContextAdminSetAt =
      needsContext === NeedsContext.YES || needsContext === NeedsContext.NO
        ? new Date()
        : null;

    await this.prisma.work.update({
      where: { id: work.id },
      data: { needsContext, needsContextAdminSetAt },
    });

    return { needsContext };
  }

  private mapLlmResult(result: {
    needs_context: boolean;
    confidence: number;
  }): NeedsContext {
    if (result.confidence < LLM_CLASSIFY_CONFIDENCE_THRESHOLD) {
      return NeedsContext.UNKNOWN;
    }
    return result.needs_context ? NeedsContext.YES : NeedsContext.NO;
  }
}

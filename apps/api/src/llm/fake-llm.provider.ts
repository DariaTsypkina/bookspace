import { Injectable } from '@nestjs/common';
import type { ClassifyNeedInput, ClassifyNeedOutput } from './llm.types';
import type { LlmProvider } from './llm.provider';

@Injectable()
export class FakeLlmProvider implements LlmProvider {
  private handler: (
    input: ClassifyNeedInput,
  ) => ClassifyNeedOutput | Promise<ClassifyNeedOutput> = () => ({
    needs_context: false,
    confidence: 0.9,
    reason: 'default fake',
  });

  setHandler(
    handler: (
      input: ClassifyNeedInput,
    ) => ClassifyNeedOutput | Promise<ClassifyNeedOutput>,
  ): void {
    this.handler = handler;
  }

  classifyNeed(input: ClassifyNeedInput): Promise<ClassifyNeedOutput> {
    return Promise.resolve(this.handler(input));
  }
}

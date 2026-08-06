import { Injectable } from '@nestjs/common';
import type {
  ClassifyNeedInput,
  ClassifyNeedOutput,
  ExtractContextInput,
  ExtractContextOutput,
} from './llm.types';
import type { LlmProvider } from './llm.provider';

@Injectable()
export class FakeLlmProvider implements LlmProvider {
  private classifyHandler: (
    input: ClassifyNeedInput,
  ) => ClassifyNeedOutput | Promise<ClassifyNeedOutput> = () => ({
    needs_context: false,
    confidence: 0.9,
    reason: 'default fake',
  });

  private extractHandler: (
    input: ExtractContextInput,
  ) => ExtractContextOutput | Promise<ExtractContextOutput> = () => ({
    candidates: [],
    disclaimer_ok: false,
  });

  setHandler(
    handler: (
      input: ClassifyNeedInput,
    ) => ClassifyNeedOutput | Promise<ClassifyNeedOutput>,
  ): void {
    this.classifyHandler = handler;
  }

  setExtractHandler(
    handler: (
      input: ExtractContextInput,
    ) => ExtractContextOutput | Promise<ExtractContextOutput>,
  ): void {
    this.extractHandler = handler;
  }

  classifyNeed(input: ClassifyNeedInput): Promise<ClassifyNeedOutput> {
    return Promise.resolve(this.classifyHandler(input));
  }

  extractContext(input: ExtractContextInput): Promise<ExtractContextOutput> {
    return Promise.resolve(this.extractHandler(input));
  }
}

import type {
  ClassifyNeedInput,
  ClassifyNeedOutput,
  ExtractContextInput,
  ExtractContextOutput,
} from './llm.types';

export const LLM_PROVIDER = Symbol('LLM_PROVIDER');

export interface LlmProvider {
  classifyNeed(input: ClassifyNeedInput): Promise<ClassifyNeedOutput>;
  extractContext(input: ExtractContextInput): Promise<ExtractContextOutput>;
}

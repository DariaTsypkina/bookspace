import type { ClassifyNeedInput, ClassifyNeedOutput } from './llm.types';

export const LLM_PROVIDER = Symbol('LLM_PROVIDER');

export interface LlmProvider {
  classifyNeed(input: ClassifyNeedInput): Promise<ClassifyNeedOutput>;
}

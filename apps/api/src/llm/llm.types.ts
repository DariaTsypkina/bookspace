export interface ClassifyNeedInput {
  titleRu: string;
  titleOrig?: string | null;
  yearFirst?: number | null;
  relationCount: number;
}

export interface ClassifyNeedOutput {
  needs_context: boolean;
  confidence: number;
  reason: string;
}

export const LLM_CLASSIFY_CONFIDENCE_THRESHOLD = 0.7;

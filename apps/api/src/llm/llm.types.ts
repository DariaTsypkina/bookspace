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

export interface ExtractContextSource {
  url: string;
  snippet: string;
}

export interface ExtractContextInput {
  subjectTitleRu: string;
  subjectTitleOrig?: string | null;
  sources: ExtractContextSource[];
}

export interface ExtractContextCandidate {
  title: string;
  author: string;
  year: number | null;
  importance_rank: number;
  why_text_ru: string;
  evidence_quote: string | null;
}

export interface ExtractContextOutput {
  candidates: ExtractContextCandidate[];
  disclaimer_ok: boolean;
}

export const LLM_CLASSIFY_CONFIDENCE_THRESHOLD = 0.7;
export const FUZZY_MATCH_HIGH_THRESHOLD = 0.92;
export const FUZZY_MATCH_LOW_THRESHOLD = 0.75;

import type { ContextReadingStatus } from '@prisma/client';

export type AdminContextWorkSummary = {
  id: string;
  slug: string;
  titleRu: string;
};

export type AdminContextReadingItem = {
  id: string;
  subjectWork: AdminContextWorkSummary;
  recommendedWork: AdminContextWorkSummary;
  importanceRank: number;
  whyText: string;
  status: ContextReadingStatus;
  sourceUrl: string | null;
  sourceSnippet: string | null;
  llmModel: string | null;
  llmRunId: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PublicContextReadingItem = {
  recommendedWork: {
    slug: string;
    titleRu: string;
  };
  importanceRank: number;
  whyText: string;
};

import { api, noStoreConfig } from './http';

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
  status: 'DRAFT' | 'PUBLISHED' | 'REJECTED';
  sourceUrl: string | null;
  sourceSnippet: string | null;
  llmModel: string | null;
  llmRunId: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const ADMIN_BFF_BASE = '/api/admin';

export async function fetchRecentContextReadings(
  days = 7,
): Promise<{ items: AdminContextReadingItem[] }> {
  const { data } = await api.get<{ items: AdminContextReadingItem[] }>(
    `${ADMIN_BFF_BASE}/context/recent?days=${days}`,
    noStoreConfig,
  );
  return data;
}

export async function patchContextReading(
  id: string,
  data: { whyText?: string; importanceRank?: number },
): Promise<AdminContextReadingItem> {
  const { data: item } = await api.patch<AdminContextReadingItem>(
    `${ADMIN_BFF_BASE}/context/${id}`,
    data,
  );
  return item;
}

export async function unpublishContextReading(
  id: string,
): Promise<AdminContextReadingItem> {
  const { data } = await api.post<AdminContextReadingItem>(
    `${ADMIN_BFF_BASE}/context/${id}/unpublish`,
  );
  return data;
}

export async function rejectContextReading(
  id: string,
): Promise<AdminContextReadingItem> {
  const { data } = await api.post<AdminContextReadingItem>(
    `${ADMIN_BFF_BASE}/context/${id}/reject`,
  );
  return data;
}

export async function classifyContextForWork(workId: string): Promise<unknown> {
  const { data } = await api.post(
    `${ADMIN_BFF_BASE}/works/${workId}/context/classify`,
  );
  return data;
}

export async function extractContextForWork(
  workId: string,
  options: { force?: boolean; async?: boolean } = {},
): Promise<unknown> {
  const { data } = await api.post(
    `${ADMIN_BFF_BASE}/works/${workId}/context/extract`,
    options,
  );
  return data;
}

export function formatPublishedAt(iso: string | null): string {
  if (!iso) {
    return '—';
  }
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}

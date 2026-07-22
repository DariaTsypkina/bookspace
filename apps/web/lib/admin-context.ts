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

async function parseApiError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(body.message)) {
      return body.message.join(', ');
    }
    if (body.message) {
      return body.message;
    }
  } catch {
    // ignore
  }
  return `Ошибка API: ${response.status}`;
}

export async function fetchRecentContextReadings(
  days = 7,
): Promise<{ items: AdminContextReadingItem[] }> {
  const response = await fetch(
    `${ADMIN_BFF_BASE}/context/recent?days=${days}`,
    { credentials: 'include', cache: 'no-store' },
  );
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  return response.json() as Promise<{ items: AdminContextReadingItem[] }>;
}

export async function patchContextReading(
  id: string,
  data: { whyText?: string; importanceRank?: number },
): Promise<AdminContextReadingItem> {
  const response = await fetch(`${ADMIN_BFF_BASE}/context/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  return response.json() as Promise<AdminContextReadingItem>;
}

export async function unpublishContextReading(
  id: string,
): Promise<AdminContextReadingItem> {
  const response = await fetch(`${ADMIN_BFF_BASE}/context/${id}/unpublish`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  return response.json() as Promise<AdminContextReadingItem>;
}

export async function rejectContextReading(
  id: string,
): Promise<AdminContextReadingItem> {
  const response = await fetch(`${ADMIN_BFF_BASE}/context/${id}/reject`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  return response.json() as Promise<AdminContextReadingItem>;
}

export async function classifyContextForWork(workId: string): Promise<unknown> {
  const response = await fetch(
    `${ADMIN_BFF_BASE}/works/${workId}/context/classify`,
    {
      method: 'POST',
      credentials: 'include',
    },
  );
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  return response.json();
}

export async function extractContextForWork(
  workId: string,
  options: { force?: boolean; async?: boolean } = {},
): Promise<unknown> {
  const response = await fetch(
    `${ADMIN_BFF_BASE}/works/${workId}/context/extract`,
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    },
  );
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  return response.json();
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

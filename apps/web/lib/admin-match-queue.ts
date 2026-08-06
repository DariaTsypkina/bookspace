import { api, noStoreConfig } from './http';
import type { AdminMatchQueueItem } from '@bookspace/schemas';

const ADMIN_BFF_BASE = '/api/admin';

export type AdminMatchQueueListParams = {
  status?: 'OPEN' | 'RESOLVED' | 'DISMISSED';
  id?: string;
};

export async function fetchAdminMatchQueue(
  params: AdminMatchQueueListParams = {},
): Promise<AdminMatchQueueItem[]> {
  const search = new URLSearchParams();
  if (params.status) {
    search.set('status', params.status);
  }
  if (params.id) {
    search.set('id', params.id);
  }
  const qs = search.toString();
  const { data } = await api.get<AdminMatchQueueItem[]>(
    `${ADMIN_BFF_BASE}/match-queue${qs ? `?${qs}` : ''}`,
    noStoreConfig,
  );
  return data;
}

export async function resolveAdminMatchQueueItem(
  id: string,
  workId: string,
): Promise<AdminMatchQueueItem> {
  const { data } = await api.post<AdminMatchQueueItem>(
    `${ADMIN_BFF_BASE}/match-queue/${encodeURIComponent(id)}/resolve`,
    { workId },
  );
  return data;
}

export async function createDraftFromMatchQueueItem(
  id: string,
): Promise<AdminMatchQueueItem> {
  const { data } = await api.post<AdminMatchQueueItem>(
    `${ADMIN_BFF_BASE}/match-queue/${encodeURIComponent(id)}/create-draft`,
    {},
  );
  return data;
}

export async function dismissAdminMatchQueueItem(
  id: string,
): Promise<AdminMatchQueueItem> {
  const { data } = await api.post<AdminMatchQueueItem>(
    `${ADMIN_BFF_BASE}/match-queue/${encodeURIComponent(id)}/dismiss`,
    {},
  );
  return data;
}

export const MATCH_QUEUE_KIND_LABELS: Record<
  AdminMatchQueueItem['kind'],
  string
> = {
  IMPORT_ROW: 'Импорт каталога',
  CONTEXT_CANDIDATE: 'Контекст',
  RANKING_ENTRY: 'Рейтинг',
};

export const MATCH_QUEUE_STATUS_LABELS: Record<
  AdminMatchQueueItem['status'],
  string
> = {
  OPEN: 'Открыт',
  RESOLVED: 'Решён',
  DISMISSED: 'Отклонён',
};

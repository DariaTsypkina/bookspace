import { api, noStoreConfig } from './http';
import type {
  AdminCreateExternalIdInput,
  AdminCreateWorkInput,
  AdminUpdateWorkInput,
} from '@bookspace/schemas';

export type AdminWorkListItem = {
  id: string;
  slug: string;
  titleRu: string;
  titleOrig: string | null;
  yearFirst: number | null;
  status: 'DRAFT' | 'PUBLISHED' | 'MERGED';
  needsContext: 'UNKNOWN' | 'YES' | 'NO';
  deletedAt: string | null;
  updatedAt: string;
  createdAt: string;
};

export type AdminExternalIdItem = {
  id: string;
  entityType: string;
  entityId: string;
  source: string;
  externalKey: string;
};

export type AdminWorkDetail = AdminWorkListItem & {
  descriptionRu: string | null;
  externalIds: AdminExternalIdItem[];
  authors: Array<{
    workId: string;
    authorId: string;
    role: string | null;
    position: number;
    author: {
      id: string;
      slug: string;
      nameRu: string;
      status: string;
      deletedAt: string | null;
    };
  }>;
  editions: Array<{
    id: string;
    workId: string;
    language: string;
    title: string | null;
  }>;
};

const ADMIN_BFF_BASE = '/api/admin';

export async function fetchAdminWorks(
  q?: string,
): Promise<AdminWorkListItem[]> {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  const qs = params.toString();
  const { data } = await api.get<AdminWorkListItem[]>(
    `${ADMIN_BFF_BASE}/works${qs ? `?${qs}` : ''}`,
    noStoreConfig,
  );
  return data;
}

export async function fetchAdminWork(workId: string): Promise<AdminWorkDetail> {
  const { data } = await api.get<AdminWorkDetail>(
    `${ADMIN_BFF_BASE}/works/${workId}`,
    noStoreConfig,
  );
  return data;
}

export async function createAdminWork(
  input: AdminCreateWorkInput,
): Promise<AdminWorkListItem> {
  const { data } = await api.post<AdminWorkListItem>(
    `${ADMIN_BFF_BASE}/works`,
    input,
  );
  return data;
}

export async function updateAdminWork(
  workId: string,
  input: AdminUpdateWorkInput,
): Promise<AdminWorkListItem> {
  const { data } = await api.patch<AdminWorkListItem>(
    `${ADMIN_BFF_BASE}/works/${workId}`,
    input,
  );
  return data;
}

export async function publishAdminWork(
  workId: string,
): Promise<AdminWorkListItem> {
  const { data } = await api.post<AdminWorkListItem>(
    `${ADMIN_BFF_BASE}/works/${workId}/publish`,
  );
  return data;
}

export async function softDeleteAdminWork(
  workId: string,
): Promise<AdminWorkListItem> {
  const { data } = await api.delete<AdminWorkListItem>(
    `${ADMIN_BFF_BASE}/works/${workId}`,
  );
  return data;
}

export async function addAdminWorkExternalId(
  workId: string,
  input: AdminCreateExternalIdInput,
): Promise<AdminExternalIdItem> {
  const { data } = await api.post<AdminExternalIdItem>(
    `${ADMIN_BFF_BASE}/works/${workId}/external-ids`,
    input,
  );
  return data;
}

export async function deleteAdminWorkExternalId(
  workId: string,
  externalId: string,
): Promise<{ ok: true }> {
  const { data } = await api.delete<{ ok: true }>(
    `${ADMIN_BFF_BASE}/works/${workId}/external-ids/${externalId}`,
  );
  return data;
}

export type AdminMergeResult = {
  canonicalId: string;
  mergedIds: string[];
};

export async function mergeAdminWorks(
  canonicalId: string,
  duplicateIds: string[],
): Promise<AdminMergeResult> {
  const { data } = await api.post<AdminMergeResult>(
    `${ADMIN_BFF_BASE}/works/merge`,
    { canonicalId, duplicateIds },
  );
  return data;
}

export function statusLabel(status: AdminWorkListItem['status']): string {
  switch (status) {
    case 'DRAFT':
      return 'Черновик';
    case 'PUBLISHED':
      return 'Опубликовано';
    case 'MERGED':
      return 'Объединено';
    default:
      return status;
  }
}

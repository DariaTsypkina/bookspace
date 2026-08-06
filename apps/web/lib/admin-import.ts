import { api, noStoreConfig } from './http';
import type {
  AdminCatalogImportReport,
  AdminCatalogImportStart,
} from '@bookspace/schemas';

const ADMIN_BFF_BASE = '/api/admin';

export type AdminImportJobStartResult = {
  jobId: string;
  status: 'queued' | 'completed';
};

export type AdminImportJobStatus = {
  jobId: string;
  status: 'queued' | 'active' | 'completed' | 'failed';
  report?: AdminCatalogImportReport;
  error?: string;
};

export async function startAdminImportJob(
  input: AdminCatalogImportStart,
): Promise<AdminImportJobStartResult> {
  const { data } = await api.post<AdminImportJobStartResult>(
    `${ADMIN_BFF_BASE}/import/jobs`,
    input,
  );
  return data;
}

export async function fetchAdminImportJob(
  jobId: string,
): Promise<AdminImportJobStatus> {
  const { data } = await api.get<AdminImportJobStatus>(
    `${ADMIN_BFF_BASE}/import/jobs/${encodeURIComponent(jobId)}`,
    noStoreConfig,
  );
  return data;
}

export function matchQueueHref(matchQueueId?: string): string {
  if (matchQueueId) {
    return `/admin/match-queue?id=${encodeURIComponent(matchQueueId)}`;
  }
  return '/admin/match-queue';
}

export const IMPORT_SOURCE_LABELS: Record<
  AdminCatalogImportStart['source'],
  string
> = {
  openlibrary: 'Open Library',
  wikidata: 'Wikidata',
  isbn_list: 'Список ISBN',
  json_upload: 'JSON upload',
};

import type {
  AdminCatalogImportReport,
  AdminCatalogImportStart,
} from '@bookspace/schemas';

export type CatalogImportExternalId = {
  source: string;
  externalKey: string;
};

export type NormalizedImportRow = {
  titleRu: string;
  titleOrig?: string;
  titleNorm: string;
  yearFirst?: number | null;
  isbn13?: string | null;
  externalIds: CatalogImportExternalId[];
  raw: unknown;
};

export type CatalogImportJobData = AdminCatalogImportStart & {
  actorUserId?: string;
};

export type CatalogImportJobResult = {
  report: AdminCatalogImportReport;
};

export type CatalogImportJobStatus =
  'queued' | 'active' | 'completed' | 'failed';

export type CatalogImportJobView = {
  jobId: string;
  status: CatalogImportJobStatus;
  report?: AdminCatalogImportReport;
  error?: string;
};

import type { WorkRelationType } from '@bookspace/schemas';
import { parseCatalogEntitySlug } from './catalog-entity-slug';
import { ApiError, api, noStoreConfig } from './http';

export type { WorkRelationType };

export interface CatalogWorkAuthor {
  slug: string;
  nameRu: string;
}

export interface CatalogWorkSeries {
  slug: string;
  nameRu: string;
  positionInSeries?: number;
}

export interface CatalogWorkEdition {
  language: string;
  translator?: string;
  isbn13?: string;
  publisher?: string;
  year?: number;
}

export interface CatalogWorkRelation {
  slug: string;
  titleRu: string;
  type: WorkRelationType;
}

export interface CatalogReadingOrderStep {
  step: number;
  slug: string;
  titleRu: string;
}

export interface CatalogWorkResponse {
  slug: string;
  titleRu: string;
  titleOrig?: string;
  yearFirst?: number;
  /** Краткое содержание / аннотация; omit if empty. */
  descriptionRu?: string;
  authors: CatalogWorkAuthor[];
  series?: CatalogWorkSeries;
  editions: CatalogWorkEdition[];
  relations: CatalogWorkRelation[];
  readingOrder: CatalogReadingOrderStep[];
}

export class CatalogWorkNotFoundError extends Error {
  constructor(slug: string) {
    super(`Work not found: ${slug}`);
    this.name = 'CatalogWorkNotFoundError';
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export async function fetchCatalogWork(
  slug: string,
): Promise<CatalogWorkResponse> {
  const safeSlug = parseCatalogEntitySlug(slug);
  const url = `${API_URL}/catalog/works/${encodeURIComponent(safeSlug)}`;
  try {
    const { data } = await api.get<CatalogWorkResponse>(url, noStoreConfig);
    return data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      throw new CatalogWorkNotFoundError(safeSlug);
    }
    if (error instanceof ApiError) {
      throw new Error(`Catalog work fetch failed: ${error.status}`);
    }
    throw error;
  }
}

export const EDITION_LANGUAGE_LABELS: Record<string, string> = {
  ru: 'Русский',
  en: 'Английский',
  de: 'Немецкий',
  fr: 'Французский',
  es: 'Испанский',
};

export function formatEditionLanguage(code: string): string {
  return EDITION_LANGUAGE_LABELS[code] ?? code.toUpperCase();
}

/** RU labels for WorkRelation.type — distinguishable on the book card. */
export const WORK_RELATION_LABELS: Record<WorkRelationType, string> = {
  SEQUEL: 'Продолжение',
  PREQUEL: 'Предыстория',
  RELATED: 'Связано',
  ADAPTATION: 'Адаптация',
};

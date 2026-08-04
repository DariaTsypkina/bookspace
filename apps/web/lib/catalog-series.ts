import { parseCatalogEntitySlug } from './catalog-entity-slug';
import { ApiError, api, noStoreConfig } from './http';

export interface CatalogReadingOrderStep {
  step: number;
  slug: string;
  titleRu: string;
}

export interface CatalogSeriesWork {
  slug: string;
  titleRu: string;
  yearFirst?: number;
  positionInSeries?: number;
}

export interface CatalogSeriesResponse {
  slug: string;
  nameRu: string;
  nameOrig?: string;
  works: CatalogSeriesWork[];
  readingOrder: CatalogReadingOrderStep[];
}

export class CatalogSeriesNotFoundError extends Error {
  constructor(slug: string) {
    super(`Series not found: ${slug}`);
    this.name = 'CatalogSeriesNotFoundError';
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export async function fetchCatalogSeries(
  slug: string,
): Promise<CatalogSeriesResponse> {
  const safeSlug = parseCatalogEntitySlug(slug);
  const url = `${API_URL}/catalog/series/${encodeURIComponent(safeSlug)}`;
  try {
    const { data } = await api.get<CatalogSeriesResponse>(url, noStoreConfig);
    return data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      throw new CatalogSeriesNotFoundError(safeSlug);
    }
    if (error instanceof ApiError) {
      throw new Error(`Catalog series fetch failed: ${error.status}`);
    }
    throw error;
  }
}

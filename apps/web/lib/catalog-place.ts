import { parseCatalogEntitySlug } from './catalog-entity-slug';
import { ApiError, api, noStoreConfig } from './http';

export interface CatalogPlaceWorld {
  slug: string;
  nameRu: string;
  nameOrig?: string;
}

export interface CatalogPlaceWork {
  slug: string;
  titleRu: string;
  yearFirst?: number;
}

export interface CatalogPlaceResponse {
  slug: string;
  nameRu: string;
  nameOrig?: string;
  world?: CatalogPlaceWorld;
  works: CatalogPlaceWork[];
}

export class CatalogPlaceNotFoundError extends Error {
  constructor(slug: string) {
    super(`Place not found: ${slug}`);
    this.name = 'CatalogPlaceNotFoundError';
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export async function fetchCatalogPlace(
  slug: string,
): Promise<CatalogPlaceResponse> {
  const safeSlug = parseCatalogEntitySlug(slug);
  const url = `${API_URL}/catalog/places/${encodeURIComponent(safeSlug)}`;
  try {
    const { data } = await api.get<CatalogPlaceResponse>(url, noStoreConfig);
    return data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      throw new CatalogPlaceNotFoundError(safeSlug);
    }
    if (error instanceof ApiError) {
      throw new Error(`Catalog place fetch failed: ${error.status}`);
    }
    throw error;
  }
}

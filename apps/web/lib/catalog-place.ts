import { parseCatalogEntitySlug } from './catalog-entity-slug';

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
  const response = await fetch(url, { cache: 'no-store' });
  if (response.status === 404) {
    throw new CatalogPlaceNotFoundError(safeSlug);
  }
  if (!response.ok) {
    throw new Error(`Catalog place fetch failed: ${response.status}`);
  }
  return response.json() as Promise<CatalogPlaceResponse>;
}

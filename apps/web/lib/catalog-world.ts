import { parseCatalogEntitySlug } from './catalog-entity-slug';

export interface CatalogWorldPlace {
  slug: string;
  nameRu: string;
  nameOrig?: string;
}

export interface CatalogWorldWork {
  slug: string;
  titleRu: string;
  yearFirst?: number;
}

export interface CatalogWorldResponse {
  slug: string;
  nameRu: string;
  nameOrig?: string;
  descriptionRu?: string;
  places: CatalogWorldPlace[];
  works: CatalogWorldWork[];
}

export class CatalogWorldNotFoundError extends Error {
  constructor(slug: string) {
    super(`World not found: ${slug}`);
    this.name = 'CatalogWorldNotFoundError';
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export async function fetchCatalogWorld(
  slug: string,
): Promise<CatalogWorldResponse> {
  const safeSlug = parseCatalogEntitySlug(slug);
  const url = `${API_URL}/catalog/worlds/${encodeURIComponent(safeSlug)}`;
  const response = await fetch(url, { cache: 'no-store' });
  if (response.status === 404) {
    throw new CatalogWorldNotFoundError(safeSlug);
  }
  if (!response.ok) {
    throw new Error(`Catalog world fetch failed: ${response.status}`);
  }
  return response.json() as Promise<CatalogWorldResponse>;
}

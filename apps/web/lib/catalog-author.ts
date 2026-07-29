import { parseCatalogEntitySlug } from './catalog-entity-slug';

export interface CatalogAuthorWork {
  slug: string;
  titleRu: string;
  yearFirst?: number;
}

export interface CatalogAuthorResponse {
  slug: string;
  nameRu: string;
  nameOrig?: string;
  works: CatalogAuthorWork[];
}

export class CatalogAuthorNotFoundError extends Error {
  constructor(slug: string) {
    super(`Author not found: ${slug}`);
    this.name = 'CatalogAuthorNotFoundError';
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export async function fetchCatalogAuthor(
  slug: string,
): Promise<CatalogAuthorResponse> {
  const safeSlug = parseCatalogEntitySlug(slug);
  const url = `${API_URL}/catalog/authors/${encodeURIComponent(safeSlug)}`;
  const response = await fetch(url, { cache: 'no-store' });
  if (response.status === 404) {
    throw new CatalogAuthorNotFoundError(safeSlug);
  }
  if (!response.ok) {
    throw new Error(`Catalog author fetch failed: ${response.status}`);
  }
  return response.json() as Promise<CatalogAuthorResponse>;
}

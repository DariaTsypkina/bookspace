import { parseCatalogEntitySlug } from './catalog-entity-slug';
import { ApiError, api, noStoreConfig } from './http';

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
  try {
    const { data } = await api.get<CatalogAuthorResponse>(url, noStoreConfig);
    return data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      throw new CatalogAuthorNotFoundError(safeSlug);
    }
    if (error instanceof ApiError) {
      throw new Error(`Catalog author fetch failed: ${error.status}`);
    }
    throw error;
  }
}

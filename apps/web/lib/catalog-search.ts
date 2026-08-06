import { ApiError, api, noStoreConfig } from './http';

export type CatalogSearchEntityType =
  'WORK' | 'AUTHOR' | 'SERIES' | 'CHARACTER' | 'WORLD' | 'PLACE';

export interface CatalogSearchResultItem {
  type: CatalogSearchEntityType;
  id: string;
  slug: string;
  title: string;
  path: string;
}

export interface CatalogSearchResponse {
  query: string;
  items: CatalogSearchResultItem[];
  hints?: string[];
}

export const CATALOG_ENTITY_TYPE_LABELS: Record<
  CatalogSearchEntityType,
  string
> = {
  WORK: 'Произведение',
  AUTHOR: 'Автор',
  SERIES: 'Серия',
  CHARACTER: 'Персонаж',
  WORLD: 'Мир',
  PLACE: 'Локация',
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export async function fetchCatalogSearch(
  query: string,
): Promise<CatalogSearchResponse> {
  const params = new URLSearchParams();
  if (query.trim()) {
    params.set('q', query.trim());
  }
  const url = `${API_URL}/catalog/search?${params.toString()}`;
  try {
    const { data } = await api.get<CatalogSearchResponse>(url, noStoreConfig);
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(`Catalog search failed: ${error.status}`);
    }
    throw error;
  }
}

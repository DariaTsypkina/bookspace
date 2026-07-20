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
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Catalog search failed: ${response.status}`);
  }
  return response.json() as Promise<CatalogSearchResponse>;
}

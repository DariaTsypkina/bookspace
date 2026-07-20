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

export const CATALOG_ENTITY_PATHS: Record<CatalogSearchEntityType, string> = {
  WORK: '/books',
  AUTHOR: '/authors',
  SERIES: '/series',
  CHARACTER: '/characters',
  WORLD: '/worlds',
  PLACE: '/places',
};

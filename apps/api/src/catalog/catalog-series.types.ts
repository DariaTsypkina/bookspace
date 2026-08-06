import type { CatalogReadingOrderStep } from './catalog-reading-order';

export type { CatalogReadingOrderStep };

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
  /** Explicit recommended reading order (numbered steps); empty if unknown. */
  readingOrder: CatalogReadingOrderStep[];
}

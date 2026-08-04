import type { WorkRelationType } from '@bookspace/schemas';

export type { WorkRelationType };

export interface CatalogWorkAuthor {
  slug: string;
  nameRu: string;
}

export interface CatalogWorkSeries {
  slug: string;
  nameRu: string;
  positionInSeries?: number;
}

export interface CatalogWorkEdition {
  language: string;
  translator?: string;
  isbn13?: string;
  publisher?: string;
  year?: number;
}

export interface CatalogWorkRelation {
  slug: string;
  titleRu: string;
  type: WorkRelationType;
}

export interface CatalogWorkResponse {
  slug: string;
  titleRu: string;
  titleOrig?: string;
  yearFirst?: number;
  authors: CatalogWorkAuthor[];
  series?: CatalogWorkSeries;
  editions: CatalogWorkEdition[];
  relations: CatalogWorkRelation[];
}

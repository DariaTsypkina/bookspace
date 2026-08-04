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
}

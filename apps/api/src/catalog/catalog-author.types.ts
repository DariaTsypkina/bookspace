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

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

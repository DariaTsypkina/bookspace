export interface CatalogPlaceWorld {
  slug: string;
  nameRu: string;
  nameOrig?: string;
}

export interface CatalogPlaceWork {
  slug: string;
  titleRu: string;
  yearFirst?: number;
}

export interface CatalogPlaceResponse {
  slug: string;
  nameRu: string;
  nameOrig?: string;
  world?: CatalogPlaceWorld;
  works: CatalogPlaceWork[];
}

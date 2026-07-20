export type CharacterRelationType = 'FRIEND' | 'ENEMY' | 'FAMILY' | 'RELATED';

export interface CatalogCharacterAppearance {
  slug: string;
  titleRu: string;
  yearFirst?: number;
}

export interface CatalogCharacterRelation {
  slug: string;
  nameRu: string;
  type: CharacterRelationType;
}

export interface CatalogCharacterResponse {
  slug: string;
  nameRu: string;
  nameOrig?: string;
  appearances: CatalogCharacterAppearance[];
  relations: CatalogCharacterRelation[];
}

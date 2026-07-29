import type { CharacterRelationType } from '@bookspace/schemas';

export type { CharacterRelationType };

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

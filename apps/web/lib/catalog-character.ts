import type { CharacterRelationType } from '@bookspace/schemas';
import { parseCatalogEntitySlug } from './catalog-entity-slug';

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

export class CatalogCharacterNotFoundError extends Error {
  constructor(slug: string) {
    super(`Character not found: ${slug}`);
    this.name = 'CatalogCharacterNotFoundError';
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export async function fetchCatalogCharacter(
  slug: string,
): Promise<CatalogCharacterResponse> {
  const safeSlug = parseCatalogEntitySlug(slug);
  const url = `${API_URL}/catalog/characters/${encodeURIComponent(safeSlug)}`;
  const response = await fetch(url, { cache: 'no-store' });
  if (response.status === 404) {
    throw new CatalogCharacterNotFoundError(safeSlug);
  }
  if (!response.ok) {
    throw new Error(`Catalog character fetch failed: ${response.status}`);
  }
  return response.json() as Promise<CatalogCharacterResponse>;
}

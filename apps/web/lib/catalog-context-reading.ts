import { parseCatalogEntitySlug } from './catalog-entity-slug';
import { api, noStoreConfig } from './http';

export interface PublicContextReadingItem {
  recommendedWork: {
    slug: string;
    titleRu: string;
  };
  importanceRank: number;
  whyText: string;
}

export interface CatalogContextReadingsResponse {
  items: PublicContextReadingItem[];
}

export const CONTEXT_READING_DISCLAIMER =
  'Список составлен автоматически на основе открытых источников.';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export async function fetchCatalogContextReadings(
  slug: string,
): Promise<CatalogContextReadingsResponse> {
  const safeSlug = parseCatalogEntitySlug(slug);
  const url = `${API_URL}/catalog/works/${encodeURIComponent(safeSlug)}/context-readings`;
  try {
    const { data } = await api.get<CatalogContextReadingsResponse>(
      url,
      noStoreConfig,
    );
    return data;
  } catch {
    return { items: [] };
  }
}

export function hasContextReadings(items: PublicContextReadingItem[]): boolean {
  return items.length > 0;
}

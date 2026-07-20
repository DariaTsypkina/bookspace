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
  const url = `${API_URL}/catalog/works/${encodeURIComponent(slug)}/context-readings`;
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    return { items: [] };
  }
  return response.json() as Promise<CatalogContextReadingsResponse>;
}

export function hasContextReadings(items: PublicContextReadingItem[]): boolean {
  return items.length > 0;
}

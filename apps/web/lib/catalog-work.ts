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

export interface CatalogWorkResponse {
  slug: string;
  titleRu: string;
  titleOrig?: string;
  yearFirst?: number;
  authors: CatalogWorkAuthor[];
  series?: CatalogWorkSeries;
  editions: CatalogWorkEdition[];
}

export class CatalogWorkNotFoundError extends Error {
  constructor(slug: string) {
    super(`Work not found: ${slug}`);
    this.name = 'CatalogWorkNotFoundError';
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export async function fetchCatalogWork(
  slug: string,
): Promise<CatalogWorkResponse> {
  const url = `${API_URL}/catalog/works/${encodeURIComponent(slug)}`;
  const response = await fetch(url, { cache: 'no-store' });
  if (response.status === 404) {
    throw new CatalogWorkNotFoundError(slug);
  }
  if (!response.ok) {
    throw new Error(`Catalog work fetch failed: ${response.status}`);
  }
  return response.json() as Promise<CatalogWorkResponse>;
}

export const EDITION_LANGUAGE_LABELS: Record<string, string> = {
  ru: 'Русский',
  en: 'Английский',
  de: 'Немецкий',
  fr: 'Французский',
  es: 'Испанский',
};

export function formatEditionLanguage(code: string): string {
  return EDITION_LANGUAGE_LABELS[code] ?? code.toUpperCase();
}

import type {
  PublicLibraryResponse,
  PublicUserBookDetail,
} from '@bookspace/schemas';
import { parseCatalogEntitySlug } from './catalog-entity-slug';
import { ApiError, api, noStoreConfig } from './http';
import { tryParseProfileSlug } from './profile-slug';

export class PublicLibraryNotFoundError extends Error {
  constructor(slug: string) {
    super(`Public library not found: ${slug}`);
    this.name = 'PublicLibraryNotFoundError';
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export async function fetchPublicLibrary(
  slug: string,
): Promise<PublicLibraryResponse> {
  const safeSlug = tryParseProfileSlug(slug);
  if (!safeSlug) {
    throw new PublicLibraryNotFoundError(slug);
  }
  const url = `${API_URL}/users/${encodeURIComponent(safeSlug)}/library`;
  try {
    const { data } = await api.get<PublicLibraryResponse>(url, noStoreConfig);
    return data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      throw new PublicLibraryNotFoundError(safeSlug);
    }
    if (error instanceof ApiError) {
      throw new Error(`Public library fetch failed: ${error.status}`);
    }
    throw error;
  }
}

export async function fetchPublicUserBook(
  slug: string,
  workSlug: string,
): Promise<PublicUserBookDetail> {
  const safeSlug = tryParseProfileSlug(slug);
  if (!safeSlug) {
    throw new PublicLibraryNotFoundError(slug);
  }
  let safeWork: string;
  try {
    safeWork = parseCatalogEntitySlug(workSlug);
  } catch {
    throw new PublicLibraryNotFoundError(`${slug}/${workSlug}`);
  }
  const url = `${API_URL}/users/${encodeURIComponent(safeSlug)}/library/works/${encodeURIComponent(safeWork)}`;
  try {
    const { data } = await api.get<PublicUserBookDetail>(url, noStoreConfig);
    return data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      throw new PublicLibraryNotFoundError(`${safeSlug}/${safeWork}`);
    }
    if (error instanceof ApiError) {
      throw new Error(`Public user book fetch failed: ${error.status}`);
    }
    throw error;
  }
}

/** Validate work slug for client PUT path (reuse catalog helper). */
export function parseWorkSlugForLibrary(slug: string): string {
  return parseCatalogEntitySlug(slug);
}

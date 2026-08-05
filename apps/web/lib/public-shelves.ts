import type {
  PublicShelfDetail,
  PublicShelvesResponse,
} from '@bookspace/schemas';
import { ApiError, api, noStoreConfig } from './http';
import { tryParseProfileSlug } from './profile-slug';

export class PublicShelvesNotFoundError extends Error {
  constructor(slug: string) {
    super(`Public shelves not found: ${slug}`);
    this.name = 'PublicShelvesNotFoundError';
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export async function fetchPublicShelves(
  slug: string,
): Promise<PublicShelvesResponse> {
  const safeSlug = tryParseProfileSlug(slug);
  if (!safeSlug) {
    throw new PublicShelvesNotFoundError(slug);
  }
  const url = `${API_URL}/users/${encodeURIComponent(safeSlug)}/shelves`;
  try {
    const { data } = await api.get<PublicShelvesResponse>(url, noStoreConfig);
    return data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      throw new PublicShelvesNotFoundError(safeSlug);
    }
    if (error instanceof ApiError) {
      throw new Error(`Public shelves fetch failed: ${error.status}`);
    }
    throw error;
  }
}

export async function fetchPublicShelf(
  userSlug: string,
  shelfSlug: string,
): Promise<PublicShelfDetail> {
  const safeUser = tryParseProfileSlug(userSlug);
  const safeShelf = tryParseProfileSlug(shelfSlug);
  if (!safeUser || !safeShelf) {
    throw new PublicShelvesNotFoundError(`${userSlug}/${shelfSlug}`);
  }
  const url = `${API_URL}/users/${encodeURIComponent(safeUser)}/shelves/${encodeURIComponent(safeShelf)}`;
  try {
    const { data } = await api.get<PublicShelfDetail>(url, noStoreConfig);
    return data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      throw new PublicShelvesNotFoundError(`${safeUser}/${safeShelf}`);
    }
    if (error instanceof ApiError) {
      throw new Error(`Public shelf fetch failed: ${error.status}`);
    }
    throw error;
  }
}

/**
 * Offline shell cache policy (bd-6b7.2).
 * Pure helpers shared by unit tests; `public/sw.js` mirrors these constants.
 */

export const OFFLINE_FALLBACK_PATH = '/offline';

export const CACHE_SHELL = 'bookspace-shell-v1';
export const CACHE_RECENT = 'bookspace-recent-v1';

/** Bounded LRU for recently opened document pages (not the whole catalog). */
export const MAX_RECENT_PAGES = 20;

/** App shell precache — no catalog entity routes. */
export const SHELL_PRECACHE_URLS = [
  '/',
  '/offline',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
] as const;

export function shouldRuntimeCacheDocument(pathname: string): boolean {
  if (!pathname.startsWith('/')) return false;
  if (pathname.startsWith('/api/')) return false;
  if (pathname.startsWith('/_next/')) return false;
  return true;
}

export function isNavigationRequest(request: {
  method?: string;
  mode?: string;
  destination?: string;
}): boolean {
  if ((request.method ?? 'GET').toUpperCase() !== 'GET') return false;
  return request.mode === 'navigate' || request.destination === 'document';
}

/**
 * Move `url` to the front of the LRU list and truncate to `max`.
 */
export function touchRecentLru(
  urls: string[],
  url: string,
  max: number = MAX_RECENT_PAGES,
): string[] {
  const next = [url, ...urls.filter((entry) => entry !== url)];
  return next.slice(0, Math.max(0, max));
}

export function urlsToEvict(previous: string[], next: string[]): string[] {
  const keep = new Set(next);
  return previous.filter((url) => !keep.has(url));
}

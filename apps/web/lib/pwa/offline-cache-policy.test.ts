import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  CACHE_RECENT,
  CACHE_SHELL,
  MAX_RECENT_PAGES,
  OFFLINE_FALLBACK_PATH,
  SHELL_PRECACHE_URLS,
  isNavigationRequest,
  shouldRuntimeCacheDocument,
  touchRecentLru,
  urlsToEvict,
} from './offline-cache-policy';

describe('PWA offline cache policy (bd-6b7.2)', () => {
  it('defines offline fallback and bounded recent cache', () => {
    expect(OFFLINE_FALLBACK_PATH).toBe('/offline');
    expect(MAX_RECENT_PAGES).toBeGreaterThan(0);
    expect(MAX_RECENT_PAGES).toBeLessThanOrEqual(30);
    expect(CACHE_SHELL).toMatch(/^bookspace-shell-/);
    expect(CACHE_RECENT).toMatch(/^bookspace-recent-/);
  });

  it('precache shell does not include whole catalog routes', () => {
    expect(SHELL_PRECACHE_URLS).toContain('/');
    expect(SHELL_PRECACHE_URLS).toContain('/offline');
    expect(SHELL_PRECACHE_URLS).not.toContain('/books');
    expect(SHELL_PRECACHE_URLS).not.toContain('/authors');
    expect(
      SHELL_PRECACHE_URLS.every(
        (url) =>
          !url.startsWith('/books/') &&
          !url.startsWith('/authors/') &&
          !url.startsWith('/characters/') &&
          !url.startsWith('/worlds/') &&
          !url.startsWith('/places/'),
      ),
    ).toBe(true);
  });

  it('runtime-caches document pages but not API or Next internals', () => {
    expect(shouldRuntimeCacheDocument('/')).toBe(true);
    expect(shouldRuntimeCacheDocument('/search')).toBe(true);
    expect(shouldRuntimeCacheDocument('/books/harry-potter')).toBe(true);
    expect(shouldRuntimeCacheDocument('/offline')).toBe(true);
    expect(shouldRuntimeCacheDocument('/api/auth/session')).toBe(false);
    expect(shouldRuntimeCacheDocument('/_next/static/chunk.js')).toBe(false);
  });

  it('detects navigation requests for document fetches', () => {
    expect(
      isNavigationRequest({
        method: 'GET',
        mode: 'navigate',
        destination: 'document',
      }),
    ).toBe(true);
    expect(
      isNavigationRequest({
        method: 'POST',
        mode: 'navigate',
        destination: 'document',
      }),
    ).toBe(false);
    expect(
      isNavigationRequest({
        method: 'GET',
        mode: 'cors',
        destination: 'script',
      }),
    ).toBe(false);
  });

  it('LRU touch keeps newest first and evicts overflow', () => {
    const first = touchRecentLru([], 'https://example.com/a', 3);
    expect(first).toEqual(['https://example.com/a']);

    const second = touchRecentLru(first, 'https://example.com/b', 3);
    expect(second).toEqual(['https://example.com/b', 'https://example.com/a']);

    const bumped = touchRecentLru(second, 'https://example.com/a', 3);
    expect(bumped).toEqual(['https://example.com/a', 'https://example.com/b']);

    const overflow = touchRecentLru(
      [
        'https://example.com/c',
        'https://example.com/b',
        'https://example.com/a',
      ],
      'https://example.com/d',
      3,
    );
    expect(overflow).toEqual([
      'https://example.com/d',
      'https://example.com/c',
      'https://example.com/b',
    ]);
    expect(
      urlsToEvict(
        [
          'https://example.com/c',
          'https://example.com/b',
          'https://example.com/a',
        ],
        overflow,
      ),
    ).toEqual(['https://example.com/a']);
  });

  it('service worker script encodes the same offline policy constants', () => {
    const swPath = join(__dirname, '../../public/sw.js');
    const swSource = readFileSync(swPath, 'utf8');
    expect(swSource).toContain(CACHE_SHELL);
    expect(swSource).toContain(CACHE_RECENT);
    expect(swSource).toContain(`'${OFFLINE_FALLBACK_PATH}'`);
    expect(swSource).toContain(String(MAX_RECENT_PAGES));
    expect(swSource).toContain("'/offline'");
    expect(swSource).not.toMatch(/precache.*\/books/i);
  });
});

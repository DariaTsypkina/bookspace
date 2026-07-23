/* Bookspace PWA offline shell (bd-6b7.2) — native SW, no workbox/serwist. */
/* Constants mirrored from apps/web/lib/pwa/offline-cache-policy.ts */

const CACHE_SHELL = 'bookspace-shell-v1';
const CACHE_RECENT = 'bookspace-recent-v1';
const OFFLINE_FALLBACK_PATH = '/offline';
const MAX_RECENT_PAGES = 20;

const SHELL_PRECACHE_URLS = [
  '/',
  '/offline',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_SHELL);
      await cache.addAll(SHELL_PRECACHE_URLS);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([CACHE_SHELL, CACHE_RECENT]);
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => !keep.has(key)).map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

function isNavigationRequest(request) {
  if (request.method !== 'GET') return false;
  return request.mode === 'navigate' || request.destination === 'document';
}

function shouldRuntimeCacheDocument(pathname) {
  if (!pathname.startsWith('/')) return false;
  if (pathname.startsWith('/api/')) return false;
  if (pathname.startsWith('/_next/')) return false;
  return true;
}

function shouldCacheStaticAsset(pathname) {
  return (
    pathname.startsWith('/_next/static/') ||
    pathname.startsWith('/icons/') ||
    pathname === '/manifest.webmanifest'
  );
}

async function putRecentDocument(request, response) {
  const url = new URL(request.url);
  if (!shouldRuntimeCacheDocument(url.pathname)) return;
  if (!response || !response.ok) return;

  const cache = await caches.open(CACHE_RECENT);
  await cache.put(request, response.clone());

  const keys = await cache.keys();
  if (keys.length <= MAX_RECENT_PAGES) return;

  // Evict oldest (Cache Storage order is insertion order; delete from start).
  const overflow = keys.length - MAX_RECENT_PAGES;
  for (let i = 0; i < overflow; i += 1) {
    await cache.delete(keys[i]);
  }
}

async function networkFirstNavigation(request) {
  try {
    const response = await fetch(request);
    await putRecentDocument(request, response);
    return response;
  } catch {
    const cached =
      (await caches.match(request)) ||
      (await caches.match(request, { cacheName: CACHE_RECENT })) ||
      (await caches.match(request, { cacheName: CACHE_SHELL }));
    if (cached) return cached;

    const offline =
      (await caches.match(OFFLINE_FALLBACK_PATH)) ||
      (await caches.match(new Request(OFFLINE_FALLBACK_PATH)));
    if (offline) return offline;

    return new Response('Нет сети', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}

async function cacheFirstAsset(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(CACHE_SHELL);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    return (
      (await caches.match(request)) ||
      new Response('', { status: 504, statusText: 'Offline' })
    );
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isNavigationRequest(request)) {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (shouldCacheStaticAsset(url.pathname)) {
    event.respondWith(cacheFirstAsset(request));
  }
});

/**
 * Streakz Service Worker
 * Strategy:
 *  - App Shell / pages: Cache-first with network fallback
 *  - API calls: Network-first; fall back to cached response
 *  - Static assets (JS/CSS/fonts): Stale-while-revalidate
 */

const CACHE_NAME = 'streakz-v1';
const OFFLINE_PAGE = '/offline.html';

// Core shell URLs to pre-cache on install
const PRECACHE_URLS = [
  '/',
  '/dashboard',
  '/dashboard/journal',
  '/dashboard/goals',
  '/dashboard/analytics',
  '/dashboard/heatmap',
  '/dashboard/settings',
  '/dashboard/ai-coach',
  OFFLINE_PAGE,
  '/manifest.json',
];

// ── Install: pre-cache shell ──────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // addAll fails silently on individual 404s via allSettled pattern
      Promise.allSettled(PRECACHE_URLS.map((url) => cache.add(url)))
    )
  );
  self.skipWaiting();
});

// ── Activate: clean old caches ────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, chrome-extension, and cross-origin requests we don't cache
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // API calls: network-first, fall back to cached response
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstAPI(request));
    return;
  }

  // Google Fonts: stale-while-revalidate
  if (
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com'
  ) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Next.js static chunks / CSS: stale-while-revalidate
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/_next/image/')
  ) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Navigation requests (HTML pages): cache-first with network fallback
  if (request.mode === 'navigate') {
    event.respondWith(navigationHandler(request));
    return;
  }

  // Everything else: cache-first
  event.respondWith(cacheFirst(request));
});

// ── Strategy: network-first (for API) ────────────────────────────────────────
async function networkFirstAPI(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached ?? new Response(
      JSON.stringify({ error: 'Offline', offline: true }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// ── Strategy: stale-while-revalidate ─────────────────────────────────────────
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);
  return cached ?? (await fetchPromise) ?? new Response('', { status: 503 });
}

// ── Strategy: cache-first ────────────────────────────────────────────────────
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return new Response('', { status: 503 });
  }
}

// ── Strategy: navigation (page) handler ──────────────────────────────────────
async function navigationHandler(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    // Try the exact URL first, then the shell /dashboard, then offline page
    const cached =
      (await cache.match(request)) ||
      (await cache.match('/dashboard')) ||
      (await cache.match(OFFLINE_PAGE));
    return cached ?? new Response('App is offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
  }
}

// ── Background Sync: receive sync-queue flush messages ───────────────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

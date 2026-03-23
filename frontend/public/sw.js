// Clinical Edge Copilot — Service Worker
// Strategy: network-first for all static assets, never cache API calls.
// Keeps the app installable and provides a basic offline shell fallback.

const CACHE_NAME = 'cec-static-v1';

// Core shell files to precache on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
];

// ── Install ────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate ───────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch ──────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never intercept non-GET requests
  if (request.method !== 'GET') return;

  // Never intercept API calls — always hit the network
  if (url.pathname.startsWith('/api/')) return;

  // Never intercept cross-origin requests (fonts, CDN, etc.)
  if (url.origin !== self.location.origin) return;

  // Network-first strategy: try the network, fall back to cache
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        // Cache a copy of successful same-origin responses
        if (networkResponse.ok) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        }
        return networkResponse;
      })
      .catch(() => {
        // Network failed — serve from cache if available
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          // Last resort: return the cached index.html for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
        });
      })
  );
});

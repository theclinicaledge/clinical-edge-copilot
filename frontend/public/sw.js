// Clinical Edge Copilot — Service Worker
// Strategy:
//   - Cache-first for Vite hashed bundles (/assets/*) — immutable per hash, safe to serve from cache forever.
//   - Network-first for everything else (HTML shell, icons, manifest).
//   - API calls (/api/*) and cross-origin requests are never intercepted.
// Bump CACHE_NAME on each production deploy to evict stale shells.

const CACHE_NAME = 'cec-static-v2';

// ── Install ────────────────────────────────────────────────────────────────
// Fetch the HTML shell, discover every hashed Vite bundle referenced in it,
// and cache them all in one pass. This guarantees the app can cold-start
// offline after any single online session — no second visit required.
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        // Fetch live shell HTML
        const res = await fetch('/');
        const html = await res.text();

        // Cache shell under both URL keys the app and SW fallback use
        const makeHtml = () => new Response(html, {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
        await cache.put('/', makeHtml());
        await cache.put('/index.html', makeHtml());

        // Extract every /assets/... URL (js, css, woff2, png, etc.) from the HTML
        const assetUrls = [
          ...new Set(
            [...html.matchAll(/\/assets\/[^\s"'<>?#]+/g)].map(m => m[0])
          ),
        ];
        if (assetUrls.length) {
          await cache.addAll(assetUrls);
        }
      } catch {
        // Network unavailable at install time (edge case) — cache shell only;
        // assets will be picked up on first online load via cache-first handler.
        await cache.addAll(['/', '/index.html']);
      }
      self.skipWaiting();
    })()
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

  // Cache-first for Vite hashed bundles — content-addressed, never stale
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Network-first for HTML shell, icons, manifest — fall back to cache offline
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse.ok) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
        });
      })
  );
});

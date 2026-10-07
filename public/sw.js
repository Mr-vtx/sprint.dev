/**
 * Sprint.dev Service Worker v5
 *
 * What this caches:
 *   Shell    — all app HTML/JS/CSS/fonts (Cache First)
 *   Thumbs   — YouTube thumbnails (Cache First, 7 days)
 *   Pages    — course + roadmap pages (Stale-while-revalidate)
 *
 * What it does NOT cache:
 *   Video bytes — handled by useVideoCache (IndexedDB, device storage)
 *   This separation keeps the SW lean and predictable.
 */

const SHELL_V = "vs-shell-v5";
const THUMB_V = "vs-thumb-v5";
const CACHES = [SHELL_V, THUMB_V];

const PRECACHE = ["/", "/courses", "/roadmaps", "/progress", "/manifest.json"];

// Install — precache the app shell
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(SHELL_V)
      .then((c) => c.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

// Activate — remove old caches
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => !CACHES.includes(k)).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Fetch
// Pages the client asks us to cache so they open offline (courses, roadmaps)
self.addEventListener("message", (e) => {
  if (e.data?.type !== "CACHE_URLS") return;
  e.waitUntil(
    caches.open(SHELL_V).then((c) =>
      Promise.all(
        e.data.urls.map((u) =>
          c.match(u).then((hit) => hit || c.add(u).catch(() => {})),
        ),
      ),
    ),
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;

  // YouTube thumbnails — cache first, 7-day TTL
  if (url.hostname === "img.youtube.com" || url.hostname === "i.ytimg.com") {
    e.respondWith(cacheFirst(e.request, THUMB_V, 60 * 60 * 24 * 7));
    return;
  }

  // Cross-origin: skip (don't cache CDN, fonts etc randomly)
  if (url.origin !== self.location.origin) return;

  // Admin and API responses are session-dependent: never cache them.
  if (url.pathname === "/admin" || url.pathname.startsWith("/admin/") || url.pathname.startsWith("/api/")) return;

  // Next.js static chunks — immutable, cache first
  if (url.pathname.startsWith("/_next/static/")) {
    e.respondWith(cacheFirst(e.request, SHELL_V));
    return;
  }

  // App pages — stale-while-revalidate
  if (!url.pathname.startsWith("/api/")) {
    e.respondWith(swr(e.request, SHELL_V));
    return;
  }
});

async function cacheFirst(req, cacheName, maxAge) {
  const c = await caches.open(cacheName);
  const hit = await c.match(req);
  if (hit) {
    if (maxAge) {
      const ts = hit.headers.get("x-sw-ts");
      if (!ts || Date.now() - +ts > maxAge * 1000) {
        fetch(req).then((r) => r.ok && stamp(c, req, r));
      }
    }
    return hit;
  }
  const res = await fetch(req);
  if (res.ok) stamp(c, req, res.clone());
  return res;
}

async function swr(req, cacheName) {
  const c = await caches.open(cacheName);
  const hit = await c.match(req);
  const net = fetch(req)
    .then((r) => {
      if (r.ok) stamp(c, req, r.clone());
      return r;
    })
    .catch(() => null);
  const fresh = hit ?? (await net);
  if (fresh) return fresh;
  // Offline and never visited: fall back to the cached home page for navigations
  if (req.mode === "navigate") {
    const home = await c.match("/");
    if (home) return home;
  }
  return new Response("You are offline and this page has not been opened yet.", {
    status: 503,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

async function stamp(cache, req, res) {
  const h = new Headers(res.headers);
  h.set("x-sw-ts", String(Date.now()));
  cache.put(
    req,
    new Response(await res.blob(), { status: res.status, headers: h }),
  );
}

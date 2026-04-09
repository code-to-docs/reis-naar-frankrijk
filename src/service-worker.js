import { build, files, version } from '$service-worker';

const CACHE_VERSION = `reis-v2-${version}`;
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

// Bestanden die altijd gecached worden
const PRECACHE_URLS = [
  ...build,
  ...files
];

const MAX_RUNTIME = 50;
const MAX_IMAGES = 80;
const OFFLINE_FALLBACKS = ["/", "/index.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => !key.startsWith(`reis-v2-${version}`))
            .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (event.request.method !== "GET") return;
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  // Altijd online
  if (url.hostname.includes("googleapis.com") || url.hostname.includes("firebaseio.com")) return;

  // Images cache-first
  if (url.hostname.includes("wikipedia.org") || url.hostname.includes("wikimedia.org")) {
    event.respondWith(cacheFirst(event.request, IMAGE_CACHE, MAX_IMAGES));
    return;
  }

  // APIs network-first
  if (url.hostname.includes("open-meteo.com") || url.hostname.includes("openstreetmap.org")) {
    event.respondWith(networkFirst(event.request, RUNTIME_CACHE, MAX_RUNTIME));
    return;
  }

  // Same-origin APIs should stay fresh, with offline fallback from runtime cache.
  if (url.origin === self.location.origin && url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(event.request, RUNTIME_CACHE, MAX_RUNTIME));
    return;
  }

  // Same origin (App shell + assets)
  if (url.origin === self.location.origin) {
    if (event.request.mode === "navigate" || event.request.destination === "document") {
      event.respondWith(networkFirst(event.request, RUNTIME_CACHE, 10, true));
    } else {
      event.respondWith(cacheFirst(event.request, STATIC_CACHE));
    }
    return;
  }
});

async function cacheFirst(request, cacheName, maxItems) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
      if (maxItems) await trimCache(cacheName, maxItems);
    }
    return response;
  } catch (e) {
    if (request.destination === "document") return getOfflineDocument();
    return new Response("Offline", { status: 503 });
  }
}

async function networkFirst(request, cacheName, maxItems, isDocument = false) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
      if (maxItems) await trimCache(cacheName, maxItems);
    }
    return response;
  } catch (e) {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (isDocument || request.destination === "document") {
      const fallbackDoc = await getOfflineDocument();
      if (fallbackDoc) return fallbackDoc;
    }
    return new Response("Offline", { status: 503 });
  }
}

async function getOfflineDocument() {
  for (const candidate of OFFLINE_FALLBACKS) {
    const match = await caches.match(candidate);
    if (match) return match;
  }
  return null;
}

async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  let keys = await cache.keys();
  while (keys.length > maxItems) {
    await cache.delete(keys[0]);
    keys = await cache.keys();
  }
}

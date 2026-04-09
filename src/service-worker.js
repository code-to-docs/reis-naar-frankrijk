import { build, files, version } from '$service-worker';

const CACHE_VERSION = `reis-v2-${version}`;
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

// Bestanden die altijd gecached worden
const PRECACHE_URLS = [
  "/",
  ...build,
  ...files
];

const MAX_RUNTIME = 50;
const MAX_IMAGES = 80;

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

  // Same origin (App shell + assets)
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(event.request, STATIC_CACHE));
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
      if (maxItems) trimCache(cacheName, maxItems);
    }
    return response;
  } catch (e) {
    if (request.destination === "document") return caches.match("/");
    return new Response("Offline", { status: 503 });
  }
}

async function networkFirst(request, cacheName, maxItems) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
      if (maxItems) trimCache(cacheName, maxItems);
    }
    return response;
  } catch (e) {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response("Offline", { status: 503 });
  }
}

async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    trimCache(cacheName, maxItems);
  }
}

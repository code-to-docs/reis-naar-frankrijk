const CACHE_VERSION = "reis-v2";
const STATIC_CACHE = CACHE_VERSION + "-static";
const RUNTIME_CACHE = CACHE_VERSION + "-runtime";
const IMAGE_CACHE = CACHE_VERSION + "-images";

// Bestanden die altijd gecached worden bij installatie
const PRECACHE_URLS = [
  "/",
  "/manifest.json"
];

// Max items in runtime/image caches
const MAX_RUNTIME = 50;
const MAX_IMAGES = 80;

// === INSTALL ===
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// === ACTIVATE: oude caches opruimen ===
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => !key.startsWith(CACHE_VERSION))
            .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// === FETCH STRATEGIES ===
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  // Skip Firestore/Firebase requests (altijd online)
  if (url.hostname.includes("googleapis.com") ||
      url.hostname.includes("firebaseio.com")) return;

  // Wikipedia images: Cache-first (lang geldig)
  if (url.hostname.includes("wikipedia.org") ||
      url.hostname.includes("wikimedia.org")) {
    event.respondWith(cacheFirst(event.request, IMAGE_CACHE, MAX_IMAGES));
    return;
  }

  // API calls (weer, geocoding): Network-first met cache fallback
  if (url.hostname.includes("open-meteo.com") ||
      url.hostname.includes("openstreetmap.org")) {
    event.respondWith(networkFirst(event.request, RUNTIME_CACHE, MAX_RUNTIME));
    return;
  }

  // App shell & assets: Cache-first, dan netwerk
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(event.request, STATIC_CACHE));
    return;
  }
});

// === CACHE STRATEGIES ===

// Cache-first: kijk eerst in cache, dan netwerk
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
    // Offline en niet in cache
    if (request.destination === "document") {
      return caches.match("/");
    }
    return new Response("Offline", { status: 503 });
  }
}

// Network-first: probeer netwerk, val terug op cache
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

// Cache trimmen: verwijder oudste items als limiet bereikt
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    trimCache(cacheName, maxItems);
  }
}
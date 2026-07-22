const CACHE_NAME = "nexora-role-apps-v6";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        cache.addAll([
          OFFLINE_URL,
          "/icon-192.png",
          "/icon-512.png",
          "/customer-pwa-icon-192.png",
          "/customer-pwa-icon-512.png",
          "/nexora-final-logo.jpg",
          "/customer-pwa-splash.jpg",
        ]),
      ),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))),
      ),
  );
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || event.request.mode !== "navigate") return;
  event.respondWith(
    fetch(event.request).catch(async () => {
      const cached = await caches.match(OFFLINE_URL);
      return cached || Response.error();
    }),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

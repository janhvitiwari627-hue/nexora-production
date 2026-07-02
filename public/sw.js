/* Kill-switch service worker.
 * The Nexora public website is no longer installable as a PWA. Returning
 * visitors whose browser cached the previous customer-app service worker
 * receive this replacement at the same /sw.js path. It unregisters itself
 * on activation and evicts the old caches so the site is served straight
 * from the network again.
 */
function isNexoraAppCache(name) {
  return typeof name === "string" && name.startsWith("nexora-");
}

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        await Promise.allSettled(
          cacheNames.filter(isNexoraAppCache).map((n) => caches.delete(n)),
        );
        await self.clients.claim();
        const windowClients = await self.clients.matchAll({ type: "window" });
        await Promise.allSettled(
          windowClients.map((client) => client.navigate(client.url)),
        );
      } finally {
        await self.registration.unregister();
      }
    })(),
  );
});

// Pass every fetch through to the network — no caching, no interception.
self.addEventListener("fetch", () => {});

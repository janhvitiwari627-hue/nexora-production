/* Nexora SalonOS service worker — controlled update flow.
 * Strategy:
 *   - Precache offline fallback + core icons on install.
 *   - Manifest is ALWAYS network-first (never stale start_url / theme).
 *   - Navigation requests: network-first, fall back to /offline.html.
 *   - Same-origin static assets (JS/CSS/img/font): stale-while-revalidate.
 *   - skipWaiting only when the page explicitly asks (user-approved refresh),
 *     so we never force-reload mid-session with a stale mismatch.
 */
const VERSION = "nexora-v3";
const PRECACHE = `${VERSION}-precache`;
const RUNTIME = `${VERSION}-runtime`;
const PAGES = `${VERSION}-pages`;

const PRECACHE_URLS = [
  "/offline.html",
  "/icon-192.png",
  "/icon-512.png",
];

self.addEventListener("install", (event) => {
  // Do NOT skipWaiting automatically — wait for the client to approve.
  event.waitUntil((async () => {
    const precache = await caches.open(PRECACHE);
    await precache.addAll(PRECACHE_URLS);
    // Warm the pages cache with the customer home shell so it survives offline.
    try {
      const pages = await caches.open(PAGES);
      const res = await fetch("/customer/home", { credentials: "same-origin" });
      if (res && res.status === 200) await pages.put("/customer/home", res.clone());
    } catch {}
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith("nexora-") && k !== PRECACHE && k !== RUNTIME && k !== PAGES)
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("message", (event) => {
  const data = event.data;
  if (data === "SKIP_WAITING" || data?.type === "SKIP_WAITING") self.skipWaiting();
});

function isSameOrigin(url) {
  try { return new URL(url).origin === self.location.origin; } catch { return false; }
}

function isManifestRequest(url) {
  return url.pathname === "/manifest.webmanifest" || url.pathname === "/manifest.json";
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (!isSameOrigin(request.url)) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/") || url.pathname.startsWith("/_")) return;

  // Manifest — always network-first, never serve a stale start_url / theme.
  if (isManifestRequest(url)) {
    event.respondWith(
      fetch(request, { cache: "no-store" }).catch(() =>
        caches.match(request).then((c) => c || new Response("{}", { headers: { "Content-Type": "application/manifest+json" } }))
      )
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        const pages = await caches.open(PAGES);
        try {
          const fresh = await fetch(request);
          if (fresh && fresh.status === 200 && fresh.type === "basic") {
            pages.put(request, fresh.clone()).catch(() => {});
          }
          return fresh;
        } catch {
          const cachedPage = await pages.match(request, { ignoreSearch: true });
          if (cachedPage) return cachedPage;
          const precache = await caches.open(PRECACHE);
          const offline = await precache.match("/offline.html");
          return offline || new Response("Offline", { status: 503, statusText: "Offline" });
        }
      })()
    );
    return;
  }

  const dest = request.destination;
  if (["style", "script", "image", "font"].includes(dest)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(RUNTIME);
        const cached = await cache.match(request);
        const networkFetch = fetch(request)
          .then((response) => {
            if (response && response.status === 200 && response.type === "basic") {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => cached);
        return cached || networkFetch;
      })()
    );
  }
});

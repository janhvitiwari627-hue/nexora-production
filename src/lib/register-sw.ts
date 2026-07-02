import { isPreviewOrDev } from "./pwa-guards";

/**
 * Register the Nexora service worker.
 * Guarded so it NEVER runs in Lovable preview, dev, or iframes.
 * In refused contexts, actively unregister any stale /sw.js registration.
 *
 * Adds periodic update checks so a new SW is detected without a hard refresh.
 */
export function registerServiceWorker() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  if (isPreviewOrDev()) {
    navigator.serviceWorker
      .getRegistrations?.()
      .then((regs) => {
        regs.forEach((reg) => {
          if (reg.active?.scriptURL?.endsWith("/sw.js")) reg.unregister();
        });
      })
      .catch(() => {});
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        // Poll for updates every 60s — cheap HEAD to /sw.js; browser dedupes.
        const poll = () => reg.update().catch(() => {});
        const interval = window.setInterval(poll, 60_000);

        // Also check when the tab regains focus / comes online.
        const onVisible = () => {
          if (document.visibilityState === "visible") poll();
        };
        document.addEventListener("visibilitychange", onVisible);
        window.addEventListener("online", poll);

        window.addEventListener("beforeunload", () => {
          window.clearInterval(interval);
          document.removeEventListener("visibilitychange", onVisible);
          window.removeEventListener("online", poll);
        });
      })
      .catch((err) => {
        console.warn("[nexora] SW registration failed:", err);
      });
  });
}

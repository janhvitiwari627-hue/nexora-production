import { isPreviewOrDev } from "./pwa-guards";

/**
 * Register the Nexora service worker.
 * Guarded so it NEVER runs in Lovable preview, dev, or iframes.
 * In refused contexts, actively unregister any stale /sw.js registration.
 */
export function registerServiceWorker() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  if (isPreviewOrDev()) {
    // Cleanup: unregister any stale SW so preview never serves cached shells.
    navigator.serviceWorker.getRegistrations?.().then((regs) => {
      regs.forEach((reg) => {
        if (reg.active?.scriptURL?.endsWith("/sw.js")) reg.unregister();
      });
    }).catch(() => {});
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch((err) => {
        // Non-fatal — app works without SW.
        console.warn("[nexora] SW registration failed:", err);
      });
  });
}

import { useEffect } from "react";
import { toast } from "sonner";
import { isPreviewOrDev } from "@/lib/pwa-guards";

/**
 * Watches for a waiting service worker (new version installed) and prompts
 * the user to reload. Disabled in preview/dev environments.
 */
export function ServiceWorkerUpdatePrompt() {
  useEffect(() => {
    if (typeof window === "undefined" || isPreviewOrDev()) return;
    if (!("serviceWorker" in navigator)) return;

    const showPrompt = (reg: ServiceWorkerRegistration) => {
      toast("New version available", {
        description: "Refresh to update.",
        action: {
          label: "Refresh",
          onClick: () => {
            reg.waiting?.postMessage({ type: "SKIP_WAITING" });
            window.location.reload();
          },
        },
        duration: Infinity,
      });
    };

    navigator.serviceWorker.getRegistration().then(reg => {
      if (!reg) return;
      if (reg.waiting) showPrompt(reg);
      reg.addEventListener("updatefound", () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener("statechange", () => {
          if (nw.state === "installed" && navigator.serviceWorker.controller) showPrompt(reg);
        });
      });
    });

    let reloaded = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    });
  }, []);

  return null;
}

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { isPreviewOrDev } from "@/lib/pwa-guards";

/**
 * Update flow:
 *   1. New SW installs and enters "waiting" — we show a toast.
 *   2. Reload happens ONLY after the user clicks Refresh:
 *        - we postMessage SKIP_WAITING to the waiting worker
 *        - it activates, fires controllerchange
 *        - we reload once (guarded flag) so the new manifest/start_url loads
 *   3. If no waiting worker exists (first install, or activated in another tab),
 *      we never force a reload — controllerchange without user opt-in is ignored.
 */
export function ServiceWorkerUpdatePrompt() {
  const userApprovedRef = useRef(false);
  const toastShownRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || isPreviewOrDev()) return;
    if (!("serviceWorker" in navigator)) return;

    const showPrompt = (reg: ServiceWorkerRegistration) => {
      if (toastShownRef.current) return;
      toastShownRef.current = true;
      toast("New version available", {
        id: "sw-update",
        description: "Refresh to get the latest Nexora update.",
        action: {
          label: "Refresh",
          onClick: () => {
            userApprovedRef.current = true;
            reg.waiting?.postMessage({ type: "SKIP_WAITING" });
            // Fallback: if controllerchange doesn't fire within 3s, reload anyway.
            window.setTimeout(() => {
              if (userApprovedRef.current) window.location.reload();
            }, 3000);
          },
        },
        duration: Infinity,
      });
    };

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return;
      if (reg.waiting && navigator.serviceWorker.controller) showPrompt(reg);
      reg.addEventListener("updatefound", () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener("statechange", () => {
          if (nw.state === "installed" && navigator.serviceWorker.controller) {
            showPrompt(reg);
          }
        });
      });
    });

    let reloaded = false;
    const onControllerChange = () => {
      if (reloaded) return;
      // Only reload when the user explicitly approved the refresh.
      if (!userApprovedRef.current) return;
      reloaded = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  return null;
}

import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { activateRoleManifest, appKindForPath } from "@/lib/role-pwa";

export function RolePwaManager() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    activateRoleManifest(appKindForPath(pathname));
  }, [pathname]);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    let reloading = false;
    let registration: ServiceWorkerRegistration | null = null;

    const reloadWithLatestVersion = () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    };
    const checkForUpdate = () => {
      if (document.visibilityState === "visible") void registration?.update();
    };

    navigator.serviceWorker.addEventListener("controllerchange", reloadWithLatestVersion);
    void navigator.serviceWorker
      .register("/pwa-sw.js", { scope: "/", updateViaCache: "none" })
      .then((result) => {
        registration = result;
        if (result.waiting) result.waiting.postMessage({ type: "SKIP_WAITING" });
        result.addEventListener("updatefound", () => {
          const worker = result.installing;
          worker?.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              worker.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });
      })
      .catch(() => {
        // The website remains usable when service workers are blocked by the browser.
      });

    const updateTimer = window.setInterval(checkForUpdate, 30 * 60 * 1000);
    window.addEventListener("focus", checkForUpdate);
    document.addEventListener("visibilitychange", checkForUpdate);
    return () => {
      window.clearInterval(updateTimer);
      window.removeEventListener("focus", checkForUpdate);
      document.removeEventListener("visibilitychange", checkForUpdate);
      navigator.serviceWorker.removeEventListener("controllerchange", reloadWithLatestVersion);
    };
  }, []);

  return null;
}

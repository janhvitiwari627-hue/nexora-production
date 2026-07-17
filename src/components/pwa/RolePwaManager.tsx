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
    void navigator.serviceWorker
      .register("/pwa-sw.js", { scope: "/" })
      .then((registration) => {
        if (registration.waiting) registration.waiting.postMessage({ type: "SKIP_WAITING" });
        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
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
  }, []);

  return null;
}

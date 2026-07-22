import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { activateRoleManifest, appKindForPath } from "@/lib/role-pwa";
import { initializePwaInstall } from "@/lib/pwa-install";

const PWA_RELEASE = "2026-07-22-launcher-install-v4";
const PWA_RELEASE_KEY = "nexora:pwa-release";
const PWA_WORKER_URL = `/pwa-sw.js?release=${encodeURIComponent(PWA_RELEASE)}`;

function isLegacyWorker(registration: ServiceWorkerRegistration) {
  return [registration.active, registration.waiting, registration.installing].some((worker) => {
    if (!worker) return false;
    const pathname = new URL(worker.scriptURL).pathname;
    return pathname === "/sw.js";
  });
}

export function RolePwaManager() {
  initializePwaInstall();
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

    const registerLatestWorker = async () => {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations
          .filter(isLegacyWorker)
          .map((legacyRegistration) => legacyRegistration.unregister()),
      );

      const result = await navigator.serviceWorker.register(PWA_WORKER_URL, {
        scope: "/",
        updateViaCache: "none",
      });
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
      await result.update();

      if (window.localStorage.getItem(PWA_RELEASE_KEY) !== PWA_RELEASE) {
        window.localStorage.setItem(PWA_RELEASE_KEY, PWA_RELEASE);
        const url = new URL(window.location.href);
        if (url.searchParams.get("pwa_release") !== PWA_RELEASE) {
          url.searchParams.set("pwa_release", PWA_RELEASE);
          window.location.replace(url.toString());
        }
      }
    };

    navigator.serviceWorker.addEventListener("controllerchange", reloadWithLatestVersion);
    void registerLatestWorker().catch(() => {
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

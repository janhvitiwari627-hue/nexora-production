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
    void navigator.serviceWorker.register("/pwa-sw.js", { scope: "/" });
  }, []);

  return null;
}

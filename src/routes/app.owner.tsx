import { createFileRoute } from "@tanstack/react-router";
import { OwnerAppShell } from "@/pages/owner/app/OwnerAppShell";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute("/app/owner")({
  ssr: false,
  beforeLoad: ({ location }) =>
    requireRole(["owner", "shop_owner", "shop_manager", "admin"], location.pathname),
  component: OwnerAppShell,
});

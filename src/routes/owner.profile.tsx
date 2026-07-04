import { createFileRoute, redirect } from "@tanstack/react-router";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute("/owner/profile")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    await requireRole(["owner", "shop_owner", "shop_manager", "admin"], location.pathname);
    throw redirect({ to: "/dashboard/settings", replace: true });
  },
});

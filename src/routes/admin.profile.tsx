import { createFileRoute, redirect } from "@tanstack/react-router";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute("/admin/profile")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    await requireRole(["admin", "super_admin"], location.pathname);
    throw redirect({ to: "/dashboard/settings", replace: true });
  },
});

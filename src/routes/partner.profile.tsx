import { createFileRoute, redirect } from "@tanstack/react-router";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute("/partner/profile")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    await requireRole(
      ["growth_partner", "district_partner", "admin", "super_admin"],
      location.pathname,
    );
    throw redirect({ to: "/dashboard/settings", replace: true });
  },
});

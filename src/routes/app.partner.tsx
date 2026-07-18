import { createFileRoute } from "@tanstack/react-router";
import { PartnerPwaShell } from "@/pages/partner/PartnerPwaShell";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute("/app/partner")({
  ssr: false,
  beforeLoad: ({ location }) =>
    requireRole(["growth_partner", "district_partner", "admin", "super_admin"], location.pathname),
  component: PartnerPwaShell,
});

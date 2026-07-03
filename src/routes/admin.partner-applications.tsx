import { createFileRoute } from "@tanstack/react-router";
import { PartnerApplicationsPage } from "@/pages/admin/PartnerApplicationsPage";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute("/admin/partner-applications")({
  ssr: false,
  beforeLoad: () => requireRole(["admin"], "/admin/partner-applications"),
  head: () => ({ meta: [{ title: "Partner Applications — Nexora Admin" }] }),
  component: PartnerApplicationsPage,
});

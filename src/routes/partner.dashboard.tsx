import { createFileRoute } from "@tanstack/react-router";
import { PartnerDashboardPage } from "@/pages/partner/PartnerDashboardPage";

export const Route = createFileRoute("/partner/dashboard")({
  component: PartnerDashboardPage,
});

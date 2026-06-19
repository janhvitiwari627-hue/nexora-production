import { createFileRoute } from "@tanstack/react-router";
import { GrowthPartnerDashboardPage } from "@/pages/partner/GrowthPartnerDashboardPage";

export const Route = createFileRoute("/partner/growth")({
  head: () => ({ meta: [{ title: "Growth Partner — Nexora" }] }),
  component: GrowthPartnerDashboardPage,
});

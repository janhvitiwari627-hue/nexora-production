import { createFileRoute } from "@tanstack/react-router";
import { DistrictPartnerDashboardPage } from "@/pages/partner/DistrictPartnerDashboardPage";

export const Route = createFileRoute("/partner/district")({
  head: () => ({ meta: [{ title: "District Partner — Nexora" }] }),
  component: DistrictPartnerDashboardPage,
});

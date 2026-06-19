import { createFileRoute } from "@tanstack/react-router";
import { DistributorDashboardPage } from "@/pages/partner/DistributorDashboardPage";

export const Route = createFileRoute("/partner/distributor")({
  head: () => ({ meta: [{ title: "Distributor — Nexora" }] }),
  component: DistributorDashboardPage,
});

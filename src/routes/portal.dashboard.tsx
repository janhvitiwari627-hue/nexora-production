import { createFileRoute } from "@tanstack/react-router";
import { PortalDashboardPage } from "@/pages/portal/PortalDashboardPage";

export const Route = createFileRoute("/portal/dashboard")({
  head: () => ({ meta: [{ title: "Portal Dashboard — Nexora" }] }),
  component: PortalDashboardPage,
});

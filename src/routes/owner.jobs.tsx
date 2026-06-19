import { createFileRoute } from "@tanstack/react-router";
import { OwnerHiringDashboardPage } from "@/pages/owner/OwnerHiringDashboardPage";

export const Route = createFileRoute("/owner/jobs")({
  head: () => ({ meta: [{ title: "Hiring Dashboard — Nexora" }] }),
  component: OwnerHiringDashboardPage,
});

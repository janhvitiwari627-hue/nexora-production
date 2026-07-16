import { createFileRoute } from "@tanstack/react-router";
import { OwnerDashboardPage } from "@/pages/owner/OwnerDashboardPage";

export const Route = createFileRoute("/app/owner/")({
  component: OwnerDashboardPage,
});

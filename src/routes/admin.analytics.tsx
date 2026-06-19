import { createFileRoute } from "@tanstack/react-router";
import { PlatformAnalyticsPage } from "@/pages/admin/PlatformAnalyticsPage";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({ meta: [{ title: "Platform Analytics — Nexora Admin" }] }),
  component: PlatformAnalyticsPage,
});

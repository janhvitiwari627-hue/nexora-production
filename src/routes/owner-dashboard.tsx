import { createFileRoute } from "@tanstack/react-router";
import { OwnerDashboardPage } from "@/pages/owner/OwnerDashboardPage";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute("/owner-dashboard")({
  ssr: false,
  beforeLoad: () => requireRole(["owner", "admin"], "/owner-dashboard"),
  head: () => ({
    meta: [
      { title: "Owner Dashboard — Nexora" },
      { name: "description", content: "Run your salon: bookings, revenue, staff and reviews at a glance." },
    ],
  }),
  component: OwnerDashboardPage,
});

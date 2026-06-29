import { createFileRoute } from "@tanstack/react-router";
import { OwnerDashboardPage } from "@/pages/owner/OwnerDashboardPage";

export const Route = createFileRoute("/owner/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Owner Dashboard — Nexora" },
      { name: "description", content: "Run your salon: bookings, revenue, staff and reviews at a glance." },
    ],
  }),
  component: OwnerDashboardPage,
});

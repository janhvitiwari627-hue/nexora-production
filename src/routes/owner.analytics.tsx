import { createFileRoute } from "@tanstack/react-router";
import { OwnerAnalyticsPage } from "@/pages/owner/OwnerAnalyticsPage";

export const Route = createFileRoute("/owner/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Nexora Owner" },
      { name: "description", content: "Revenue, bookings, customers, staff and service performance analytics." },
    ],
  }),
  component: OwnerAnalyticsPage,
});

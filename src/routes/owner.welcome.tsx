import { createFileRoute } from "@tanstack/react-router";
import { OwnerDashboardPage } from "@/pages/owner/OwnerDashboardPage";

export const Route = createFileRoute("/owner/welcome")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Salon Owner Dashboard — Nexora" },
      {
        name: "description",
        content: "Manage salon setup, bookings, services, wallet and account settings.",
      },
    ],
  }),
  component: OwnerWelcomeDashboard,
});

function OwnerWelcomeDashboard() {
  return <OwnerDashboardPage ownerPortalOnly />;
}

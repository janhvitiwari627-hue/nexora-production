import { createFileRoute } from "@tanstack/react-router";
import { DashboardHomePage } from "@/pages/customer/DashboardHomePage";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "My Dashboard — Nexora" },
      { name: "description", content: "Your bookings, rewards, and membership at a glance." },
    ],
  }),
  component: DashboardHomePage,
});

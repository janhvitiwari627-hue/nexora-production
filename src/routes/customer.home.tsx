import { createFileRoute } from "@tanstack/react-router";
import { DashboardHomePage } from "@/pages/customer/DashboardHomePage";

export const Route = createFileRoute("/customer/home")({
  head: () => ({
    meta: [
      { title: "Customer Home — Nexora" },
      { name: "description", content: "Your bookings, rewards, and membership at a glance." },
    ],
  }),
  component: DashboardHomePage,
});

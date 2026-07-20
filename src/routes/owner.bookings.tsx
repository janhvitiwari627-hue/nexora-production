import { createFileRoute } from "@tanstack/react-router";
import { OwnerBookingsPage } from "@/pages/owner/OwnerBookingsPage";

export const Route = createFileRoute("/owner/bookings")({
  head: () => ({
    meta: [
      { title: "Owner · Bookings — Nexora" },
      {
        name: "description",
        content: "Manage salon appointments: accept, start, complete, and track booking status.",
      },
    ],
  }),
  component: OwnerBookingsPage,
});

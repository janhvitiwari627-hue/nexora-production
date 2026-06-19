import { createFileRoute } from "@tanstack/react-router";
import { MyBookingsPage } from "@/pages/customer/MyBookingsPage";

export const Route = createFileRoute("/dashboard/bookings")({
  head: () => ({
    meta: [
      { title: "My Bookings — Nexora" },
      {
        name: "description",
        content:
          "View your upcoming, completed, cancelled and rescheduled appointments — reschedule, cancel, get directions or rebook in one tap.",
      },
      { property: "og:title", content: "My Bookings — Nexora" },
      {
        property: "og:description",
        content: "Manage every appointment from one beautifully simple dashboard.",
      },
    ],
  }),
  component: MyBookingsPage,
});

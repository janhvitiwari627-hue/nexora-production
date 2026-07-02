import { createFileRoute } from "@tanstack/react-router";
import { MyBookingsPage } from "@/pages/customer/MyBookingsPage";

export const Route = createFileRoute("/customer/bookings")({
  head: () => ({
    meta: [
      { title: "My Bookings — Nexora" },
      { name: "description", content: "Manage your upcoming and past salon appointments." },
    ],
  }),
  component: MyBookingsPage,
});

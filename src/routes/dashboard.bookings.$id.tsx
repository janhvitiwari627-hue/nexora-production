import { createFileRoute } from "@tanstack/react-router";
import { BookingDetailPage } from "@/pages/customer/BookingDetailPage";

export const Route = createFileRoute("/dashboard/bookings/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Booking ${params.id} — Nexora` },
      {
        name: "description",
        content: "Booking details, status timeline, QR check-in and payment breakdown.",
      },
    ],
  }),
  component: BookingDetailPage,
});

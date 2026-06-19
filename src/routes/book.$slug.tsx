import { createFileRoute } from "@tanstack/react-router";
import { BookingFlowPage } from "@/pages/public/BookingFlowPage";

export const Route = createFileRoute("/book/$slug")({
  head: () => ({
    meta: [
      { title: "Book your appointment — Nexora" },
      { name: "description", content: "Pick services, stylist, date and pay 25% to confirm." },
    ],
  }),
  component: BookingFlowPage,
});

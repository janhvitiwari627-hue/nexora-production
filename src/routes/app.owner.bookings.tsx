import { createFileRoute } from "@tanstack/react-router";
import { OwnerBookingsPage } from "@/pages/owner/OwnerBookingsPage";

export const Route = createFileRoute("/app/owner/bookings")({
  component: OwnerBookingsPage,
});

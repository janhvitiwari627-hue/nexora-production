import { createFileRoute } from "@tanstack/react-router";
import { CustomerAppBookings } from "@/pages/customer/app/CustomerAppBookings";

export const Route = createFileRoute("/app/customer/bookings")({
  component: CustomerAppBookings,
});

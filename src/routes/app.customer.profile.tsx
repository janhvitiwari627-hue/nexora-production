import { createFileRoute } from "@tanstack/react-router";
import { CustomerAppProfile } from "@/pages/customer/app/CustomerAppProfile";

export const Route = createFileRoute("/app/customer/profile")({
  component: CustomerAppProfile,
});

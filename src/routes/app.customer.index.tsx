import { createFileRoute } from "@tanstack/react-router";
import { CustomerAppHome } from "@/pages/customer/app/CustomerAppHome";

export const Route = createFileRoute("/app/customer/")({
  component: CustomerAppHome,
});

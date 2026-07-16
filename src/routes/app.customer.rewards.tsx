import { createFileRoute } from "@tanstack/react-router";
import { CustomerAppRewards } from "@/pages/customer/app/CustomerAppRewards";

export const Route = createFileRoute("/app/customer/rewards")({
  component: CustomerAppRewards,
});

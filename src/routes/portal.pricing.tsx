import { createFileRoute } from "@tanstack/react-router";
import { PricingPage } from "@/pages/portal/SimplePages";

export const Route = createFileRoute("/portal/pricing")({
  head: () => ({ meta: [{ title: "Pricing — Nexora Portal" }] }),
  component: PricingPage,
});

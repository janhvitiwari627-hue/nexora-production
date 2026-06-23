import { createFileRoute } from "@tanstack/react-router";
import { PromotionCenterPage } from "@/pages/portal/SimplePages";

export const Route = createFileRoute("/portal/promotions")({
  head: () => ({ meta: [{ title: "Promotion Center — Nexora Portal" }] }),
  component: PromotionCenterPage,
});

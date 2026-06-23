import { createFileRoute } from "@tanstack/react-router";
import { PromotionCenterPage } from "@/pages/portal/PromotionCenterPage";

export const Route = createFileRoute("/portal/promotions")({
  head: () => ({ meta: [
    { title: "Promotion Center — Nexora Portal" },
    { name: "description", content: "Create and manage promotional campaigns targeted at salons and beauty businesses across India." },
  ]}),
  component: PromotionCenterPage,
});

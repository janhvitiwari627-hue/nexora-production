import { createFileRoute } from "@tanstack/react-router";
import { BecomePartnerPage } from "@/pages/public/BecomePartnerPage";

export const Route = createFileRoute("/partner/")({
  head: () => ({
    meta: [
      { title: "Become a Partner — Grow with Nexora" },
      { name: "description", content: "Join 12,000+ salons growing 38% faster with Nexora. Zero setup, 24h onboarding." },
    ],
  }),
  component: BecomePartnerPage,
});

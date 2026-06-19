import { createFileRoute } from "@tanstack/react-router";
import { OwnerMarketingPage } from "@/pages/owner/OwnerMarketingPage";

export const Route = createFileRoute("/owner/marketing")({
  head: () => ({
    meta: [
      { title: "Marketing & Offers — Nexora Owner" },
      { name: "description", content: "Offers, campaigns, WhatsApp automations and AI marketing." },
    ],
  }),
  component: OwnerMarketingPage,
});

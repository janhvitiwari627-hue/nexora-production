import { createFileRoute } from "@tanstack/react-router";
import { PartnerAppLayout } from "@/pages/partner/PartnerAppLayout";

export const Route = createFileRoute("/partner")({
  head: () => ({
    meta: [
      { title: "Nexora Partner — Growth Partner App" },
      { name: "description", content: "Manage leads, shops, commissions and payouts as a Nexora Growth Partner." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PartnerAppLayout,
});

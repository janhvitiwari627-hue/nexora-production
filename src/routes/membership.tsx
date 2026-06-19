import { createFileRoute } from "@tanstack/react-router";
import { MembershipPage } from "@/pages/public/MembershipPage";

export const Route = createFileRoute("/membership")({
  head: () => ({
    meta: [
      { title: "Nexora Membership — Save up to 25% on services" },
      { name: "description", content: "Join 38,000+ members saving on beauty services every month." },
      { property: "og:title", content: "Nexora Membership" },
      { property: "og:description", content: "Members save an average of ₹14,000/year." },
    ],
  }),
  component: MembershipPage,
});

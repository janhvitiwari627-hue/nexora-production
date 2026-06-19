import { createFileRoute } from "@tanstack/react-router";
import { MembershipCenterPage } from "@/pages/customer/MembershipCenterPage";

export const Route = createFileRoute("/dashboard/membership")({
  head: () => ({
    meta: [
      { title: "Membership Center — Nexora" },
      {
        name: "description",
        content:
          "Manage your Nexora membership, view savings earned, compare tiers and track your upgrade path.",
      },
      { property: "og:title", content: "Membership Center — Nexora" },
    ],
  }),
  component: MembershipCenterPage,
});

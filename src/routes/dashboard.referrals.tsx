import { createFileRoute } from "@tanstack/react-router";
import { ReferralCenterPage } from "@/pages/customer/ReferralCenterPage";

export const Route = createFileRoute("/dashboard/referrals")({
  head: () => ({
    meta: [
      { title: "Referral Center — Earn ₹100 per friend" },
      {
        name: "description",
        content:
          "Share your Nexora referral code and earn ₹100 wallet credit each time a friend books their first service.",
      },
      { property: "og:title", content: "Nexora Referrals" },
    ],
  }),
  component: ReferralCenterPage,
});

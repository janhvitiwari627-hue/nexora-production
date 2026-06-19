import { createFileRoute } from "@tanstack/react-router";
import { ReferralPage } from "@/pages/public/ReferralPage";

export const Route = createFileRoute("/referrals")({
  head: () => ({
    meta: [
      { title: "Refer & Earn — Give ₹200, Get ₹200 | Nexora" },
      { name: "description", content: "Invite friends to Nexora — both of you earn rewards." },
    ],
  }),
  component: ReferralPage,
});

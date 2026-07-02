import { createFileRoute } from "@tanstack/react-router";
import { RewardCenterPage } from "@/pages/customer/RewardCenterPage";

export const Route = createFileRoute("/customer/rewards")({
  head: () => ({
    meta: [
      { title: "Rewards — Nexora" },
      { name: "description", content: "Track points, tier progress, and redemptions." },
    ],
  }),
  component: RewardCenterPage,
});

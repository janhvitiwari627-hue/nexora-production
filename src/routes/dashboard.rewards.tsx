import { createFileRoute } from "@tanstack/react-router";
import { RewardCenterPage } from "@/pages/customer/RewardCenterPage";

export const Route = createFileRoute("/dashboard/rewards")({
  head: () => ({
    meta: [
      { title: "Reward Center — Nexora" },
      {
        name: "description",
        content:
          "Track your reward points, tier progress, redemption options and earning history in one place.",
      },
      { property: "og:title", content: "Reward Center — Nexora" },
    ],
  }),
  component: RewardCenterPage,
});

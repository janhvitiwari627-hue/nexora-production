import { createFileRoute } from "@tanstack/react-router";
import { RewardsManagementPage } from "@/pages/admin/RewardsManagementPage";

export const Route = createFileRoute("/admin/rewards")({
  head: () => ({ meta: [{ title: "Rewards Management — Nexora Admin" }] }),
  component: RewardsManagementPage,
});

import { createFileRoute } from "@tanstack/react-router";
import { RankingsManagementPage } from "@/pages/admin/RankingsManagementPage";

export const Route = createFileRoute("/admin/rankings")({
  head: () => ({ meta: [{ title: "Rankings Management — Nexora Admin" }] }),
  component: RankingsManagementPage,
});

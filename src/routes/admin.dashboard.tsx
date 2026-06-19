import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Admin Dashboard — Nexora" }] }),
  component: AdminDashboardPage,
});

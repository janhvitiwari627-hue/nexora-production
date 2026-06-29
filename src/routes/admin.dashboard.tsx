import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute("/admin/dashboard")({
  ssr: false,
  beforeLoad: () => requireRole(["admin"], "/admin/dashboard"),
  head: () => ({ meta: [{ title: "Admin Dashboard — Nexora" }] }),
  component: AdminDashboardPage,
});

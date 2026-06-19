import { createFileRoute } from "@tanstack/react-router";
import { AdminLoginPage } from "@/pages/admin/AdminLoginPage";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin Sign In — Nexora" }] }),
  component: AdminLoginPage,
});

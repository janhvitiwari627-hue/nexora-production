import { createFileRoute } from "@tanstack/react-router";
import { UserManagementPage } from "@/pages/admin/UserManagementPage";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "User Management — Nexora Admin" }] }),
  component: UserManagementPage,
});

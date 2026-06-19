import { createFileRoute } from "@tanstack/react-router";
import { BusinessManagementPage } from "@/pages/admin/BusinessManagementPage";

export const Route = createFileRoute("/admin/businesses")({
  head: () => ({ meta: [{ title: "Business Management — Nexora Admin" }] }),
  component: BusinessManagementPage,
});

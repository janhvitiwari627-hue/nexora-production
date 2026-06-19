import { createFileRoute } from "@tanstack/react-router";
import { AdvertisingManagementPage } from "@/pages/admin/AdvertisingManagementPage";

export const Route = createFileRoute("/admin/advertising")({
  head: () => ({ meta: [{ title: "Advertising — Nexora Admin" }] }),
  component: AdvertisingManagementPage,
});

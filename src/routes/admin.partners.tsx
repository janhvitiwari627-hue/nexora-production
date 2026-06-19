import { createFileRoute } from "@tanstack/react-router";
import { PartnerManagementPage } from "@/pages/admin/PartnerManagementPage";

export const Route = createFileRoute("/admin/partners")({
  head: () => ({ meta: [{ title: "Partner Management — Nexora Admin" }] }),
  component: PartnerManagementPage,
});

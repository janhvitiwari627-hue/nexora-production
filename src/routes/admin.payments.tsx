import { createFileRoute } from "@tanstack/react-router";
import { PaymentManagementPage } from "@/pages/admin/PaymentManagementPage";

export const Route = createFileRoute("/admin/payments")({
  head: () => ({ meta: [{ title: "Payment Management — Nexora Admin" }] }),
  component: PaymentManagementPage,
});

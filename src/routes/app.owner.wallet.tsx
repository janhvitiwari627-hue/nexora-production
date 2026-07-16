import { createFileRoute } from "@tanstack/react-router";
import { OwnerPaymentsPage } from "@/pages/owner/OwnerPaymentsPage";

export const Route = createFileRoute("/app/owner/wallet")({
  component: OwnerPaymentsPage,
});

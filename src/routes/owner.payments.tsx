import { createFileRoute } from "@tanstack/react-router";
import { OwnerPaymentsPage } from "@/pages/owner/OwnerPaymentsPage";

export const Route = createFileRoute("/owner/payments")({
  head: () => ({
    meta: [
      { title: "Payments & Payouts — Nexora Owner" },
      {
        name: "description",
        content: "Track settlements, transactions, QR collection and bank account.",
      },
    ],
  }),
  component: OwnerPaymentsPage,
});

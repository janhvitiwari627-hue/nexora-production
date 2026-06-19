import { createFileRoute } from "@tanstack/react-router";
import { QRPaymentHistoryPage } from "@/pages/customer/QRPaymentHistoryPage";

export const Route = createFileRoute("/dashboard/qr-history")({
  head: () => ({
    meta: [
      { title: "QR Payment History — Nexora" },
      {
        name: "description",
        content:
          "View your in-store QR payments, rewards earned and downloadable invoices on Nexora.",
      },
      { property: "og:title", content: "Nexora QR Payment History" },
    ],
  }),
  component: QRPaymentHistoryPage,
});

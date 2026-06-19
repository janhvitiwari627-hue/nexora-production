import { createFileRoute } from "@tanstack/react-router";
import { WalletPage } from "@/pages/customer/WalletPage";

export const Route = createFileRoute("/dashboard/wallet")({
  head: () => ({
    meta: [
      { title: "Nexora Wallet — Credits, Refunds & Cashback" },
      {
        name: "description",
        content:
          "Track reward, referral and cashback credits, view transaction history and monitor refund status in one place.",
      },
      { property: "og:title", content: "Nexora Wallet" },
    ],
  }),
  component: WalletPage,
});

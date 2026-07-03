import { createFileRoute } from "@tanstack/react-router";
import { PartnerPayoutPage } from "@/pages/partner/PartnerPayoutPage";

export const Route = createFileRoute("/partner/payout")({
  component: PartnerPayoutPage,
});

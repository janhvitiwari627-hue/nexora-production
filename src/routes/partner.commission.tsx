import { createFileRoute } from "@tanstack/react-router";
import { PartnerCommissionPage } from "@/pages/partner/PartnerCommissionPage";

export const Route = createFileRoute("/partner/commission")({
  component: PartnerCommissionPage,
});

import { createFileRoute } from "@tanstack/react-router";
import { PartnerLeadsPage } from "@/pages/partner/PartnerLeadsPage";

export const Route = createFileRoute("/partner/leads")({
  component: PartnerLeadsPage,
});

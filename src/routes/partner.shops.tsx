import { createFileRoute } from "@tanstack/react-router";
import { PartnerShopsPage } from "@/pages/partner/PartnerShopsPage";

export const Route = createFileRoute("/partner/shops")({
  component: PartnerShopsPage,
});

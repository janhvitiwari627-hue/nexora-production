import { createFileRoute } from "@tanstack/react-router";
import { PartnerSubPage } from "@/pages/partner/PartnerSubPage";

export const Route = createFileRoute("/partner/leads")({
  component: () => <PartnerSubPage slug="leads" />,
});

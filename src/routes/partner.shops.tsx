import { createFileRoute } from "@tanstack/react-router";
import { PartnerSubPage } from "@/pages/partner/PartnerSubPage";

export const Route = createFileRoute("/partner/shops")({
  component: () => <PartnerSubPage slug="shops" />,
});

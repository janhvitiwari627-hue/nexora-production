import { createFileRoute } from "@tanstack/react-router";
import { PartnerMilestonesPage } from "@/pages/partner/PartnerMilestonesPage";

export const Route = createFileRoute("/partner/milestones")({
  component: PartnerMilestonesPage,
});

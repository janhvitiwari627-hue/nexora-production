import { createFileRoute } from "@tanstack/react-router";
import { PartnerTrainingPage } from "@/pages/partner/PartnerTrainingPage";

export const Route = createFileRoute("/partner/training")({
  component: PartnerTrainingPage,
});

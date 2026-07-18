import { createFileRoute } from "@tanstack/react-router";
import { SavedJobsPage } from "@/pages/jobs/app/SavedJobsPage";

export const Route = createFileRoute("/app/jobs/saved")({
  component: SavedJobsPage,
});

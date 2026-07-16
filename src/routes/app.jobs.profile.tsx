import { createFileRoute } from "@tanstack/react-router";
import { CandidateProfilePage } from "@/pages/jobs/CandidateProfilePage";

export const Route = createFileRoute("/app/jobs/profile")({
  component: CandidateProfilePage,
});

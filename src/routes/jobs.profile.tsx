import { createFileRoute } from "@tanstack/react-router";
import { CandidateProfilePage } from "@/pages/jobs/CandidateProfilePage";

export const Route = createFileRoute("/jobs/profile")({
  head: () => ({ meta: [{ title: "Your Candidate Profile — Nexora" }] }),
  component: CandidateProfilePage,
});

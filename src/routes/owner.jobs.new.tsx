import { createFileRoute } from "@tanstack/react-router";
import { OwnerJobPostingPage } from "@/pages/owner/OwnerJobPostingPage";

export const Route = createFileRoute("/owner/jobs/new")({
  head: () => ({ meta: [{ title: "Post a Job — Nexora" }] }),
  component: OwnerJobPostingPage,
});

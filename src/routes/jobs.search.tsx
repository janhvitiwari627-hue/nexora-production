import { createFileRoute } from "@tanstack/react-router";
import { JobSearchPage } from "@/pages/jobs/JobSearchPage";

export const Route = createFileRoute("/jobs/search")({
  head: () => ({ meta: [{ title: "Search Salon Jobs — Nexora" }] }),
  component: JobSearchPage,
});

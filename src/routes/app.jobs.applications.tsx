import { createFileRoute } from "@tanstack/react-router";
import { MyApplicationsPage } from "@/pages/jobs/MyApplicationsPage";
import type { ApplicationsSearch } from "@/routes/jobs.applications";

const ALLOWED_STATUSES = [
  "all",
  "submitted",
  "reviewed",
  "shortlisted",
  "rejected",
  "hired",
  "withdrawn",
];

export const Route = createFileRoute("/app/jobs/applications")({
  validateSearch: (search: Record<string, unknown>): ApplicationsSearch => {
    const rawStatus = typeof search.status === "string" ? search.status : "all";
    return {
      status: (ALLOWED_STATUSES.includes(rawStatus)
        ? rawStatus
        : "all") as ApplicationsSearch["status"],
      q: typeof search.q === "string" ? search.q : "",
    };
  },
  component: MyApplicationsPage,
});

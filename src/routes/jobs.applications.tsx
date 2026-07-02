import { createFileRoute } from "@tanstack/react-router";
import { MyApplicationsPage } from "@/pages/jobs/MyApplicationsPage";

const ALLOWED_STATUSES = [
  "all",
  "submitted",
  "reviewed",
  "shortlisted",
  "rejected",
  "hired",
  "withdrawn",
] as const;

export type ApplicationsSearch = {
  status: (typeof ALLOWED_STATUSES)[number];
  q: string;
};

export const Route = createFileRoute("/jobs/applications")({
  head: () => ({ meta: [{ title: "My Applications — Nexora" }] }),
  validateSearch: (search: Record<string, unknown>): ApplicationsSearch => {
    const rawStatus = typeof search.status === "string" ? search.status : "all";
    const status = (ALLOWED_STATUSES as readonly string[]).includes(rawStatus)
      ? (rawStatus as ApplicationsSearch["status"])
      : "all";
    const q = typeof search.q === "string" ? search.q : "";
    return { status, q };
  },
  component: MyApplicationsPage,
});

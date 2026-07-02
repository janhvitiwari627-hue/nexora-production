import { createFileRoute } from "@tanstack/react-router";
import { JobPortalPage } from "@/pages/public/JobPortalPage";

export const Route = createFileRoute("/hire")({
  head: () => ({
    meta: [
      { title: "Hire the best in beauty — Nexora" },
      {
        name: "description",
        content: "Post a role and meet 50,000+ verified stylists & therapists.",
      },
    ],
  }),
  component: () => <JobPortalPage initialRole="employer" />,
});

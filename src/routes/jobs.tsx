import { createFileRoute } from "@tanstack/react-router";
import { JobPortalPage } from "@/pages/public/JobPortalPage";

export const Route = createFileRoute("/jobs")({
  head: () => ({
    meta: [
      { title: "Salon Jobs in India — Nexora Careers" },
      { name: "description", content: "1,200+ salon, spa & studio jobs across India. Get hired in days." },
    ],
  }),
  component: JobPortalPage,
});

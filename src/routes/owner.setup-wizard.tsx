import { createFileRoute } from "@tanstack/react-router";
import { SetupWizardPage } from "@/pages/owner/SetupWizardPage";

export const Route = createFileRoute("/owner/setup-wizard")({
  head: () => ({
    meta: [
      { title: "30-Minute Website Setup — Nexora Owner" },
      {
        name: "description",
        content:
          "Launch your white-label booking website in 30 minutes. Complete the mandatory checklist and go live.",
      },
    ],
  }),
  component: SetupWizardPage,
});

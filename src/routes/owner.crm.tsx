import { createFileRoute } from "@tanstack/react-router";
import { OwnerCRMPage } from "@/pages/owner/OwnerCRMPage";

export const Route = createFileRoute("/owner/crm")({
  head: () => ({
    meta: [
      { title: "Owner · CRM — Nexora" },
      { name: "description", content: "Customer database, segments, tags, and WhatsApp campaigns for your salon." },
    ],
  }),
  component: OwnerCRMPage,
});

import { createFileRoute } from "@tanstack/react-router";
import { OwnerWebsitePage } from "@/pages/owner/OwnerWebsitePage";

export const Route = createFileRoute("/app/owner/website")({
  component: OwnerWebsitePage,
});

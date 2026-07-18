import { createFileRoute } from "@tanstack/react-router";
import { SupportPage } from "@/pages/customer/SupportPage";

export const Route = createFileRoute("/app/owner/support")({
  component: SupportPage,
});

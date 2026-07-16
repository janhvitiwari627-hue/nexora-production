import { createFileRoute } from "@tanstack/react-router";
import { OwnerAppProfile } from "@/pages/owner/app/OwnerAppProfile";

export const Route = createFileRoute("/app/owner/profile")({
  component: OwnerAppProfile,
});

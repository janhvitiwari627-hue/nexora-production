import { createFileRoute, redirect } from "@tanstack/react-router";
import { requireRole } from "@/lib/route-guards";

// Legacy route — single source of truth is now /owner/website/edit.
export const Route = createFileRoute("/owner/create-website")({
  beforeLoad: async ({ location }) => {
    await requireRole(["owner", "shop_owner", "admin"], location.pathname);
    throw redirect({ to: "/owner/website", search: {}, replace: true });
  },
});

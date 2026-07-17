import { createFileRoute, redirect } from "@tanstack/react-router";
import { requireRole } from "@/lib/route-guards";

export const Route = createFileRoute("/owner/templates")({
  beforeLoad: async ({ location }) => {
    await requireRole(["owner", "shop_owner", "admin"], location.pathname);
    throw redirect({ to: "/owner/website", search: {}, replace: true });
  },
  head: () => ({
    meta: [
      { title: "Final Website Editor — Nexora" },
      {
        name: "description",
        content:
          "Edit your salon website design, content, theme and final publish action in one place.",
      },
    ],
  }),
});

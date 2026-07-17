import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/owner/website-editor")({
  beforeLoad: () => {
    throw redirect({ to: "/owner/website", replace: true });
  },
  head: () => ({
    meta: [{ title: "Final Website Editor — Nexora" }, { name: "robots", content: "noindex" }],
  }),
});

import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/owner/website/edit")({
  beforeLoad: () => {
    throw redirect({ to: "/owner/website", search: {}, replace: true });
  },
  head: () => ({
    meta: [{ title: "Final Website Editor — Nexora" }, { name: "robots", content: "noindex" }],
  }),
});

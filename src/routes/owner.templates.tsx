import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/owner/templates")({
  beforeLoad: () => {
    throw redirect({ to: "/owner/website/edit", replace: true });
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

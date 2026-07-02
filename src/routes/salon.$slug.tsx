import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/salon/$slug")({
  beforeLoad: ({ params }) => {
    // Canonical salon website lives at /site/$businessSlug — keep /salon/:slug as a public alias.
    throw redirect({
      to: "/site/$businessSlug",
      params: { businessSlug: params.slug },
    });
  },
});

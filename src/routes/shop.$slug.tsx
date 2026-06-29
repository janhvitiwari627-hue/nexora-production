import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/shop/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/site/$businessSlug", params: { businessSlug: params.slug }, replace: true });
  },
  component: () => null,
});

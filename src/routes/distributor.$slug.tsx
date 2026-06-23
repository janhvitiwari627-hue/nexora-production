import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/distributor/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/portal/distributors/$slug", params: { slug: params.slug }, replace: true });
  },
});

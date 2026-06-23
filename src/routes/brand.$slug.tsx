import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/brand/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/portal/brands/$slug", params: { slug: params.slug }, replace: true });
  },
});

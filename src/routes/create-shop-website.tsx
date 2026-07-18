import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/create-shop-website")({
  beforeLoad: () => {
    throw redirect({
      to: "/auth-notice",
      search: {
        to: "/owner/website",
        reason: "create-website",
        delay: 1100,
      },
    });
  },
});

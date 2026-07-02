import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/create-shop-website")({
  beforeLoad: () => {
    throw redirect({ to: "/owner/create-website" });
  },
});

import { createFileRoute } from "@tanstack/react-router";
import { OwnerReviewsPage } from "@/pages/owner/OwnerReviewsPage";

export const Route = createFileRoute("/owner/reviews")({
  head: () => ({
    meta: [
      { title: "Owner · Reviews — Nexora" },
      { name: "description", content: "Manage customer reviews, replies, and reputation." },
    ],
  }),
  component: OwnerReviewsPage,
});

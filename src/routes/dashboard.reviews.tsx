import { createFileRoute } from "@tanstack/react-router";
import { MyReviewsPage } from "@/pages/customer/MyReviewsPage";

export const Route = createFileRoute("/dashboard/reviews")({
  head: () => ({
    meta: [
      { title: "My Reviews — Nexora" },
      {
        name: "description",
        content: "View, edit and write reviews for the shops you've visited on Nexora.",
      },
      { property: "og:title", content: "My Reviews — Nexora" },
    ],
  }),
  component: MyReviewsPage,
});

import { createFileRoute } from "@tanstack/react-router";
import { ReviewModerationPage } from "@/pages/admin/ReviewModerationPage";

export const Route = createFileRoute("/admin/reviews")({
  head: () => ({ meta: [{ title: "Review Moderation — Nexora Admin" }] }),
  component: ReviewModerationPage,
});

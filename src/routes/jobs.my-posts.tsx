import { createFileRoute } from "@tanstack/react-router";
import { MyJobPostsPage } from "@/pages/jobs/MyJobPostsPage";

export const Route = createFileRoute("/jobs/my-posts")({
  head: () => ({ meta: [{ title: "My Job Posts — Nexora" }] }),
  component: MyJobPostsPage,
});

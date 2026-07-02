import { createFileRoute } from "@tanstack/react-router";
import { PostJobPage } from "@/pages/jobs/PostJobPage";

export const Route = createFileRoute("/hire/post-job")({
  head: () => ({
    meta: [{ title: "Post a job free — Nexora" }],
  }),
  component: PostJobPage,
});

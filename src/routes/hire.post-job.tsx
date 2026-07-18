import { createFileRoute } from "@tanstack/react-router";
import { PostJobPage } from "@/pages/jobs/PostJobPage";
import { PostJobErrorBoundary } from "@/components/PostJobErrorBoundary";

export type PostJobSearch = { jobId?: string };

function PostJobRoute() {
  return (
    <PostJobErrorBoundary>
      <PostJobPage />
    </PostJobErrorBoundary>
  );
}

export const Route = createFileRoute("/hire/post-job")({
  head: () => ({
    meta: [{ title: "Post a job free — Nexora" }],
  }),
  validateSearch: (search: Record<string, unknown>): PostJobSearch => ({
    jobId: typeof search.jobId === "string" && search.jobId ? search.jobId : undefined,
  }),
  component: PostJobRoute,
});

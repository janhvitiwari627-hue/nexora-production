import { createFileRoute } from "@tanstack/react-router";
import { CategoryBrowsePage } from "@/pages/public/CategoryBrowsePage";

export const Route = createFileRoute("/category/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} — Nexora` },
      { name: "description", content: `Discover the best ${params.slug.replace(/-/g, " ")} near you.` },
    ],
  }),
  component: CategoryBrowsePage,
});

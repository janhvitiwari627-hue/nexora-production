import { createFileRoute } from "@tanstack/react-router";
import { WebsiteEditorPage } from "@/pages/owner/WebsiteEditorPage";

export const Route = createFileRoute("/owner/website/edit")({
  head: () => ({
    meta: [{ title: "Final Website Editor — Nexora" }, { name: "robots", content: "noindex" }],
  }),
  component: WebsiteEditorPage,
});

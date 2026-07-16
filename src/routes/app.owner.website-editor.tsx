import { createFileRoute } from "@tanstack/react-router";
import { WebsiteEditorPage } from "@/pages/owner/WebsiteEditorPage";

export const Route = createFileRoute("/app/owner/website-editor")({
  head: () => ({
    meta: [{ title: "Website Editor — Nexora" }, { name: "robots", content: "noindex" }],
  }),
  component: WebsiteEditorPage,
});

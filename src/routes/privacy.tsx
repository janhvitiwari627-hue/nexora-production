import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPage } from "@/pages/public/PrivacyPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Nexora" },
      { name: "description", content: "How Nexora collects, uses and protects your data." },
    ],
  }),
  component: PrivacyPage,
});

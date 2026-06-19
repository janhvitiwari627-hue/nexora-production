import { createFileRoute } from "@tanstack/react-router";
import { TermsPage } from "@/pages/public/TermsPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Nexora" },
      { name: "description", content: "The terms that govern your use of Nexora." },
    ],
  }),
  component: TermsPage,
});

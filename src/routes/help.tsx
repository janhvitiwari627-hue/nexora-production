import { createFileRoute } from "@tanstack/react-router";
import { HelpPage } from "@/pages/public/HelpPage";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help Centre — Nexora" },
      { name: "description", content: "Answers to common questions about bookings, payments, memberships and more." },
    ],
  }),
  component: HelpPage,
});

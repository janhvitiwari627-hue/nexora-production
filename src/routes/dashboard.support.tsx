import { createFileRoute } from "@tanstack/react-router";
import { SupportPage } from "@/pages/customer/SupportPage";

export const Route = createFileRoute("/dashboard/support")({
  head: () => ({
    meta: [
      { title: "Support Center — Nexora" },
      {
        name: "description",
        content:
          "Get help with bookings, payments, rewards and your account. Chat with us, raise a ticket or browse FAQs.",
      },
      { property: "og:title", content: "Nexora Support Center" },
    ],
  }),
  component: SupportPage,
});

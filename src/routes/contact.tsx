import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/pages/public/ContactPage";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Nexora — We're here to help" },
      { name: "description", content: "Get in touch with the Nexora team. We reply within a few hours." },
    ],
  }),
  component: ContactPage,
});

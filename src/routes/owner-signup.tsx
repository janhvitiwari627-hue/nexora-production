import { createFileRoute } from "@tanstack/react-router";
import { OwnerOnboardingPage } from "@/pages/auth/OwnerOnboardingPage";

export const Route = createFileRoute("/owner-signup")({
  head: () => ({
    meta: [
      { title: "Shop Owner Sign up — Nexora" },
      { name: "description", content: "Request your Nexora shop owner account." },
    ],
  }),
  component: OwnerOnboardingPage,
});

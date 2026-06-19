import { createFileRoute } from "@tanstack/react-router";
import { OwnerOnboardingPage } from "@/pages/auth/OwnerOnboardingPage";

export const Route = createFileRoute("/owner/onboarding")({
  head: () => ({ meta: [{ title: "Get Started — Nexora SalonOS" }] }),
  component: OwnerOnboardingPage,
});

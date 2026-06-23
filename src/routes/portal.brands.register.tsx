import { createFileRoute } from "@tanstack/react-router";
import { BrandRegistrationPage } from "@/pages/portal/BrandRegistrationPage";

export const Route = createFileRoute("/portal/brands/register")({
  head: () => ({ meta: [{ title: "Register Brand — Nexora Portal" }] }),
  component: BrandRegistrationPage,
});

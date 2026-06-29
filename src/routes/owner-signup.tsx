import { createFileRoute } from "@tanstack/react-router";
import OwnerSignupPage from "@/pages/auth/OwnerSignupPage";

export const Route = createFileRoute("/owner-signup")({
  head: () => ({
    meta: [
      { title: "Shop Owner Sign up — Nexora" },
      { name: "description", content: "Request your Nexora shop owner account. Our team will verify and activate your access." },
    ],
  }),
  component: OwnerSignupPage,
});

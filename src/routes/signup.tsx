import { createFileRoute } from "@tanstack/react-router";
import SignupPage from "@/pages/auth/SignupPage";

export const Route = createFileRoute("/signup")({
  validateSearch: (search: Record<string, unknown>) => ({
    ref: typeof search.ref === "string" ? search.ref : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign up — Nexora" },
      { name: "description", content: "Create your free Nexora account." },
    ],
  }),
  component: SignupPage,
});

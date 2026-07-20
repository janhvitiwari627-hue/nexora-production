import { createFileRoute } from "@tanstack/react-router";
import SignupPage from "@/pages/auth/SignupPage";
import { redirectIfSignedIn } from "@/lib/redirect-if-signed-in";

export const Route = createFileRoute("/signup")({
  ssr: false,
  beforeLoad: redirectIfSignedIn,
  validateSearch: (search: Record<string, unknown>): { ref?: string } => ({
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

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
      {
        name: "description",
        content:
          "Welcome to Nexora Salons. Join with your referral code, discover trusted salons and unlock eligible booking rewards.",
      },
      { property: "og:title", content: "Welcome to Nexora Salons" },
      {
        property: "og:description",
        content: "Join Nexora with your referral link and discover trusted salons near you.",
      },
      {
        property: "og:image",
        content: "https://www.meripahalfasthelp.online/nexora-final-logo.jpg",
      },
      { property: "og:image:alt", content: "Nexora Salons logo" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Welcome to Nexora Salons" },
      {
        name: "twitter:image",
        content: "https://www.meripahalfasthelp.online/nexora-final-logo.jpg",
      },
    ],
  }),
  component: SignupPage,
});

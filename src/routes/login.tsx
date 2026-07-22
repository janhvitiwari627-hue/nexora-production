import { createFileRoute } from "@tanstack/react-router";
import CustomerLoginPage from "@/pages/auth/CustomerLoginPage";
import { redirectIfSignedIn } from "@/lib/redirect-if-signed-in";

export const Route = createFileRoute("/login")({
  ssr: false,
  beforeLoad: redirectIfSignedIn,
  validateSearch: (search: Record<string, unknown>): { email?: string } => ({
    email: typeof search.email === "string" ? search.email : undefined,
  }),
  component: CustomerLoginPage,
});

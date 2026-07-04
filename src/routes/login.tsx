import { createFileRoute } from "@tanstack/react-router";
import CustomerLoginPage from "@/pages/auth/CustomerLoginPage";
import { redirectIfSignedIn } from "@/lib/redirect-if-signed-in";

export const Route = createFileRoute("/login")({
  ssr: false,
  beforeLoad: redirectIfSignedIn,
  component: CustomerLoginPage,
});

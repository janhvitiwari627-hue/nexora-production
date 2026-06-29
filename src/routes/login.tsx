import { createFileRoute } from "@tanstack/react-router";
import CustomerLoginPage from "@/pages/auth/CustomerLoginPage";

export const Route = createFileRoute("/login")({
  ssr: false,
  component: CustomerLoginPage,
});

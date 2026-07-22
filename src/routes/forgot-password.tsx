import { createFileRoute } from "@tanstack/react-router";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";

export const Route = createFileRoute("/forgot-password")({
  validateSearch: (search: Record<string, unknown>): { email?: string } => ({
    email: typeof search.email === "string" ? search.email : undefined,
  }),
  component: ForgotPasswordPage,
});

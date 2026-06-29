import { createFileRoute } from "@tanstack/react-router";
import CustomerRegistrationPage from "@/pages/auth/CustomerRegistrationPage";

export const Route = createFileRoute("/register")({
  validateSearch: (search: Record<string, unknown>) => ({
    ref: typeof search.ref === "string" ? search.ref : undefined,
    role:
      search.role === "owner" || search.role === "district_partner" || search.role === "customer"
        ? (search.role as "owner" | "district_partner" | "customer")
        : undefined,
  }),
  component: CustomerRegistrationPage,
});

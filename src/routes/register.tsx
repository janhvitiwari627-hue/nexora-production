import { createFileRoute } from "@tanstack/react-router";
import CustomerRegistrationPage from "@/pages/auth/CustomerRegistrationPage";

export const Route = createFileRoute("/register")({
  component: CustomerRegistrationPage,
});

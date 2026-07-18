import { createFileRoute } from "@tanstack/react-router";
import { AdminLoginPage } from "@/pages/admin/AdminLoginPage";
import { redirectIfSignedIn } from "@/lib/redirect-if-signed-in";

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  beforeLoad: redirectIfSignedIn,
  head: () => ({ meta: [{ title: "Admin Sign In — Nexora" }] }),
  component: AdminLoginPage,
});

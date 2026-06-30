import { createFileRoute } from "@tanstack/react-router";
import OwnerBusinessRegisterPage from "@/pages/auth/OwnerBusinessRegisterPage";

export const Route = createFileRoute("/owner/register-business")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Register your business — Nexora" },
      {
        name: "description",
        content: "Are you a salon owner? Register your shop and launch your website in minutes.",
      },
    ],
  }),
  component: OwnerBusinessRegisterPage,
});

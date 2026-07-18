import { createFileRoute } from "@tanstack/react-router";
import { CustomerAppShell } from "@/pages/customer/app/CustomerAppShell";

export const Route = createFileRoute("/app/customer")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Nexora Customer App" },
      {
        name: "description",
        content: "Search salons, book appointments and manage your Nexora customer account.",
      },
      { name: "theme-color", content: "#6d28d9" },
    ],
  }),
  component: CustomerAppShell,
});

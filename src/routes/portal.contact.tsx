import { createFileRoute } from "@tanstack/react-router";
import { PortalContactPage } from "@/pages/portal/SimplePages";

export const Route = createFileRoute("/portal/contact")({
  head: () => ({ meta: [{ title: "Contact — Nexora Portal" }] }),
  component: PortalContactPage,
});

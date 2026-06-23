import { createFileRoute } from "@tanstack/react-router";
import { SponsoredListingsPage } from "@/pages/portal/SimplePages";

export const Route = createFileRoute("/portal/sponsored")({
  head: () => ({ meta: [{ title: "Sponsored Listings — Nexora Portal" }] }),
  component: SponsoredListingsPage,
});

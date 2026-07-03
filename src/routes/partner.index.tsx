import { createFileRoute } from "@tanstack/react-router";
import { BecomePartnerPage } from "@/pages/public/BecomePartnerPage";

export const Route = createFileRoute("/partner/")({
  head: () => ({
    meta: [
      { title: "District Business Partner Program — Nexora SalonOS" },
      { name: "description", content: "Apne district ki beauty industry ko digital banaiye. Nexora's official District Business Partner Program — earn on every shop you onboard." },
      { property: "og:title", content: "District Business Partner Program — Nexora" },
      { property: "og:description", content: "Turn your existing salon-owner network into recurring monthly income with Nexora's District Business Partner Program." },
    ],
  }),
  component: BecomePartnerPage,
});

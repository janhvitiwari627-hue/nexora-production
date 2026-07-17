import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, IndianRupee, MapPinned, Settings, Store, Target } from "lucide-react";
import { RoleAppLandingPage } from "@/pages/public/RoleAppLandingPage";

export const Route = createFileRoute("/growth-partner-app")({
  head: () => ({ meta: [{ title: "Nexora Growth Partner App" }] }),
  component: GrowthPartnerAppPage,
});

function GrowthPartnerAppPage() {
  return (
    <RoleAppLandingPage
      kind="partner"
      eyebrow="Growth Partner App"
      title="Apne area ke salons ko digital banaiye."
      description="Leads, salon onboarding, training, milestones and commission ke liye ek focused partner app."
      startPath="/app/partner"
      audience="Nexora growth partners"
      features={[
        {
          icon: Target,
          title: "Lead pipeline",
          description: "New leads aur follow-up status ko track karein.",
        },
        {
          icon: Store,
          title: "Onboard salons",
          description: "Salon registration aur activation journey manage karein.",
        },
        {
          icon: MapPinned,
          title: "Area progress",
          description: "Assigned district aur local coverage dekhein.",
        },
        {
          icon: IndianRupee,
          title: "Commission",
          description: "Eligible earnings and payout history clearly dekhein.",
        },
        {
          icon: BookOpen,
          title: "Training",
          description: "Sales scripts, product knowledge and onboarding guides.",
        },
        {
          icon: Settings,
          title: "Partner settings",
          description: "Profile and payment preferences without clutter.",
        },
      ]}
    />
  );
}

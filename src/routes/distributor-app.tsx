import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Building2, Megaphone, Package, Target, Truck } from "lucide-react";
import { RoleAppLandingPage } from "@/pages/public/RoleAppLandingPage";

export const Route = createFileRoute("/distributor-app")({
  head: () => ({ meta: [{ title: "Nexora Distributor & Brand App" }] }),
  component: DistributorAppPage,
});

function DistributorAppPage() {
  return (
    <RoleAppLandingPage
      kind="distributor"
      eyebrow="Distributor & Brand App"
      title="Beauty trade network, ek focused app mein."
      description="Brands aur distributors product showcase, business profile, promotions and salon leads manage kar sakte hain."
      startPath="/portal"
      audience="beauty brands and distributors"
      features={[
        {
          icon: Building2,
          title: "Business profile",
          description: "Verified company details and service areas publish karein.",
        },
        {
          icon: Package,
          title: "Product showcase",
          description: "Professional catalogue salon buyers ke saamne rakhein.",
        },
        {
          icon: Target,
          title: "Salon leads",
          description: "Relevant buyer enquiries ko ek pipeline mein dekhein.",
        },
        {
          icon: Megaphone,
          title: "Promotions",
          description: "Offers and sponsored visibility manage karein.",
        },
        {
          icon: Truck,
          title: "Distribution reach",
          description: "Territory and availability clearly communicate karein.",
        },
        {
          icon: BarChart3,
          title: "Performance",
          description: "Profile views, enquiries and campaign activity dekhein.",
        },
      ]}
    />
  );
}

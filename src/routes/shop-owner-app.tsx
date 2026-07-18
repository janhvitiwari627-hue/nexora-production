import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck, IndianRupee, Scissors, Settings, Store, Users } from "lucide-react";
import { RoleAppLandingPage } from "@/pages/public/RoleAppLandingPage";

export const Route = createFileRoute("/shop-owner-app")({
  head: () => ({
    meta: [
      { title: "Nexora Shop Owner App" },
      {
        name: "description",
        content: "Manage your salon setup, services, bookings and business from one simple app.",
      },
    ],
  }),
  component: ShopOwnerAppPage,
});

function ShopOwnerAppPage() {
  return (
    <RoleAppLandingPage
      hideFooter
      kind="owner"
      eyebrow="Shop Owner App"
      title="Salon chalana ab simple hai."
      description="Bookings, services, salon profile, website and daily settings—owner ko sirf wahi tools dikhte hain jo business chalane ke liye zaroori hain."
      startPath="/app/owner"
      audience="salon owners and their business"
      features={[
        {
          icon: Store,
          title: "Salon setup",
          description: "Profile, timings, location and home service settings.",
        },
        {
          icon: CalendarCheck,
          title: "Bookings",
          description: "New requests dekhein, confirm karein ya new time suggest karein.",
        },
        {
          icon: Scissors,
          title: "Services",
          description: "Price, duration, image and availability manage karein.",
        },
        {
          icon: IndianRupee,
          title: "Payments",
          description: "Booking amount and payment status ko clearly track karein.",
        },
        {
          icon: Users,
          title: "Customers",
          description: "Repeat customers and appointment history ek jagah.",
        },
        {
          icon: Settings,
          title: "Simple settings",
          description: "No technical controls or complicated SaaS menus.",
        },
      ]}
    />
  );
}

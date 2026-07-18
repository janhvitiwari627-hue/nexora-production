import { CalendarCheck, Compass, Heart, MapPin, Search, Star } from "lucide-react";
import { RoleAppLandingPage } from "./RoleAppLandingPage";

export default function CustomerAppPage() {
  return (
    <RoleAppLandingPage
      kind="customer"
      eyebrow="Customer App"
      title="Salon discover karo. Appointment book karo."
      description="Nearby salons, active services, transparent prices and your bookings—customer ko सिर्फ उसका simple booking experience मिलता है."
      startPath="/app/customer"
      audience="salon customers"
      features={[
        {
          icon: Search,
          title: "Search salons",
          description: "Service, category and location के आधार पर salons खोजें.",
        },
        {
          icon: MapPin,
          title: "Nearby discovery",
          description: "Location, distance and salon details compare करें.",
        },
        {
          icon: CalendarCheck,
          title: "Fast booking",
          description: "Service, date and time चुनकर appointment request create करें.",
        },
        {
          icon: Compass,
          title: "Published websites",
          description: "Only active and published salon information देखें.",
        },
        {
          icon: Heart,
          title: "Your choices",
          description: "Bookings and preferred salons एक focused space में रखें.",
        },
        {
          icon: Star,
          title: "Trusted details",
          description: "Prices, duration and customer feedback booking से पहले देखें.",
        },
      ]}
    />
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck } from "lucide-react";
import { PlatformInfoPage } from "@/pages/public/PlatformInfoPage";

export const Route = createFileRoute("/booking-flow")({
  head: () => ({ meta: [{ title: "How Nexora Booking Works" }] }),
  component: BookingFlowExplanationPage,
});

function BookingFlowExplanationPage() {
  return (
    <PlatformInfoPage
      eyebrow="Booking Flow"
      title="Salon appointment book karna fast aur transparent hai."
      description="Customer published salon website se active service, date and time choose karta hai. Booking owner dashboard tak real time pahunchti hai."
      icon={CalendarCheck}
      action={{ label: "Explore salons", to: "/search" }}
      steps={[
        {
          title: "Select salon and service",
          description:
            "Published salon website par price and duration ke saath service choose karein.",
        },
        {
          title: "Choose date and time",
          description: "Available appointment date and preferred slot select karein.",
        },
        {
          title: "Enter contact details",
          description: "Name and mobile number enter karke appointment request create karein.",
        },
        {
          title: "Advance remains pending",
          description:
            "Booking pending_payment state mein बनती है; payment ko fake successful नहीं दिखाया जाता.",
        },
        {
          title: "Owner reviews booking",
          description: "Salon owner request dashboard mein dekhkar next action le sakta hai.",
        },
        {
          title: "Track your booking",
          description: "Customer same device se My Bookings mein status देख सकता है.",
        },
      ]}
    />
  );
}

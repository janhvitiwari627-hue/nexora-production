import { createFileRoute } from "@tanstack/react-router";
import { Crown } from "lucide-react";
import { PlatformInfoPage } from "@/pages/public/PlatformInfoPage";

export const Route = createFileRoute("/membership-rules")({
  head: () => ({ meta: [{ title: "Nexora Membership Rules" }] }),
  component: MembershipRulesPage,
});

function MembershipRulesPage() {
  return (
    <PlatformInfoPage
      eyebrow="Membership Rules"
      title="Membership benefits clear rules ke saath."
      description="Membership is a customer benefit program. Salon owners ke liye monthly SaaS subscription नहीं है; owner marketplace commission model पर काम करता है."
      icon={Crown}
      action={{ label: "View membership", to: "/membership" }}
      steps={[
        {
          title: "Eligibility",
          description:
            "Benefits केवल active membership और eligible salons/services पर apply होते हैं.",
        },
        {
          title: "Benefit display",
          description:
            "Applicable discount or perk booking से पहले customer को clearly दिखना चाहिए.",
        },
        {
          title: "No cash conversion",
          description: "Membership benefits cash balance या withdrawal amount नहीं हैं.",
        },
        {
          title: "Fair use",
          description: "Duplicate accounts, resale और fraudulent bookings permitted नहीं हैं.",
        },
        {
          title: "Cancellation",
          description:
            "Cancellation and refunds purchased plan conditions और applicable law के अनुसार process होते हैं.",
        },
        {
          title: "Owner model",
          description:
            "Salon owner से monthly subscription नहीं; successful completed booking पर platform commission लागू हो सकता है.",
        },
      ]}
    />
  );
}

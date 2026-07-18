import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw } from "lucide-react";
import { PlatformInfoPage } from "@/pages/public/PlatformInfoPage";

export const Route = createFileRoute("/refund-cancellation")({
  head: () => ({ meta: [{ title: "Refund & Cancellation Policy — Nexora" }] }),
  component: RefundCancellationPage,
});

function RefundCancellationPage() {
  return (
    <PlatformInfoPage
      eyebrow="Refund & Cancellation"
      title="Cancellation और refund status हमेशा visible रहेगा."
      description="Eligibility booking status, cancellation time, salon confirmation and actual payment record पर depend करती है."
      icon={RotateCcw}
      steps={[
        {
          title: "Before confirmation",
          description:
            "Pending request cancel होने पर captured payment न हो तो refund due नहीं बनता.",
        },
        {
          title: "After payment",
          description:
            "Paid booking cancellation के लिए applicable window और salon policy check की जाती है.",
        },
        {
          title: "Salon cancellation",
          description:
            "Salon service provide नहीं कर पाता तो eligible paid amount original method पर refund process होता है.",
        },
        {
          title: "Processing time",
          description:
            "Approved refund payment provider और bank processing time के अनुसार दिखाई देगा.",
        },
        {
          title: "Dispute support",
          description:
            "Booking reference, payment reference and issue details Help Center में submit करें.",
        },
        {
          title: "No false status",
          description: "Payment captured हुए बिना system paid या refunded status नहीं दिखाएगा.",
        },
      ]}
      notes={[
        "Exact refund eligibility booking पर दिखाई गई cancellation terms के अनुसार होगी.",
        "UPI or bank processing delays Nexora approval के बाद भी हो सकते हैं.",
      ]}
    />
  );
}

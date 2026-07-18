import { createFileRoute } from "@tanstack/react-router";
import { QrCode } from "lucide-react";
import { PlatformInfoPage } from "@/pages/public/PlatformInfoPage";

export const Route = createFileRoute("/qr-payments")({
  head: () => ({ meta: [{ title: "Nexora QR Payment Guide" }] }),
  component: QrPaymentPage,
});

function QrPaymentPage() {
  return (
    <PlatformInfoPage
      eyebrow="QR Payment"
      title="Scan, verify, then pay."
      description="Nexora payment screen ka उद्देश्य amount, salon and booking reference को payment से पहले स्पष्ट दिखाना है."
      icon={QrCode}
      steps={[
        {
          title: "Open verified booking",
          description: "QR केवल सही salon और booking reference वाले payment screen से open करें.",
        },
        {
          title: "Check amount",
          description: "Total, advance and remaining amount payment से पहले verify करें.",
        },
        {
          title: "Scan using UPI app",
          description: "अपनी पसंद का supported UPI app use करके QR scan करें.",
        },
        {
          title: "Wait for confirmation",
          description:
            "UPI app success और Nexora status दोनों check करें; screenshot alone final confirmation नहीं है.",
        },
      ]}
      notes={[
        "P1 booking flow कोई payment success fake नहीं करता; advance status pending रहता है.",
        "Never share OTP, UPI PIN or banking password with salon staff or Nexora support.",
        "Payment issue होने पर booking reference के साथ Help Center से contact करें.",
      ]}
    />
  );
}

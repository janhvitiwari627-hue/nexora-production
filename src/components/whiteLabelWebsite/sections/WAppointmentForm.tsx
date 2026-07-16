import type { ShopData } from "../types";
import type { TemplateConfig } from "../templates";
import { SectionTitle } from "./WServices";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Calendar, Share2, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function WAppointmentForm({ shop, template }: { shop: ShopData; template: TemplateConfig }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "https://meripahalfasthelp.online";
    const url = `${origin}/site/${shop.slug}`;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: shop.name, text: shop.tagline ?? shop.name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Website link copied", { description: url });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // User cancelled share sheet — not an error worth surfacing.
      if (err instanceof Error && err.name === "AbortError") return;
      toast.error("Could not copy link", { description: "Please copy it manually from the address bar." });
    }
  };

  return (
    <section
      id="appointment"
      className="px-6 py-16 md:px-12"
      style={{ backgroundColor: `${template.colors.primary}10` }}
    >
      <SectionTitle font={template.font}>Book An Appointment</SectionTitle>
      <div className="mx-auto mt-8 grid max-w-2xl gap-4 text-center">
        <p className="text-muted-foreground">
          Choose your services, staff and time slot in our secure booking flow.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="inline-flex items-center gap-2"
            style={{
              backgroundColor: template.colors.primary,
              color: "white",
              borderRadius: template.radius,
            }}
          >
            <Link to="/site/$slug_/book" params={{ slug_: shop.slug }} search={{ service: undefined }}>
              <Calendar className="h-4 w-4" /> Start Booking
            </Link>
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            onClick={handleShare}
            aria-label="Share website link"
            className="inline-flex items-center gap-2"
            style={{
              borderColor: template.colors.primary,
              color: template.colors.primary,
              borderRadius: template.radius,
            }}
          >
            {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            {copied ? "Link copied" : "Share website"}
          </Button>
        </div>
      </div>
    </section>
  );
}

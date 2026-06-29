import type { ShopData } from "../types";
import type { TemplateConfig } from "../templates";
import { SectionTitle } from "./WServices";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Calendar } from "lucide-react";

export function WAppointmentForm({ shop, template }: { shop: ShopData; template: TemplateConfig }) {
  return (
    <section id="appointment" className="px-6 py-16 md:px-12" style={{ backgroundColor: `${template.colors.primary}10` }}>
      <SectionTitle font={template.font}>Book An Appointment</SectionTitle>
      <div className="mx-auto mt-8 grid max-w-2xl gap-4 text-center">
        <p className="text-muted-foreground">
          Choose your services, staff and time slot in our secure booking flow.
        </p>
        <Button
          asChild
          size="lg"
          className="mx-auto inline-flex items-center gap-2"
          style={{ backgroundColor: template.colors.primary, color: "white", borderRadius: template.radius }}
        >
          <Link to="/book/$slug" params={{ slug: shop.slug }}>
            <Calendar className="h-4 w-4" /> Start Booking
          </Link>
        </Button>
      </div>
    </section>
  );
}

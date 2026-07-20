import type { ShopData } from "../types";
import type { TemplateConfig } from "../templates";
import { SectionTitle } from "./WServices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, MessageCircle, Navigation, Phone } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export function WContact({ shop, template }: { shop: ShopData; template: TemplateConfig }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const phoneDigits = shop.phone.replace(/\D/g, "");
  const waDigits = shop.whatsapp.replace(/\D/g, "");
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${shop.location.lat},${shop.location.lng}`;

  const actions = [
    { icon: Phone, label: "Call", href: `tel:${phoneDigits}`, color: template.colors.primary },
    { icon: MessageCircle, label: "WhatsApp", href: `https://wa.me/${waDigits}`, color: "#25D366" },
    {
      icon: Navigation,
      label: "Directions",
      href: directionsUrl,
      color: template.colors.secondary,
    },
    {
      icon: Mail,
      label: "Email",
      href: `mailto:${shop.email ?? ""}`,
      color: template.colors.secondary,
      disabled: !shop.email,
    },
  ];

  return (
    <section id="contact" className="px-6 py-16 md:px-12">
      <SectionTitle font={template.headingFont}>Get In Touch</SectionTitle>
      <div className="mx-auto mt-8 grid max-w-5xl gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {actions.map((a) => (
              <a
                key={a.label}
                href={a.disabled ? undefined : a.href}
                target={a.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                aria-disabled={a.disabled}
                className={`group flex flex-col items-center gap-1 rounded-xl border bg-white p-3 text-center shadow-sm transition ${a.disabled ? "pointer-events-none opacity-50" : "hover:-translate-y-0.5 hover:shadow-md"}`}
                style={{ borderRadius: template.radius }}
              >
                <span
                  className="grid h-9 w-9 place-items-center rounded-full text-white"
                  style={{ backgroundColor: a.color }}
                >
                  <a.icon className="h-4 w-4" />
                </span>
                <span className="text-[11px] font-medium">{a.label}</span>
              </a>
            ))}
          </div>
          <Info icon={<MapPin className="h-5 w-5" />} label="Visit Us" value={shop.address} />
          <Info icon={<Phone className="h-5 w-5" />} label="Call" value={shop.phone} />
          {shop.email && (
            <Info icon={<Mail className="h-5 w-5" />} label="Email" value={shop.email} />
          )}
        </div>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Message sent");
            setForm({ name: "", email: "", message: "" });
          }}
        >
          <Input
            placeholder="Your name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            maxLength={100}
          />
          <Input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            maxLength={255}
          />
          <Textarea
            placeholder="Message"
            rows={4}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            required
            maxLength={1000}
          />
          <Button
            type="submit"
            className="w-full"
            style={{ backgroundColor: template.colors.primary, borderRadius: template.radius }}
          >
            Send Message
          </Button>
        </form>
      </div>
    </section>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <div className="text-primary">{icon}</div>
      <div>
        <div className="text-muted-foreground text-xs uppercase tracking-wider">{label}</div>
        <div className="font-medium">{value}</div>
      </div>
    </div>
  );
}

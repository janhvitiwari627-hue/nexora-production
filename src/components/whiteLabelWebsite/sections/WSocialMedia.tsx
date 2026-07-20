import type { ShopData } from "../types";
import type { TemplateConfig } from "../templates";
import { SectionTitle } from "./WServices";
import { Facebook, Instagram, Linkedin, MessageCircle, Send, Twitter, Youtube } from "lucide-react";

const PLATFORMS = [
  { key: "instagram", label: "Instagram", icon: Instagram, color: "#E4405F" },
  { key: "facebook", label: "Facebook", icon: Facebook, color: "#1877F2" },
  { key: "youtube", label: "YouTube", icon: Youtube, color: "#FF0000" },
  { key: "twitter", label: "X / Twitter", icon: Twitter, color: "#000000" },
  { key: "linkedin", label: "LinkedIn", icon: Linkedin, color: "#0A66C2" },
  { key: "pinterest", label: "Pinterest", icon: Send, color: "#E60023" },
  { key: "threads", label: "Threads", icon: MessageCircle, color: "#000000" },
  { key: "telegram", label: "Telegram", icon: Send, color: "#26A5E4" },
  { key: "whatsappChannel", label: "WhatsApp Channel", icon: MessageCircle, color: "#25D366" },
] as const;

export function WSocialMedia({ shop, template }: { shop: ShopData; template: TemplateConfig }) {
  const links = shop.socialLinks ?? {};
  const active = PLATFORMS.filter((p) => links[p.key]);
  if (active.length === 0) return null;
  return (
    <section id="social" className="bg-muted/30 px-6 py-16 md:px-12">
      <SectionTitle font={template.headingFont}>Follow & Connect</SectionTitle>
      <p className="text-muted-foreground mt-2 text-center text-sm">
        Daily inspiration on every channel.
      </p>
      <div className="mx-auto mt-8 grid max-w-4xl grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-9">
        {active.map((p) => (
          <a
            key={p.key}
            href={links[p.key]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={p.label}
            className="group flex flex-col items-center gap-1.5 rounded-xl border bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            style={{ borderRadius: template.radius }}
          >
            <span
              className="grid h-10 w-10 place-items-center rounded-full text-white transition-transform group-hover:scale-110"
              style={{ backgroundColor: p.color }}
            >
              <p.icon className="h-4 w-4" />
            </span>
            <span className="text-[10px] font-medium">{p.label}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

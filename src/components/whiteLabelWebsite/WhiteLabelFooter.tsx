import type { ShopData, WebsiteConfig } from "./types";
import type { TemplateConfig } from "./templates";
import {
  Facebook, Instagram, Linkedin, MapPin, MessageCircle, Phone, Send, Twitter, Youtube,
} from "lucide-react";

const ICONS = {
  instagram: Instagram, facebook: Facebook, youtube: Youtube, twitter: Twitter,
  linkedin: Linkedin, pinterest: Send, threads: MessageCircle, telegram: Send,
  whatsappChannel: MessageCircle, whatsapp: MessageCircle,
} as const;

export function WhiteLabelFooter({
  shop, config, template,
}: { shop: ShopData; config: WebsiteConfig; template: TemplateConfig }) {
  const isRich = template.footer === "rich";
  const social = { ...config.socialLinks, ...shop.socialLinks } as Record<string, string | undefined>;
  return (
    <footer className="bg-slate-900 px-6 py-12 text-slate-300 md:px-12">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="text-xl font-bold text-white" style={{ fontFamily: template.headingFont }}>
            {shop.name}
          </div>
          <p className="mt-2 max-w-md text-sm opacity-80">{shop.tagline}</p>
          {isRich && (
            <div className="mt-4 space-y-1 text-sm">
              <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4" /> {shop.address}</p>
              <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> {shop.phone}</p>
            </div>
          )}
        </div>
        <div>
          <div className="mb-2 text-sm font-semibold text-white">Explore</div>
          <ul className="space-y-1 text-sm opacity-90">
            <li><a href="#services" className="hover:underline">Services</a></li>
            <li><a href="#rate-card" className="hover:underline">Rate Card</a></li>
            <li><a href="#packages" className="hover:underline">Packages</a></li>
            <li><a href="#membership" className="hover:underline">Membership</a></li>
            <li><a href="#blog" className="hover:underline">Blog</a></li>
            <li><a href="#contact" className="hover:underline">Contact</a></li>
          </ul>
        </div>
        <div>
          <div className="mb-2 text-sm font-semibold text-white">Connect</div>
          <div className="flex flex-wrap gap-3">
            {Object.entries(social).map(([key, url]) => {
              if (!url) return null;
              const Icon = (ICONS as Record<string, typeof Instagram | undefined>)[key] ?? Send;
              return (
                <a
                  key={key}
                  href={url}
                  aria-label={key}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid h-9 w-9 place-items-center rounded-full bg-slate-800 transition hover:bg-slate-700"
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-6xl border-t border-slate-700 pt-6 text-center text-xs opacity-60">
        © {new Date().getFullYear()} {shop.name} · Powered by{" "}
        <a href="/" className="underline">Nexora SalonOS</a>
      </div>
    </footer>
  );
}

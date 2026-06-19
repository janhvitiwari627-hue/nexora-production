import type { ShopData, WebsiteConfig } from "./types";
import type { TemplateConfig } from "./templates";
import { Facebook, Instagram, MapPin, MessageCircle, Phone } from "lucide-react";

export function WhiteLabelFooter({ shop, config, template }: { shop: ShopData; config: WebsiteConfig; template: TemplateConfig }) {
  const isRich = template.footer === "rich";
  return (
    <footer className="bg-slate-900 px-6 py-12 text-slate-300 md:px-12">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
        <div>
          <div className="text-xl font-bold text-white" style={{ fontFamily: template.font }}>{shop.name}</div>
          <p className="mt-2 text-sm opacity-80">{shop.tagline}</p>
        </div>
        {isRich && (
          <div>
            <div className="mb-2 text-sm font-semibold text-white">Contact</div>
            <p className="flex items-start gap-2 text-sm"><MapPin className="mt-0.5 h-4 w-4" /> {shop.address}</p>
            <p className="mt-1 flex items-center gap-2 text-sm"><Phone className="h-4 w-4" /> {shop.phone}</p>
          </div>
        )}
        <div>
          <div className="mb-2 text-sm font-semibold text-white">Connect</div>
          <div className="flex gap-3">
            {config.socialLinks.instagram && <a href={config.socialLinks.instagram} aria-label="Instagram" target="_blank" rel="noopener noreferrer"><Instagram className="h-5 w-5" /></a>}
            {config.socialLinks.facebook && <a href={config.socialLinks.facebook} aria-label="Facebook" target="_blank" rel="noopener noreferrer"><Facebook className="h-5 w-5" /></a>}
            {config.socialLinks.whatsapp && <a href={config.socialLinks.whatsapp} aria-label="WhatsApp" target="_blank" rel="noopener noreferrer"><MessageCircle className="h-5 w-5" /></a>}
          </div>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-6xl border-t border-slate-700 pt-6 text-center text-xs opacity-60">
        © {new Date().getFullYear()} {shop.name} · Powered by <a href="/" className="underline">Nexora SalonOS</a>
      </div>
    </footer>
  );
}

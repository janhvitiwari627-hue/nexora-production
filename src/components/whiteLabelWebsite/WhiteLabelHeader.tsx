import type { ShopData } from "./types";
import type { TemplateConfig } from "./templates";
import { Button } from "@/components/ui/button";

export function WhiteLabelHeader({ shop, template }: { shop: ShopData; template: TemplateConfig }) {
  const variant = template.header;
  const links = [
    { href: "#services", label: "Services" },
    { href: "#appointment", label: "Book" },
    { href: "#contact", label: "Contact" },
  ];
  return (
    <header className={`sticky top-0 z-30 flex items-center justify-between gap-4 border-b bg-white/80 px-6 py-3 backdrop-blur md:px-12 ${variant === "bold" ? "py-5" : ""}`}>
      <a href="#" className="flex items-center gap-2 font-bold" style={{ fontFamily: template.font }}>
        <span className="grid h-8 w-8 place-items-center rounded-full text-white" style={{ backgroundColor: template.colors.primary }}>{shop.name[0]}</span>
        <span className={variant === "elegant" ? "text-xl tracking-wide" : "text-base"}>{shop.name}</span>
      </a>
      <nav className="hidden items-center gap-6 text-sm md:flex">
        {links.map(l => <a key={l.href} href={l.href} className="hover:underline">{l.label}</a>)}
      </nav>
      <Button size="sm" style={{ backgroundColor: template.colors.primary, borderRadius: template.radius }} asChild>
        <a href="#appointment">Book Now</a>
      </Button>
    </header>
  );
}

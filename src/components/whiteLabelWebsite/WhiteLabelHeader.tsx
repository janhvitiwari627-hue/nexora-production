import { Link } from "@tanstack/react-router";
import type { ShopData } from "./types";
import type { TemplateConfig } from "./templates";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const LINKS = [
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#rate-card", label: "Rate Card" },
  { href: "#packages", label: "Packages" },
  { href: "#staff", label: "Staff" },
  { href: "#membership", label: "Membership" },
  { href: "#blog", label: "Blog" },
  { href: "#contact", label: "Contact" },
];

export function WhiteLabelHeader({ shop, template }: { shop: ShopData; template: TemplateConfig }) {
  const variant = template.header;
  const [open, setOpen] = useState(false);

  const isDark = template.key === "royal-luxe";
  const headerBg = isDark
    ? "rgba(11,11,11,0.92)"
    : variant === "elegant"
    ? "rgba(255,255,255,0.9)"
    : variant === "bold"
    ? "#ffffff"
    : "rgba(255,255,255,0.7)";
  const headerClass =
    variant === "elegant"
      ? `border-b backdrop-blur ${isDark ? "border-amber-500/30" : "border-amber-200/40"}`
      : variant === "bold"
      ? "border-b-2"
      : "backdrop-blur-lg";

  return (
    <header
      className={`sticky top-0 z-30 ${headerClass}`}
      style={{
        backgroundColor: headerBg,
        color: template.colors.text,
        ...(variant === "bold" ? { borderColor: template.colors.primary } : {}),
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3 md:px-10">
        <Link
          to="/site/$businessSlug"
          params={{ businessSlug: shop.slug }}
          className="flex items-center gap-2 font-bold"
          style={{ fontFamily: template.headingFont }}
        >
          <span
            className="grid h-9 w-9 place-items-center rounded-full text-white shadow"
            style={{ backgroundColor: template.colors.primary }}
          >
            {shop.name[0]}
          </span>
          <span className={variant === "elegant" ? "text-xl tracking-wide" : "text-base font-extrabold uppercase tracking-wide"}>
            {shop.name}
          </span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="hover:underline" style={{ color: template.colors.text }}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="hidden md:inline-flex"
            style={{ backgroundColor: template.colors.primary, color: "white", borderRadius: template.radius }}
            asChild
          >
            <Link to="/site/$slug_/book" params={{ slug: shop.slug }} search={{ service: undefined }}>Book Now</Link>
          </Button>
          <button
            type="button"
            className="md:hidden"
            aria-label="Open menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t md:hidden" style={{ backgroundColor: headerBg, color: template.colors.text }}>
          <nav className="grid gap-1 px-6 py-3">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-md px-2 py-2 text-sm hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <Button
              className="mt-2"
              style={{ backgroundColor: template.colors.primary, color: "white", borderRadius: template.radius }}
              asChild
            >
              <Link to="/site/$slug_/book" params={{ slug: shop.slug }} search={{ service: undefined }} onClick={() => setOpen(false)}>Book Now</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}

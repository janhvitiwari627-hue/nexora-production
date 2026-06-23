import type { SectionId } from "../types";

export type TemplateKey = "royal-luxe" | "modern-salon" | "professional-beauty";

export interface TemplateConfig {
  key: TemplateKey;
  name: string;
  tagline: string;
  themeType: string;
  hero: "video" | "split" | "beautyBanner";
  header: "elegant" | "bold" | "minimal";
  footer: "rich" | "compact";
  font: string;
  headingFont: string;
  radius: string;
  cardStyle: "ornate" | "sharp" | "soft";
  animation: "fade" | "slide" | "scale";
  gallery: "masonry" | "grid" | "portfolio";
  colors: { primary: string; secondary: string; accent: string; bg: string; card: string; text: string };
  sectionOrder: SectionId[];
  bestFor: string[];
  features: string[];
}

export const TEMPLATES: Record<TemplateKey, TemplateConfig> = {
  "royal-luxe": {
    key: "royal-luxe",
    name: "Royal Luxe",
    tagline: "Luxury Black Gold · Premium Salon · High-End Spa",
    themeType: "Luxury Black Gold",
    hero: "video",
    header: "elegant",
    footer: "rich",
    font: "'Cormorant Garamond', 'Playfair Display', serif",
    headingFont: "'Playfair Display', serif",
    radius: "0.5rem",
    cardStyle: "ornate",
    animation: "fade",
    gallery: "masonry",
    colors: { primary: "#D4AF37", secondary: "#F5E6C8", accent: "#B8932F", bg: "#0B0B0B", card: "#161616", text: "#FFFFFF" },
    sectionOrder: ["hero", "services", "staff", "beforeAfter", "packages", "membership", "reviews", "offers", "blog", "contact", "appointment", "whatsapp", "bookingBar"],
    bestFor: ["Premium Salon", "Luxury Spa", "High-End Beauty Parlour"],
    features: ["Glassmorphism", "Luxury Animations", "Premium Feel", "Video Background"],
  },
  "modern-salon": {
    key: "modern-salon",
    name: "Modern Salon",
    tagline: "Modern Professional · Clean UI · Fast Booking",
    themeType: "Modern Professional",
    hero: "split",
    header: "bold",
    footer: "compact",
    font: "'Inter', system-ui, sans-serif",
    headingFont: "'Inter', system-ui, sans-serif",
    radius: "0.75rem",
    cardStyle: "sharp",
    animation: "slide",
    gallery: "grid",
    colors: { primary: "#8B5CF6", secondary: "#EC4899", accent: "#F5D0FE", bg: "#FFFFFF", card: "#F8FAFC", text: "#111827" },
    sectionOrder: ["hero", "services", "staff", "gallery", "reviews", "offers", "contact", "appointment", "whatsapp", "bookingBar"],
    bestFor: ["Salon", "Barber Shop", "Beauty Parlour"],
    features: ["Modern Cards", "Clean UI", "Fast Booking CTA", "Mobile First"],
  },
  "professional-beauty": {
    key: "professional-beauty",
    name: "Professional Beauty",
    tagline: "Elegant Beauty · Portfolio Showcase · Specialist Led",
    themeType: "Elegant Beauty",
    hero: "beautyBanner",
    header: "minimal",
    footer: "rich",
    font: "'Lora', Georgia, serif",
    headingFont: "'Playfair Display', 'Lora', serif",
    radius: "1.5rem",
    cardStyle: "soft",
    animation: "scale",
    gallery: "portfolio",
    colors: { primary: "#E11D48", secondary: "#F9A8D4", accent: "#FFE4EC", bg: "#FFFDFD", card: "#FFFFFF", text: "#1F2937" },
    sectionOrder: ["hero", "services", "staff", "gallery", "packages", "reviews", "faq", "contact", "appointment", "whatsapp", "bookingBar"],
    bestFor: ["Makeup Artist", "Nail Studio", "Beauty Experts"],
    features: ["Elegant Design", "Beauty Industry Focused", "Portfolio Showcase"],
  },
};

export const TEMPLATE_KEYS = ["royal-luxe", "modern-salon", "professional-beauty"] as const;

export const TEMPLATE_ALIASES: Record<string, TemplateKey> = {
  RoyalLuxe: "royal-luxe",
  UrbanPro: "modern-salon",
  BeautyBlossom: "professional-beauty",
  "luxury-spa": "royal-luxe",
};

export const normalizeTemplateKey = (key?: string | null): TemplateKey => {
  if (!key) return "royal-luxe";
  if ((TEMPLATE_KEYS as readonly string[]).includes(key)) return key as TemplateKey;
  return TEMPLATE_ALIASES[key] ?? "royal-luxe";
};

export const getTemplate = (key?: string | null): TemplateConfig => TEMPLATES[normalizeTemplateKey(key)];

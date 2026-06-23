import type { SectionId } from "../types";

export interface TemplateConfig {
  key: "RoyalLuxe" | "UrbanPro" | "BeautyBlossom";
  name: string;
  tagline: string;
  hero: "video" | "split" | "fullBleed";
  header: "elegant" | "bold" | "minimal";
  footer: "rich" | "compact";
  font: string;
  headingFont: string;
  radius: string;
  cardStyle: "ornate" | "sharp" | "soft";
  animation: "fade" | "slide" | "scale";
  gallery: "masonry" | "grid" | "carousel";
  colors: { primary: string; secondary: string; accent: string; bg: string; text: string };
  sectionOrder?: SectionId[];
}

export const TEMPLATES: Record<string, TemplateConfig> = {
  RoyalLuxe: {
    key: "RoyalLuxe",
    name: "Royal Luxe",
    tagline: "Elegant · Premium · Timeless",
    hero: "video",
    header: "elegant",
    footer: "rich",
    font: "'Cormorant Garamond', 'Playfair Display', serif",
    headingFont: "'Playfair Display', serif",
    radius: "0.5rem",
    cardStyle: "ornate",
    animation: "fade",
    gallery: "masonry",
    colors: { primary: "#0A0A0A", secondary: "#D4AF37", accent: "#F5E6C8", bg: "#FAF7F2", text: "#1A1A1A" },
  },
  UrbanPro: {
    key: "UrbanPro",
    name: "Urban Pro",
    tagline: "Bold · Modern · Energetic",
    hero: "split",
    header: "bold",
    footer: "compact",
    font: "'Inter', system-ui, sans-serif",
    headingFont: "'Oswald', 'Inter', sans-serif",
    radius: "0.25rem",
    cardStyle: "sharp",
    animation: "slide",
    gallery: "grid",
    colors: { primary: "#E11D2E", secondary: "#0F172A", accent: "#FACC15", bg: "#FFFFFF", text: "#0F172A" },
  },
  BeautyBlossom: {
    key: "BeautyBlossom",
    name: "Beauty Blossom",
    tagline: "Soft · Feminine · Joyful",
    hero: "fullBleed",
    header: "minimal",
    footer: "rich",
    font: "'Quicksand', 'Nunito', sans-serif",
    headingFont: "'Quicksand', sans-serif",
    radius: "1.5rem",
    cardStyle: "soft",
    animation: "scale",
    gallery: "carousel",
    colors: { primary: "#F472B6", secondary: "#B76E79", accent: "#FCE7F3", bg: "#FFF7FB", text: "#3F1E2E" },
  },
};

export const TEMPLATE_KEYS = ["RoyalLuxe", "UrbanPro", "BeautyBlossom"] as const;

export const getTemplate = (key?: string): TemplateConfig =>
  (key && TEMPLATES[key]) || TEMPLATES.RoyalLuxe;

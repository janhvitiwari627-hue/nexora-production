import type { SectionId } from "../types";

export interface TemplateConfig {
  name: string;
  hero: "split" | "centered" | "fullBleed" | "video";
  header: "minimal" | "bold" | "elegant";
  footer: "compact" | "rich";
  font: string;
  radius: string;
  colors: { primary: string; secondary: string };
  sectionOrder?: SectionId[];
}

export const TEMPLATES: Record<string, TemplateConfig> = {
  RoyalLuxe:     { name: "Royal Luxe",     hero: "video",     header: "elegant", footer: "rich",    font: "Playfair Display", radius: "0.5rem",  colors: { primary: "#0A0A0A", secondary: "#D4AF37" } },
  UrbanPro:      { name: "Urban Pro",      hero: "split",     header: "bold",    footer: "compact", font: "Inter",            radius: "0.25rem", colors: { primary: "#E11D2E", secondary: "#1F2937" } },
  BeautyBlossom: { name: "Beauty Blossom", hero: "fullBleed", header: "minimal", footer: "rich",    font: "Quicksand",        radius: "1.5rem",  colors: { primary: "#F472B6", secondary: "#B76E79" } },
  DarkPrestige:  { name: "Dark Prestige",  hero: "fullBleed", header: "bold",    footer: "compact", font: "Inter",            radius: "0.5rem",  colors: { primary: "#0F172A", secondary: "#D4AF37" } },
  MinimalZen:    { name: "Minimal Zen",    hero: "split",     header: "minimal", footer: "compact", font: "Inter",            radius: "0",       colors: { primary: "#0F172A", secondary: "#64748B" } },
  SpaSerenity:   { name: "Spa Serenity",   hero: "centered",  header: "minimal", footer: "rich",    font: "Lora",             radius: "2rem",    colors: { primary: "#14B8A6", secondary: "#A7F3D0" } },
  TattooInk:     { name: "Tattoo Ink",     hero: "fullBleed", header: "bold",    footer: "rich",    font: "Oswald",           radius: "0",       colors: { primary: "#000000", secondary: "#EF4444" } },
  BarberElite:   { name: "Barber Elite",   hero: "split",     header: "bold",    footer: "compact", font: "Oswald",           radius: "0.25rem", colors: { primary: "#111827", secondary: "#B45309" } },
  BridalLuxury:  { name: "Bridal Luxury",  hero: "centered",  header: "elegant", footer: "rich",    font: "Playfair Display", radius: "1rem",    colors: { primary: "#9F1239", secondary: "#FBBF24" } },
  NexoraPremium: { name: "Nexora Premium", hero: "split",     header: "minimal", footer: "rich",    font: "Inter",            radius: "1rem",    colors: { primary: "#635BFF", secondary: "#0EA5E9" } },
};

export const getTemplate = (key: string): TemplateConfig => TEMPLATES[key] ?? TEMPLATES.NexoraPremium;

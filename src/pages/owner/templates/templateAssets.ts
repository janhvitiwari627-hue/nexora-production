import royalLuxeDesktop from "@/assets/templates/royal-luxe-desktop.jpg";
import urbanProDesktop from "@/assets/templates/urban-pro-desktop.jpg";
import professionalBeautyDesktop from "@/assets/templates/professional-beauty-desktop.jpg";

export type TemplateAsset = {
  preview: string;
  bestFor: string[];
  tags: string[];
  features: string[];
};

export const TEMPLATE_ASSETS: Record<string, TemplateAsset> = {
  "royal-luxe": {
    preview: royalLuxeDesktop,
    bestFor: ["Luxury Salon", "Premium Spa", "High-End Beauty Parlour"],
    tags: ["Luxury", "Premium", "Spa", "Mobile Ready"],
    features: [
      "Hero",
      "Services",
      "Staff",
      "Gallery",
      "Reviews",
      "Offers",
      "Booking",
      "WhatsApp",
      "Google Maps",
    ],
  },
  "modern-salon": {
    preview: urbanProDesktop,
    bestFor: ["Barber Shop", "Men's Salon", "Hair Studio"],
    tags: ["Modern", "Barber", "Fast Booking", "Mobile Ready"],
    features: ["Hero", "Services", "Staff", "Reviews", "Booking", "WhatsApp", "Google Maps"],
  },
  "professional-beauty": {
    preview: professionalBeautyDesktop,
    bestFor: ["Makeup Artist", "Nail Studio", "Beauty Experts"],
    tags: ["Beauty", "Elegant", "Portfolio", "Mobile Ready"],
    features: ["Hero", "Services", "Staff", "Gallery", "Reviews", "Booking", "WhatsApp"],
  },
};

export function getTemplateAsset(key?: string | null): TemplateAsset | null {
  if (!key) return null;
  return TEMPLATE_ASSETS[key] ?? null;
}

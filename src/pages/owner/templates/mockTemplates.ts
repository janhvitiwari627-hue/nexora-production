export type Template = {
  id: string;
  name: string;
  category: string[];
  screenshot: string;
  demoUrl: string;
  description: string;
};

export const TEMPLATE_CATEGORIES = [
  "All", "Salon", "Spa", "Tattoo", "Barber", "Bridal", "Nails", "Wellness",
];

export const TEMPLATES: Template[] = [
  {
    id: "elegant-studio",
    name: "Elegant Studio",
    category: ["Salon", "Bridal"],
    screenshot: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=70",
    demoUrl: "https://example.com/demo/elegant-studio",
    description: "Editorial typography, generous whitespace, gold accents.",
  },
  {
    id: "urban-barber",
    name: "Urban Barber",
    category: ["Barber"],
    screenshot: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&q=70",
    demoUrl: "https://example.com/demo/urban-barber",
    description: "Bold dark theme with vintage barbershop vibe.",
  },
  {
    id: "serene-spa",
    name: "Serene Spa",
    category: ["Spa", "Wellness"],
    screenshot: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=70",
    demoUrl: "https://example.com/demo/serene-spa",
    description: "Calm palette, soft gradients, mindful spacing.",
  },
  {
    id: "ink-canvas",
    name: "Ink Canvas",
    category: ["Tattoo"],
    screenshot: "https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?w=1200&q=70",
    demoUrl: "https://example.com/demo/ink-canvas",
    description: "Gallery-first layout to showcase artist portfolios.",
  },
  {
    id: "bridal-bloom",
    name: "Bridal Bloom",
    category: ["Bridal", "Salon"],
    screenshot: "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=1200&q=70",
    demoUrl: "https://example.com/demo/bridal-bloom",
    description: "Romantic florals with cinematic hero video support.",
  },
  {
    id: "nail-atelier",
    name: "Nail Atelier",
    category: ["Nails", "Salon"],
    screenshot: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&q=70",
    demoUrl: "https://example.com/demo/nail-atelier",
    description: "Playful pastels and grid-based service showcase.",
  },
];

export const CURRENT_TEMPLATE_ID = "elegant-studio";

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
    id: "RoyalLuxe",
    name: "Royal Luxe",
    category: ["Salon", "Spa", "Bridal", "Wellness"],
    screenshot: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=70",
    demoUrl: "/site/luxe-hair-spa",
    description: "Luxury black & gold. Full-screen video hero, glassmorphism cards, premium animations. Rolex × Taj Hotel energy.",
  },
  {
    id: "UrbanPro",
    name: "Urban Pro",
    category: ["Barber", "Salon"],
    screenshot: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&q=70",
    demoUrl: "/site/luxe-hair-spa",
    description: "Bold red & white. Service-first layout, fast booking focus, modern cards. Uber × Urban Company energy.",
  },
  {
    id: "BeautyBlossom",
    name: "Beauty Blossom",
    category: ["Salon", "Bridal", "Nails"],
    screenshot: "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=1200&q=70",
    demoUrl: "/site/luxe-hair-spa",
    description: "Soft pink & rose gold. Instagram-style visual portfolio, elegant typography. Nykaa × Sephora energy.",
  },
  {
    id: "serene-spa",
    name: "Serene Spa",
    category: ["Spa", "Wellness"],
    screenshot: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=70",
    demoUrl: "/site/luxe-hair-spa",
    description: "Calm palette, soft gradients, mindful spacing.",
  },
  {
    id: "ink-canvas",
    name: "Ink Canvas",
    category: ["Tattoo"],
    screenshot: "https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?w=1200&q=70",
    demoUrl: "/site/luxe-hair-spa",
    description: "Gallery-first layout to showcase artist portfolios.",
  },
  {
    id: "nail-atelier",
    name: "Nail Atelier",
    category: ["Nails", "Salon"],
    screenshot: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&q=70",
    demoUrl: "/site/luxe-hair-spa",
    description: "Playful pastels and grid-based service showcase.",
  },
];

export const CURRENT_TEMPLATE_ID = "RoyalLuxe";

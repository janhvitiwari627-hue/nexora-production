export type Template = {
  id: string;
  name: string;
  category: string[];
  screenshot: string;
  demoUrl: string;
  description: string;
};

export const TEMPLATE_CATEGORIES = [
  "All", "Premium Salon", "Salon", "Makeup Studio", "Spa", "Barber", "Nails",
];

export const TEMPLATES: Template[] = [
  {
    id: "royal-luxe",
    name: "Royal Luxe",
    category: ["Premium Salon", "Spa"],
    screenshot: "",
    demoUrl: "/site/luxe-hair-spa",
    description: "Luxury black & gold with full-screen video hero, glassmorphism cards and premium animations.",
  },
  {
    id: "modern-salon",
    name: "Modern Salon",
    category: ["Salon", "Barber"],
    screenshot: "",
    demoUrl: "/site/luxe-hair-spa",
    description: "Perfect for salons, beauty parlours and barber shops with clean cards and fast booking CTA.",
  },
  {
    id: "professional-beauty",
    name: "Professional Beauty",
    category: ["Makeup Studio", "Nails"],
    screenshot: "",
    demoUrl: "/site/luxe-hair-spa",
    description: "Best for makeup artists, nail studios and beauty professionals with elegant portfolio sections.",
  },
];

export const CURRENT_TEMPLATE_ID = "royal-luxe";

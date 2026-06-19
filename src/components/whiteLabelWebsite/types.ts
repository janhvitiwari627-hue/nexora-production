export type SectionId =
  | "hero" | "services" | "gallery" | "staff" | "reviews" | "testimonials"
  | "faq" | "offers" | "contact" | "map" | "appointment" | "membership"
  | "coupons" | "instagram" | "youtube" | "whatsapp" | "bookingBar"
  | "beforeAfter" | "awards" | "brands";

export interface WebsiteConfig {
  template: string;
  branding: { logo?: string; primaryColor: string; secondaryColor: string; font: string };
  sections: { id: SectionId; enabled: boolean; order: number }[];
  seoMeta: { title: string; description: string; keywords: string[] };
  socialLinks: Record<string, string>;
}

export interface ShopData {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  city: string;
  address: string;
  whatsapp: string;
  phone: string;
  email?: string;
  coverImage: string;
  rating: number;
  reviewCount: number;
  about: string;
  services: { id: string; name: string; price: number; duration: number; desc: string; image?: string }[];
  staff: { id: string; name: string; designation: string; image: string; experience: number }[];
  gallery: string[];
  reviews: { id: string; author: string; rating: number; text: string; date: string }[];
  faqs: { q: string; a: string }[];
  offers: { id: string; title: string; description: string; discount: string }[];
  memberships: { id: string; tier: string; price: number; benefits: string[] }[];
  coupons: { id: string; code: string; discount: string }[];
  awards: { title: string; year: number }[];
  brands: { name: string; logo?: string }[];
  beforeAfter: { before: string; after: string; title: string }[];
  testimonials: { id: string; author: string; text: string; image?: string }[];
  instagramHandle?: string;
  youtubeChannel?: string;
  hours: { day: string; open: string; close: string }[];
  location: { lat: number; lng: number };
}

const stockImg = (seed: string) => `https://picsum.photos/seed/${seed}/800/600`;

export const MOCK_SHOP: ShopData = {
  slug: "luxe-hair-spa",
  name: "Luxe Hair & Spa",
  tagline: "Premium grooming, every visit",
  category: "Salon",
  city: "Mumbai",
  address: "Plot 24, Linking Road, Bandra West, Mumbai",
  whatsapp: "+919876543210",
  phone: "+919876543210",
  email: "hello@luxehair.com",
  coverImage: stockImg("luxe-cover"),
  rating: 4.8,
  reviewCount: 412,
  about: "Award-winning salon delivering premium hair, beauty, and wellness experiences since 2015.",
  services: Array.from({ length: 6 }).map((_, i) => ({
    id: `s${i}`, name: ["Haircut & Style", "Hair Color", "Keratin Treatment", "Facial", "Manicure", "Pedicure"][i],
    price: [800, 2400, 4500, 1800, 600, 750][i], duration: [45, 90, 120, 60, 30, 40][i],
    desc: "Expertly delivered by certified stylists using premium brands.", image: stockImg(`srv${i}`),
  })),
  staff: Array.from({ length: 4 }).map((_, i) => ({
    id: `st${i}`, name: ["Priya R.", "Aarav M.", "Neha S.", "Vikram I."][i],
    designation: ["Senior Stylist", "Master Barber", "Beautician", "Spa Therapist"][i],
    image: stockImg(`staff${i}`), experience: 5 + i * 2,
  })),
  gallery: Array.from({ length: 9 }).map((_, i) => stockImg(`gal${i}`)),
  reviews: Array.from({ length: 5 }).map((_, i) => ({
    id: `r${i}`, author: ["Aarav", "Priya", "Sneha", "Rohan", "Deepa"][i],
    rating: 5, text: "Loved the service! Highly recommend.", date: `${i + 1}w ago`,
  })),
  faqs: [
    { q: "Do you accept walk-ins?", a: "Yes, but appointments are recommended." },
    { q: "Do you offer home services?", a: "Yes, premium members get free home visits." },
    { q: "What's your cancellation policy?", a: "Free cancellation up to 2 hours before." },
  ],
  offers: [
    { id: "o1", title: "First Visit Special", description: "20% off your first booking", discount: "20%" },
    { id: "o2", title: "Weekday Glow", description: "15% off all weekday services", discount: "15%" },
  ],
  memberships: [
    { id: "m1", tier: "Silver", price: 499, benefits: ["5% off all", "Priority booking"] },
    { id: "m2", tier: "Gold", price: 999, benefits: ["10% off all", "1 free service/month", "Birthday voucher"] },
    { id: "m3", tier: "Platinum", price: 1999, benefits: ["15% off all", "Home visits", "VIP concierge"] },
  ],
  coupons: [{ id: "c1", code: "WELCOME20", discount: "20% off" }, { id: "c2", code: "FEST500", discount: "₹500 off" }],
  awards: [{ title: "Best Salon Mumbai", year: 2024 }, { title: "Top Bridal Studio", year: 2023 }],
  brands: [{ name: "L'Oréal" }, { name: "Schwarzkopf" }, { name: "Wella" }, { name: "Olaplex" }, { name: "Kérastase" }],
  beforeAfter: [{ before: stockImg("b1"), after: stockImg("a1"), title: "Hair Color Transformation" }],
  testimonials: Array.from({ length: 3 }).map((_, i) => ({
    id: `t${i}`, author: ["Aarav M.", "Priya S.", "Neha R."][i],
    text: "Best salon experience I've ever had — the team is incredible.",
  })),
  instagramHandle: "luxehairspa",
  youtubeChannel: "luxehairspa",
  hours: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => ({ day: d, open: "10:00", close: "21:00" })),
  location: { lat: 19.06, lng: 72.83 },
};

export const DEFAULT_SECTIONS: WebsiteConfig["sections"] = [
  { id: "hero", enabled: true, order: 1 },
  { id: "services", enabled: true, order: 2 },
  { id: "gallery", enabled: true, order: 3 },
  { id: "beforeAfter", enabled: true, order: 4 },
  { id: "offers", enabled: true, order: 5 },
  { id: "staff", enabled: true, order: 6 },
  { id: "membership", enabled: true, order: 7 },
  { id: "reviews", enabled: true, order: 8 },
  { id: "testimonials", enabled: true, order: 9 },
  { id: "awards", enabled: true, order: 10 },
  { id: "brands", enabled: true, order: 11 },
  { id: "instagram", enabled: true, order: 12 },
  { id: "youtube", enabled: false, order: 13 },
  { id: "coupons", enabled: true, order: 14 },
  { id: "faq", enabled: true, order: 15 },
  { id: "appointment", enabled: true, order: 16 },
  { id: "contact", enabled: true, order: 17 },
  { id: "map", enabled: true, order: 18 },
  { id: "whatsapp", enabled: true, order: 99 },
  { id: "bookingBar", enabled: true, order: 99 },
];

export const MOCK_CONFIG: WebsiteConfig = {
  template: "NexoraPremium",
  branding: { primaryColor: "#635BFF", secondaryColor: "#0EA5E9", font: "Inter" },
  sections: DEFAULT_SECTIONS,
  seoMeta: { title: "Luxe Hair & Spa — Premium Salon in Mumbai", description: "Book appointments at Luxe Hair & Spa.", keywords: ["salon", "spa", "Mumbai"] },
  socialLinks: { instagram: "https://instagram.com/luxehairspa", facebook: "https://facebook.com/luxehairspa", whatsapp: "https://wa.me/919876543210" },
};

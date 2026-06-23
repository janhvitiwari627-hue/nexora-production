export type SectionId =
  | "hero" | "about" | "services" | "rateCard" | "gallery" | "staff" | "reviews"
  | "testimonials" | "faq" | "offers" | "packages" | "blog" | "contact" | "map"
  | "appointment" | "membership" | "loyalty" | "referral" | "coupons"
  | "socialMedia" | "instagram" | "youtube" | "whatsapp" | "bookingBar"
  | "beforeAfter" | "awards" | "brands";

export interface WebsiteConfig {
  template: "royal-luxe" | "modern-salon" | "professional-beauty";
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
  services: {
    id: string; name: string; price: number; discountPrice?: number;
    duration: number; desc: string; image?: string; category?: string; popular?: boolean;
  }[];
  staff: {
    id: string; name: string; designation: string; image: string;
    experience: number; specialization?: string; rating?: number; available?: boolean;
  }[];
  gallery: { url: string; type: "photo" | "video" | "before-after"; category?: string }[];
  reviews: {
    id: string; author: string; rating: number; text: string; date: string;
    photo?: string; video?: string; source?: "site" | "google";
  }[];
  faqs: { q: string; a: string }[];
  offers: { id: string; title: string; description: string; discount: string }[];
  packages: { id: string; name: string; price: number; originalPrice?: number; services: string[]; duration: string }[];
  memberships: { id: string; tier: "Silver" | "Gold" | "Platinum"; price: number; benefits: string[]; popular?: boolean }[];
  loyalty: { pointsPerVisit: number; referralPoints: number; birthdayReward: string; festivalReward: string };
  blog: { id: string; title: string; excerpt: string; image: string; date: string; slug: string }[];
  coupons: { id: string; code: string; discount: string }[];
  awards: { title: string; year: number }[];
  brands: { name: string; logo?: string }[];
  beforeAfter: { before: string; after: string; title: string }[];
  testimonials: { id: string; author: string; text: string; image?: string }[];
  socialLinks: {
    instagram?: string; facebook?: string; youtube?: string; twitter?: string;
    linkedin?: string; pinterest?: string; threads?: string; telegram?: string; whatsappChannel?: string;
  };
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
  services: [
    { id: "s0", name: "Haircut & Style", price: 800, discountPrice: 650, duration: 45, desc: "Expert cut by certified stylists.", image: stockImg("srv0"), category: "Hair", popular: true },
    { id: "s1", name: "Hair Color", price: 2400, discountPrice: 1999, duration: 90, desc: "Premium L'Oréal color treatments.", image: stockImg("srv1"), category: "Hair", popular: true },
    { id: "s2", name: "Keratin Treatment", price: 4500, duration: 120, desc: "Smoothing keratin therapy.", image: stockImg("srv2"), category: "Hair" },
    { id: "s3", name: "Signature Facial", price: 1800, discountPrice: 1499, duration: 60, desc: "Glow-boosting facial ritual.", image: stockImg("srv3"), category: "Skin", popular: true },
    { id: "s4", name: "Manicure", price: 600, duration: 30, desc: "Salon-finish nail care.", image: stockImg("srv4"), category: "Nails" },
    { id: "s5", name: "Pedicure", price: 750, duration: 40, desc: "Relaxing foot ritual.", image: stockImg("srv5"), category: "Nails" },
  ],
  staff: [
    { id: "st0", name: "Priya R.", designation: "Senior Stylist", image: stockImg("staff0"), experience: 8, specialization: "Hair Color · Balayage", rating: 4.9, available: true },
    { id: "st1", name: "Aarav M.", designation: "Master Barber", image: stockImg("staff1"), experience: 10, specialization: "Beard · Fade", rating: 4.8, available: true },
    { id: "st2", name: "Neha S.", designation: "Beautician", image: stockImg("staff2"), experience: 6, specialization: "Facial · Bridal", rating: 4.9, available: false },
    { id: "st3", name: "Vikram I.", designation: "Spa Therapist", image: stockImg("staff3"), experience: 12, specialization: "Massage · Wellness", rating: 4.7, available: true },
  ],
  gallery: [
    ...Array.from({ length: 6 }).map((_, i) => ({ url: stockImg(`gal${i}`), type: "photo" as const, category: "Interior" })),
    ...Array.from({ length: 3 }).map((_, i) => ({ url: stockImg(`work${i}`), type: "photo" as const, category: "Work" })),
  ],
  reviews: [
    { id: "r0", author: "Aarav", rating: 5, text: "Loved the service! Highly recommend.", date: "1w ago", source: "google" },
    { id: "r1", author: "Priya", rating: 5, text: "Best salon experience in Mumbai.", date: "2w ago", photo: stockImg("rev1"), source: "site" },
    { id: "r2", author: "Sneha", rating: 5, text: "Staff is so warm and skilled!", date: "3w ago", source: "google" },
    { id: "r3", author: "Rohan", rating: 4, text: "Great value and quality.", date: "1mo ago", source: "site" },
    { id: "r4", author: "Deepa", rating: 5, text: "Amazing bridal package.", date: "1mo ago", photo: stockImg("rev4"), source: "site" },
  ],
  faqs: [
    { q: "Do you accept walk-ins?", a: "Yes, but appointments are recommended." },
    { q: "Do you offer home services?", a: "Yes, premium members get free home visits." },
    { q: "What's your cancellation policy?", a: "Free cancellation up to 2 hours before." },
  ],
  offers: [
    { id: "o1", title: "First Visit Special", description: "20% off your first booking", discount: "20%" },
    { id: "o2", title: "Weekday Glow", description: "15% off all weekday services", discount: "15%" },
  ],
  packages: [
    { id: "p1", name: "Bridal Glow Package", price: 12999, originalPrice: 18000, services: ["Pre-bridal facial", "Hair styling", "Mehendi", "Makeup trial"], duration: "Full day" },
    { id: "p2", name: "Couple Spa Day", price: 4999, originalPrice: 6500, services: ["Couple massage", "Facial", "Manicure"], duration: "3 hours" },
    { id: "p3", name: "Monthly Care", price: 2499, originalPrice: 3500, services: ["2x Haircut", "1x Facial", "1x Manicure"], duration: "Monthly" },
  ],
  memberships: [
    { id: "m1", tier: "Silver", price: 499, benefits: ["5% off all services", "Priority booking", "Birthday voucher"] },
    { id: "m2", tier: "Gold", price: 999, benefits: ["10% off all", "1 free service/month", "Birthday voucher", "Free consultation"], popular: true },
    { id: "m3", tier: "Platinum", price: 1999, benefits: ["15% off all", "Free home visits", "VIP concierge", "Festival rewards"] },
  ],
  loyalty: { pointsPerVisit: 50, referralPoints: 200, birthdayReward: "Free facial worth ₹1800", festivalReward: "Up to 30% off festival packages" },
  blog: [
    { id: "b1", slug: "monsoon-hair-care", title: "5 Monsoon Hair Care Tips", excerpt: "Keep your hair healthy this season.", image: stockImg("blog1"), date: "Jun 18, 2026" },
    { id: "b2", slug: "bridal-glow-guide", title: "The Ultimate Bridal Glow Guide", excerpt: "Everything to prep before your big day.", image: stockImg("blog2"), date: "Jun 10, 2026" },
    { id: "b3", slug: "color-trends-2026", title: "Hair Color Trends 2026", excerpt: "What's hot in colors this year.", image: stockImg("blog3"), date: "May 28, 2026" },
  ],
  coupons: [{ id: "c1", code: "WELCOME20", discount: "20% off" }, { id: "c2", code: "FEST500", discount: "₹500 off" }],
  awards: [{ title: "Best Salon Mumbai", year: 2024 }, { title: "Top Bridal Studio", year: 2023 }],
  brands: [{ name: "L'Oréal" }, { name: "Schwarzkopf" }, { name: "Wella" }, { name: "Olaplex" }, { name: "Kérastase" }],
  beforeAfter: [
    { before: stockImg("b1"), after: stockImg("a1"), title: "Hair Color Transformation" },
    { before: stockImg("b2"), after: stockImg("a2"), title: "Bridal Makeover" },
  ],
  testimonials: [
    { id: "t0", author: "Aarav M.", text: "Best salon experience I've ever had — the team is incredible." },
    { id: "t1", author: "Priya S.", text: "Their bridal package transformed my big day." },
    { id: "t2", author: "Neha R.", text: "Consistently great, every single visit." },
  ],
  socialLinks: {
    instagram: "https://instagram.com/luxehairspa",
    facebook: "https://facebook.com/luxehairspa",
    youtube: "https://youtube.com/@luxehairspa",
    twitter: "https://x.com/luxehairspa",
    linkedin: "https://linkedin.com/company/luxehairspa",
    pinterest: "https://pinterest.com/luxehairspa",
    threads: "https://threads.net/@luxehairspa",
    telegram: "https://t.me/luxehairspa",
    whatsappChannel: "https://whatsapp.com/channel/luxehairspa",
  },
  instagramHandle: "luxehairspa",
  youtubeChannel: "luxehairspa",
  hours: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => ({ day: d, open: "10:00", close: "21:00" })),
  location: { lat: 19.06, lng: 72.83 },
};

export const DEFAULT_SECTIONS: WebsiteConfig["sections"] = [
  { id: "hero", enabled: true, order: 1 },
  { id: "about", enabled: true, order: 2 },
  { id: "services", enabled: true, order: 3 },
  { id: "rateCard", enabled: true, order: 4 },
  { id: "packages", enabled: true, order: 5 },
  { id: "gallery", enabled: true, order: 6 },
  { id: "beforeAfter", enabled: true, order: 7 },
  { id: "offers", enabled: true, order: 8 },
  { id: "staff", enabled: true, order: 9 },
  { id: "membership", enabled: true, order: 10 },
  { id: "loyalty", enabled: true, order: 11 },
  { id: "referral", enabled: true, order: 12 },
  { id: "reviews", enabled: true, order: 13 },
  { id: "testimonials", enabled: true, order: 14 },
  { id: "blog", enabled: true, order: 15 },
  { id: "awards", enabled: true, order: 16 },
  { id: "brands", enabled: true, order: 17 },
  { id: "socialMedia", enabled: true, order: 18 },
  { id: "instagram", enabled: true, order: 19 },
  { id: "youtube", enabled: true, order: 20 },
  { id: "coupons", enabled: true, order: 21 },
  { id: "faq", enabled: true, order: 22 },
  { id: "appointment", enabled: true, order: 23 },
  { id: "contact", enabled: true, order: 24 },
  { id: "map", enabled: true, order: 25 },
  { id: "whatsapp", enabled: true, order: 99 },
  { id: "bookingBar", enabled: true, order: 99 },
];

export const MOCK_CONFIG: WebsiteConfig = {
  template: "royal-luxe",
  branding: { primaryColor: "#0A0A0A", secondaryColor: "#D4AF37", font: "Playfair Display" },
  sections: DEFAULT_SECTIONS,
  seoMeta: {
    title: "Luxe Hair & Spa — Premium Salon in Mumbai",
    description: "Book premium hair, beauty and spa services at Luxe Hair & Spa, Bandra Mumbai.",
    keywords: ["salon mumbai", "spa bandra", "bridal makeup", "hair color", "luxe hair spa"],
  },
  socialLinks: {
    instagram: "https://instagram.com/luxehairspa",
    facebook: "https://facebook.com/luxehairspa",
    whatsapp: "https://wa.me/919876543210",
  },
};

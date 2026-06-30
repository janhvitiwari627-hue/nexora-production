import type { Shop } from "@/components/shared/ShopCard";
import type { ShopData } from "@/components/whiteLabelWebsite/types";

/* ============================================================
 * JAIPUR MOCK BUSINESS CATALOG
 * Demo data used when real Supabase data is empty OR when a
 * white-label slug is opened that does not exist in the DB.
 * Every category has multiple businesses with unique slugs.
 * ============================================================ */

export const JAIPUR_AREAS = [
  "Mansarovar",
  "Vaishali Nagar",
  "Malviya Nagar",
  "Jagatpura",
  "Raja Park",
  "C-Scheme",
  "Vidyadhar Nagar",
  "Tonk Road",
  "Sanganer",
  "Sodala",
  "Jhotwara",
  "Sitapura",
  "Murlipura",
] as const;

export const ALL_CATEGORIES = [
  "Salon",
  "Beauty Parlour",
  "Spa",
  "Tattoo Studio",
  "Massage Center",
  "Nail Art Studio",
  "Makeup Artist",
  "Bridal Services",
  "Barber Shop",
] as const;

type CategoryName = (typeof ALL_CATEGORIES)[number];

type Seed = {
  name: string;
  category: CategoryName;
  area: string;
  rating: number;
  reviewCount: number;
  startingPrice: number;
  cover: string;
  isVerified: boolean;
  gender: "male" | "female" | "unisex";
};

const COVERS: Record<CategoryName, string[]> = {
  Salon: [
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80",
    "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1200&q=80",
    "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=1200&q=80",
    "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=1200&q=80",
  ],
  "Beauty Parlour": [
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=80",
    "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200&q=80",
    "https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=1200&q=80",
  ],
  Spa: [
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=80",
    "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&q=80",
    "https://images.unsplash.com/photo-1591343395082-e120087004b4?w=1200&q=80",
  ],
  "Tattoo Studio": [
    "https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?w=1200&q=80",
    "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=1200&q=80",
    "https://images.unsplash.com/photo-1542856391-010fb87dcfed?w=1200&q=80",
  ],
  "Massage Center": [
    "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=1200&q=80",
    "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=1200&q=80",
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80",
  ],
  "Nail Art Studio": [
    "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&q=80",
    "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=1200&q=80",
    "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=1200&q=80",
  ],
  "Makeup Artist": [
    "https://images.unsplash.com/photo-1457972729786-0411a3b2b626?w=1200&q=80",
    "https://images.unsplash.com/photo-1503236823255-94609f598e71?w=1200&q=80",
    "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=1200&q=80",
  ],
  "Bridal Services": [
    "https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=1200&q=80",
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80",
    "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=1200&q=80",
  ],
  "Barber Shop": [
    "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&q=80",
    "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=1200&q=80",
    "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=1200&q=80",
  ],
};

const NAME_PREFIXES = [
  "Glow", "Royal", "Elite", "Bliss", "Aura", "Lotus", "Velvet", "Serene", "Urban",
  "Luxe", "Pristine", "Opulent", "Mystique", "Crown", "Pearl", "Ivory", "Rose",
  "Sapphire", "Marigold", "Jasmine", "Pink Petal", "Golden", "Mirage", "Bella",
  "Studio 11", "Halo", "Vogue", "Charm", "Allure", "Radiance",
];

const SUFFIX_BY_CAT: Record<CategoryName, string[]> = {
  Salon: ["Salon", "Studio", "Hair Lounge", "Beauty Bar"],
  "Beauty Parlour": ["Beauty Parlour", "Beauty Studio", "Beauty Lounge"],
  Spa: ["Spa", "Wellness Spa", "Spa & Wellness"],
  "Tattoo Studio": ["Tattoo Studio", "Ink Studio", "Tattoo Atelier"],
  "Massage Center": ["Massage Center", "Therapy House", "Wellness Center"],
  "Nail Art Studio": ["Nail Studio", "Nail Lounge", "Nail Bar"],
  "Makeup Artist": ["Makeup Studio", "Makeup Atelier", "Glam Studio"],
  "Bridal Services": ["Bridal Studio", "Bridal House", "Wedding Atelier"],
  "Barber Shop": ["Barber Co.", "Gents Lounge", "Barber House"],
};

const COUNTS: Record<CategoryName, number> = {
  Salon: 24,
  "Beauty Parlour": 18,
  Spa: 12,
  "Tattoo Studio": 9,
  "Massage Center": 11,
  "Nail Art Studio": 15,
  "Makeup Artist": 10,
  "Bridal Services": 8,
  "Barber Shop": 10,
};

const PRICE_FLOORS: Record<CategoryName, number> = {
  Salon: 299,
  "Beauty Parlour": 249,
  Spa: 799,
  "Tattoo Studio": 999,
  "Massage Center": 599,
  "Nail Art Studio": 399,
  "Makeup Artist": 1499,
  "Bridal Services": 4999,
  "Barber Shop": 149,
};

const GENDER_BY_CAT: Record<CategoryName, Seed["gender"]> = {
  Salon: "unisex",
  "Beauty Parlour": "female",
  Spa: "unisex",
  "Tattoo Studio": "unisex",
  "Massage Center": "unisex",
  "Nail Art Studio": "female",
  "Makeup Artist": "female",
  "Bridal Services": "female",
  "Barber Shop": "male",
};

const SERVICES_BY_CAT: Record<CategoryName, { name: string; mult: number; mins: number; desc: string }[]> = {
  Salon: [
    { name: "Haircut & Style", mult: 1, mins: 45, desc: "Expert cut & finish." },
    { name: "Hair Color", mult: 3.5, mins: 90, desc: "Global / highlights." },
    { name: "Hair Spa", mult: 2.2, mins: 60, desc: "Deep nourishment." },
    { name: "Beard Trim", mult: 0.6, mins: 20, desc: "Sharp lines & shape." },
    { name: "Keratin Treatment", mult: 8, mins: 150, desc: "Smooth & frizz-free." },
  ],
  "Beauty Parlour": [
    { name: "Threading", mult: 0.4, mins: 15, desc: "Eyebrow + upper lip." },
    { name: "Clean-up", mult: 1.6, mins: 40, desc: "Refreshing skin care." },
    { name: "Gold Facial", mult: 4, mins: 75, desc: "Premium glow facial." },
    { name: "Bleach + Detan", mult: 1.8, mins: 30, desc: "Brighten skin tone." },
    { name: "Full Body Wax", mult: 5, mins: 90, desc: "Smooth & gentle." },
  ],
  Spa: [
    { name: "Swedish Massage", mult: 1, mins: 60, desc: "Relaxation therapy." },
    { name: "Deep Tissue", mult: 1.4, mins: 75, desc: "Knots & tension relief." },
    { name: "Aroma Therapy", mult: 1.6, mins: 60, desc: "Essential oils." },
    { name: "Couple Spa", mult: 3, mins: 90, desc: "Together time." },
    { name: "Thai Massage", mult: 1.8, mins: 90, desc: "Energy lines." },
  ],
  "Tattoo Studio": [
    { name: "Small Custom Tattoo", mult: 1, mins: 60, desc: "Up to 3 inches." },
    { name: "Medium Custom Tattoo", mult: 2.5, mins: 150, desc: "Detailed design." },
    { name: "Sleeve Consultation", mult: 0.5, mins: 30, desc: "Plan your sleeve." },
    { name: "Cover-up Tattoo", mult: 3.5, mins: 180, desc: "Hide & re-design." },
    { name: "Tattoo Touch-up", mult: 0.8, mins: 45, desc: "Refresh old ink." },
  ],
  "Massage Center": [
    { name: "Head Massage", mult: 0.6, mins: 30, desc: "Stress relief." },
    { name: "Foot Reflexology", mult: 1, mins: 45, desc: "Pressure points." },
    { name: "Full Body Massage", mult: 1.6, mins: 75, desc: "Complete therapy." },
    { name: "Hot Stone Therapy", mult: 2, mins: 75, desc: "Warm stone relaxation." },
    { name: "Sports Recovery", mult: 1.8, mins: 60, desc: "Muscle recovery." },
  ],
  "Nail Art Studio": [
    { name: "Classic Manicure", mult: 1, mins: 30, desc: "Shape + polish." },
    { name: "Gel Polish", mult: 1.6, mins: 45, desc: "Long-lasting shine." },
    { name: "Nail Extensions", mult: 4, mins: 90, desc: "Acrylic / gel extensions." },
    { name: "Nail Art (per nail)", mult: 0.4, mins: 15, desc: "Custom designs." },
    { name: "Pedicure", mult: 1.4, mins: 45, desc: "Spa pedicure." },
  ],
  "Makeup Artist": [
    { name: "Party Makeup", mult: 1, mins: 60, desc: "Evening look." },
    { name: "Engagement Makeup", mult: 1.6, mins: 90, desc: "Special day." },
    { name: "HD Airbrush Makeup", mult: 2, mins: 90, desc: "Flawless finish." },
    { name: "Photoshoot Makeup", mult: 1.4, mins: 75, desc: "Camera-ready." },
    { name: "Hair Styling Add-on", mult: 0.6, mins: 30, desc: "Curls / updos." },
  ],
  "Bridal Services": [
    { name: "Bridal Makeup Package", mult: 1, mins: 180, desc: "Complete bridal look." },
    { name: "Pre-Bridal Glow Plan", mult: 0.7, mins: 240, desc: "4-session plan." },
    { name: "Mehendi (Bridal)", mult: 0.5, mins: 180, desc: "Full hands + feet." },
    { name: "Reception Makeup", mult: 0.9, mins: 150, desc: "Second day look." },
    { name: "Family Makeup (per person)", mult: 0.3, mins: 60, desc: "Sangeet ready." },
  ],
  "Barber Shop": [
    { name: "Hair Cut", mult: 1, mins: 30, desc: "Sharp men's cut." },
    { name: "Beard Styling", mult: 0.8, mins: 25, desc: "Clean shape." },
    { name: "Hair + Beard Combo", mult: 1.5, mins: 50, desc: "Combo savings." },
    { name: "Head Massage", mult: 0.7, mins: 20, desc: "Stress relief." },
    { name: "Hair Color (Men)", mult: 2.4, mins: 60, desc: "Cover greys." },
  ],
};

const STAFF_BY_CAT: Record<CategoryName, { name: string; role: string }[]> = {
  Salon: [
    { name: "Aman Sharma", role: "Senior Stylist" },
    { name: "Priya Mehta", role: "Hair Colorist" },
    { name: "Rohit Verma", role: "Hair Artist" },
  ],
  "Beauty Parlour": [
    { name: "Neha Joshi", role: "Senior Beautician" },
    { name: "Kavita Singh", role: "Skin Specialist" },
    { name: "Anita Rao", role: "Beautician" },
  ],
  Spa: [
    { name: "Lakshmi Iyer", role: "Spa Therapist" },
    { name: "Manoj Pillai", role: "Senior Therapist" },
    { name: "Sneha Das", role: "Aroma Specialist" },
  ],
  "Tattoo Studio": [
    { name: "Karan Bhatt", role: "Lead Tattoo Artist" },
    { name: "Riya Khanna", role: "Tattoo Artist" },
    { name: "Vikram Singh", role: "Apprentice Artist" },
  ],
  "Massage Center": [
    { name: "Suresh Nair", role: "Senior Therapist" },
    { name: "Anjali Roy", role: "Reflexologist" },
    { name: "Deepak Yadav", role: "Sports Therapist" },
  ],
  "Nail Art Studio": [
    { name: "Tanya Goyal", role: "Nail Artist" },
    { name: "Pooja Saxena", role: "Nail Technician" },
    { name: "Megha Aggarwal", role: "Lead Artist" },
  ],
  "Makeup Artist": [
    { name: "Ritika Kapoor", role: "Lead MUA" },
    { name: "Simran Kaur", role: "HD Makeup Artist" },
    { name: "Aisha Khan", role: "MUA Assistant" },
  ],
  "Bridal Services": [
    { name: "Shweta Rathi", role: "Bridal Designer" },
    { name: "Manvi Bhatia", role: "Bridal MUA" },
    { name: "Pallavi Jain", role: "Mehendi Artist" },
  ],
  "Barber Shop": [
    { name: "Sandeep Kumar", role: "Master Barber" },
    { name: "Arjun Sethi", role: "Senior Barber" },
    { name: "Ravi Yadav", role: "Barber" },
  ],
};

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length];
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ───────── Seed Generation ───────── */

function buildSeeds(): Seed[] {
  const seeds: Seed[] = [];
  let n = 0;
  for (const cat of ALL_CATEGORIES) {
    const count = COUNTS[cat];
    const suffixes = SUFFIX_BY_CAT[cat];
    const covers = COVERS[cat];
    for (let i = 0; i < count; i++) {
      const prefix = pick(NAME_PREFIXES, n + i * 3);
      const suffix = pick(suffixes, i);
      const area = pick(JAIPUR_AREAS, n + i);
      const rating = 4.3 + ((i * 7) % 7) / 10;
      const reviewCount = 40 + ((n * 13 + i * 29) % 460);
      const priceFloor = PRICE_FLOORS[cat];
      const startingPrice = priceFloor + ((i * 50) % 300);
      seeds.push({
        name: `${prefix} ${suffix}`,
        category: cat,
        area,
        rating: Math.round(rating * 10) / 10,
        reviewCount,
        startingPrice,
        cover: pick(covers, i),
        isVerified: i % 3 !== 2,
        gender: GENDER_BY_CAT[cat],
      });
      n++;
    }
  }
  return seeds;
}

export type MockBusiness = Seed & { slug: string };

let _catalog: MockBusiness[] | null = null;
export function getMockBusinesses(): MockBusiness[] {
  if (_catalog) return _catalog;
  const seen = new Set<string>();
  _catalog = buildSeeds().map((s) => {
    let base = slugify(`${s.name}-${s.area}`);
    let slug = base;
    let n = 2;
    while (seen.has(slug)) slug = `${base}-${n++}`;
    seen.add(slug);
    return { ...s, slug };
  });
  return _catalog;
}

export function getMockBusinessBySlug(slug: string): MockBusiness | null {
  return getMockBusinesses().find((b) => b.slug === slug) ?? null;
}

export function getCategoryCounts(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const b of getMockBusinesses()) out[b.category] = (out[b.category] ?? 0) + 1;
  return out;
}

/* ───────── Shop card adapter (for search/listings) ───────── */

export function mockBusinessToShop(b: MockBusiness): Shop {
  const priceLevel =
    b.startingPrice < 300 ? 1 : b.startingPrice < 800 ? 2 : b.startingPrice < 1500 ? 3 : 4;
  const badges: Shop["badges"] = [];
  if (b.isVerified) badges.push("verified");
  if (b.rating >= 4.7) badges.push("top_rated");
  if (b.reviewCount >= 250) badges.push("most_popular");
  return {
    slug: b.slug,
    name: b.name,
    tagline: `${b.category} in ${b.area}, Jaipur`,
    category: b.category,
    area: b.area,
    city: "Jaipur",
    cover_image: b.cover,
    rating: b.rating,
    review_count: b.reviewCount,
    price_level: priceLevel,
    is_verified: b.isVerified,
    distance_km: Number(((b.startingPrice % 70) / 10 + 0.8).toFixed(1)),
    membership_perk: null,
    starting_price: b.startingPrice,
    popularity: b.reviewCount,
    gender: b.gender,
    badges,
  };
}

export function getMockShops(): Shop[] {
  return getMockBusinesses().map(mockBusinessToShop);
}

/* ───────── White-label ShopData expansion ───────── */

function galleryFor(cat: CategoryName, seed: number) {
  const pool = COVERS[cat];
  return Array.from({ length: 6 }).map((_, i) => ({
    url: pick(pool, seed + i),
    type: "photo" as const,
    category: i % 2 ? "Work" : "Interior",
  }));
}

export function expandMockBusiness(b: MockBusiness): ShopData {
  const services = SERVICES_BY_CAT[b.category].map((s, i) => {
    const price = Math.round((b.startingPrice * s.mult) / 10) * 10;
    return {
      id: `${b.slug}-s${i}`,
      name: s.name,
      price,
      discountPrice: i % 3 === 0 ? Math.round(price * 0.85 / 10) * 10 : undefined,
      duration: s.mins,
      desc: s.desc,
      image: pick(COVERS[b.category], i + 1),
      category: b.category,
      popular: i < 2,
    };
  });

  const staff = STAFF_BY_CAT[b.category].map((s, i) => ({
    id: `${b.slug}-st${i}`,
    name: s.name,
    designation: s.role,
    image: `https://i.pravatar.cc/300?img=${(b.slug.length * 7 + i * 11) % 70}`,
    experience: 4 + ((i * 3) % 8),
    specialization: SERVICES_BY_CAT[b.category][i % 3]?.name,
    rating: Math.round((4.5 + (i % 5) / 10) * 10) / 10,
    available: i !== 2,
  }));

  const phone = `+91 99${String(7000000 + (b.slug.length * 9301 + 7) % 999999).slice(-7)}`;
  const reviews = [
    { id: `${b.slug}-r1`, author: "Priya", rating: 5, text: "Loved the experience — staff is super professional!", date: "1w ago", source: "site" as const },
    { id: `${b.slug}-r2`, author: "Riya", rating: 5, text: "Worth every rupee. Will visit again.", date: "2w ago", source: "google" as const },
    { id: `${b.slug}-r3`, author: "Anjali", rating: 4, text: "Great ambience and friendly team.", date: "3w ago", source: "site" as const },
    { id: `${b.slug}-r4`, author: "Sneha", rating: 5, text: "Best in Jaipur for this kind of service.", date: "1mo ago", source: "google" as const },
  ];

  return {
    slug: b.slug,
    name: b.name,
    tagline: `${b.category} in ${b.area}, Jaipur`,
    category: b.category,
    city: "Jaipur",
    address: `${b.area}, Jaipur, Rajasthan 302001`,
    whatsapp: phone.replace(/\s/g, ""),
    phone,
    email: `hello@${b.slug}.in`,
    coverImage: b.cover,
    rating: b.rating,
    reviewCount: b.reviewCount,
    about: `${b.name} is a trusted ${b.category.toLowerCase()} in ${b.area}, Jaipur. We bring you premium services with certified professionals and the best of brands in a relaxed, hygienic setting.`,
    services,
    staff,
    gallery: galleryFor(b.category, b.slug.length),
    reviews,
    faqs: [
      { q: "Do you accept walk-ins?", a: "Yes, but we recommend booking ahead." },
      { q: "Do you have offers for first-time customers?", a: "Yes — 15% off on your first visit." },
      { q: "What's your cancellation policy?", a: "Free cancellation up to 2 hours before your slot." },
    ],
    offers: [
      { id: `${b.slug}-o1`, title: "First Visit", description: "15% off your first booking", discount: "15%" },
      { id: `${b.slug}-o2`, title: "Weekday Glow", description: "10% off Mon–Thu services", discount: "10%" },
    ],
    packages: [
      {
        id: `${b.slug}-p1`,
        name: "Signature Glow Package",
        price: Math.round(b.startingPrice * 3.5),
        originalPrice: Math.round(b.startingPrice * 4.5),
        services: services.slice(0, 3).map((s) => s.name),
        duration: "2 hours",
      },
    ],
    memberships: [
      { id: `${b.slug}-m1`, tier: "Silver", price: 499, benefits: ["5% off all services", "Priority booking"] },
      { id: `${b.slug}-m2`, tier: "Gold", price: 999, benefits: ["10% off all", "1 free service/month", "Birthday voucher"], popular: true },
      { id: `${b.slug}-m3`, tier: "Platinum", price: 1999, benefits: ["15% off", "Home visits", "VIP concierge"] },
    ],
    loyalty: { pointsPerVisit: 50, referralPoints: 200, birthdayReward: "Free service worth ₹999", festivalReward: "Up to 25% off festival packs" },
    blog: [],
    coupons: [
      { id: `${b.slug}-c1`, code: "WELCOME15", discount: "15% off" },
      { id: `${b.slug}-c2`, code: "FEST500", discount: "₹500 off" },
    ],
    awards: b.isVerified ? [{ title: `Top ${b.category} in ${b.area}`, year: 2025 }] : [],
    brands: [{ name: "L'Oréal" }, { name: "Schwarzkopf" }, { name: "Wella" }, { name: "Olaplex" }],
    beforeAfter: [],
    testimonials: [
      { id: `${b.slug}-t1`, author: "Aarav M.", text: `${b.name} is my go-to in ${b.area} — never disappoints.` },
      { id: `${b.slug}-t2`, author: "Neha R.", text: "Hygiene is top-notch and staff is truly skilled." },
    ],
    socialLinks: {
      instagram: `https://instagram.com/${b.slug}`,
      facebook: `https://facebook.com/${b.slug}`,
      whatsappChannel: `https://wa.me/${phone.replace(/\D/g, "")}`,
    },
    instagramHandle: b.slug,
    hours: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => ({
      day: d,
      open: "10:00",
      close: d === "Sun" ? "20:00" : "21:00",
    })),
    location: { lat: 26.9124 + ((b.slug.length % 9) - 4) * 0.01, lng: 75.7873 + ((b.slug.length % 11) - 5) * 0.01 },
  };
}

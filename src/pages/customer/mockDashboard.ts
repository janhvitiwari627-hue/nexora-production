export interface MembershipStatus {
  tier: "Silver" | "Gold" | "Platinum";
  expiresOn: string; // ISO
  benefits: string[];
}

export const mockMembership: MembershipStatus = {
  tier: "Silver",
  expiresOn: new Date(Date.now() + 1000 * 60 * 60 * 24 * 23).toISOString(),
  benefits: [
    "5% off all bookings",
    "Priority slot reservation",
    "Free birthday service",
  ],
};

export interface FavoriteShop {
  id: string;
  slug: string;
  name: string;
  cover: string;
  category: string;
  rating: number;
}

export const mockFavoriteShops: FavoriteShop[] = [
  {
    id: "1",
    slug: "glow-and-co-salon",
    name: "Glow & Co. Salon",
    cover: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80",
    category: "Hair & Beauty",
    rating: 4.8,
  },
  {
    id: "2",
    slug: "urban-cuts-barber",
    name: "Urban Cuts Barber",
    cover: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80",
    category: "Barber",
    rating: 4.7,
  },
  {
    id: "3",
    slug: "serene-spa",
    name: "Serene Spa & Wellness",
    cover: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80",
    category: "Spa",
    rating: 4.9,
  },
  {
    id: "4",
    slug: "nail-bar",
    name: "The Nail Bar",
    cover: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80",
    category: "Nails",
    rating: 4.6,
  },
];

export type ActivityType = "booking" | "review" | "reward" | "offer" | "referral";

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  title: string;
  subtitle: string;
  timestamp: string; // ISO
}

const now = Date.now();
export const mockActivity: ActivityEvent[] = [
  {
    id: "a1",
    type: "booking",
    title: "Booking confirmed at Glow & Co.",
    subtitle: "Haircut + Hair Spa · Tomorrow 4:00 PM",
    timestamp: new Date(now - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "a2",
    type: "reward",
    title: "Earned 120 reward points",
    subtitle: "From booking at Urban Cuts Barber",
    timestamp: new Date(now - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: "a3",
    type: "review",
    title: "You reviewed Serene Spa",
    subtitle: "Rated 5 stars · 'Loved every minute'",
    timestamp: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "a4",
    type: "offer",
    title: "Coupon FLAT20 unlocked",
    subtitle: "Save ₹200 on next spa booking",
    timestamp: new Date(now - 1000 * 60 * 60 * 36).toISOString(),
  },
  {
    id: "a5",
    type: "referral",
    title: "Riya joined using your link",
    subtitle: "You earned ₹100 wallet credit",
    timestamp: new Date(now - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
];

export interface RecommendedService {
  id: string;
  name: string;
  shopName: string;
  shopSlug: string;
  image: string;
  price: number;
  reason: string;
}

export const mockRecommended: RecommendedService[] = [
  {
    id: "r1",
    name: "Keratin Smoothing Treatment",
    shopName: "Glow & Co. Salon",
    shopSlug: "glow-and-co-salon",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80",
    price: 2499,
    reason: "Matches your hair-care history",
  },
  {
    id: "r2",
    name: "Deep Tissue Massage · 60m",
    shopName: "Serene Spa & Wellness",
    shopSlug: "serene-spa",
    image: "https://images.unsplash.com/photo-1591343395082-e120087004b4?w=600&q=80",
    price: 1899,
    reason: "Popular with Gold members near you",
  },
  {
    id: "r3",
    name: "Gel Manicure + Nail Art",
    shopName: "The Nail Bar",
    shopSlug: "nail-bar",
    image: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=600&q=80",
    price: 899,
    reason: "Based on your recent searches",
  },
  {
    id: "r4",
    name: "Classic Beard Sculpt",
    shopName: "Urban Cuts Barber",
    shopSlug: "urban-cuts-barber",
    image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&q=80",
    price: 499,
    reason: "You booked this 4 weeks ago",
  },
];

export interface ExclusiveOffer {
  id: string;
  code: string;
  title: string;
  description: string;
  validUntil: string;
  discountLabel: string;
}

export const mockOffers: ExclusiveOffer[] = [
  {
    id: "o1",
    code: "GOLD25",
    title: "25% off spa rituals",
    description: "Members-only weekend treat",
    validUntil: new Date(now + 1000 * 60 * 60 * 24 * 5).toISOString(),
    discountLabel: "25% OFF",
  },
  {
    id: "o2",
    code: "FLAT200",
    title: "Flat ₹200 on hair services",
    description: "Above ₹999 · One-time use",
    validUntil: new Date(now + 1000 * 60 * 60 * 24 * 10).toISOString(),
    discountLabel: "₹200 OFF",
  },
  {
    id: "o3",
    code: "FRIDAY50",
    title: "Friday flash · 50% off second service",
    description: "Auto-applied at checkout",
    validUntil: new Date(now + 1000 * 60 * 60 * 24 * 2).toISOString(),
    discountLabel: "50% OFF",
  },
];

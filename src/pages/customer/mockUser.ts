export type Tier = "Silver" | "Gold" | "Platinum";

export interface MockUser {
  name: string;
  avatar: string;
  tier: Tier;
  points: number;
  walletBalance: number;
  nextTier: Tier | null;
  pointsToNextTier: number;
  tierProgressMax: number;
}

export const mockUser: MockUser = {
  name: "Ananya Sharma",
  avatar: "https://i.pravatar.cc/120?img=47",
  tier: "Gold",
  points: 1840,
  walletBalance: 1250,
  nextTier: "Platinum",
  pointsToNextTier: 660,
  tierProgressMax: 2500,
};

export const tierGradient: Record<Tier, string> = {
  Silver: "from-slate-300 to-slate-500",
  Gold: "from-amber-300 to-yellow-500",
  Platinum: "from-indigo-400 via-fuchsia-400 to-rose-400",
};

export interface UpcomingBooking {
  id: string;
  shopName: string;
  shopSlug: string;
  shopCover: string;
  service: string;
  staff: string;
  dateISO: string;
  status: "confirmed" | "pending" | "completed";
  phone: string;
  mapsUrl: string;
}

export const mockUpcomingBooking: UpcomingBooking | null = {
  id: "BK-23984",
  shopName: "Glow & Co. Salon",
  shopSlug: "glow-and-co-salon",
  shopCover:
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80",
  service: "Haircut + Hair Spa",
  staff: "Priya M.",
  dateISO: "2026-06-21T15:30:00+05:30",
  status: "confirmed",
  phone: "+919876543210",
  mapsUrl: "https://maps.google.com/?q=Glow+and+Co+Salon",
};

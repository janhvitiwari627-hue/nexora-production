export interface ActivityStats {
  totalBookings: number;
  totalSpending: number;
  totalRewards: number;
  favoriteCategory: string;
  visitsThisMonth: number;
}

export interface MonthlySpend {
  month: string; // "Jan"
  amount: number;
}

export interface CategoryShare {
  name: string;
  value: number; // amount or count
  color: string;
}

export interface VisitDay {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface TopShop {
  id: string;
  name: string;
  thumbnail: string;
  visits: number;
  spend: number;
}

export interface ServicePref {
  service: string;
  bookings: number;
}

export const ACTIVITY_STATS: ActivityStats = {
  totalBookings: 47,
  totalSpending: 38_250,
  totalRewards: 2140,
  favoriteCategory: "Salon",
  visitsThisMonth: 6,
};

export const MONTHLY_SPEND: MonthlySpend[] = [
  { month: "Jan", amount: 2400 },
  { month: "Feb", amount: 1800 },
  { month: "Mar", amount: 3200 },
  { month: "Apr", amount: 2900 },
  { month: "May", amount: 4100 },
  { month: "Jun", amount: 3600 },
  { month: "Jul", amount: 5200 },
  { month: "Aug", amount: 4400 },
  { month: "Sep", amount: 3850 },
  { month: "Oct", amount: 4600 },
  { month: "Nov", amount: 3100 },
  { month: "Dec", amount: 5100 },
];

export const CATEGORY_SHARE: CategoryShare[] = [
  { name: "Salon", value: 42, color: "#6366f1" },
  { name: "Spa", value: 24, color: "#ec4899" },
  { name: "Skin", value: 16, color: "#f59e0b" },
  { name: "Nails", value: 10, color: "#10b981" },
  { name: "Wellness", value: 8, color: "#06b6d4" },
];

// Generate visit days for the current month
function buildVisits(): VisitDay[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const last = new Date(year, month + 1, 0).getDate();
  const days: VisitDay[] = [];
  // Deterministic pseudo-random sparse visits
  for (let d = 1; d <= last; d++) {
    const seed = (d * 9301 + 49297) % 233280;
    const r = seed / 233280;
    let count = 0;
    if (r > 0.82) count = 3;
    else if (r > 0.65) count = 2;
    else if (r > 0.45) count = 1;
    days.push({
      date: `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      count,
    });
  }
  return days;
}
export const VISIT_DAYS = buildVisits();

const img = (seed: string) =>
  `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=160&h=160&q=70`;

export const TOP_SHOPS: TopShop[] = [
  {
    id: "s1",
    name: "Glow Studio",
    thumbnail: img("1560066984-138dadb4c035"),
    visits: 12,
    spend: 14400,
  },
  {
    id: "s2",
    name: "Urban Spa",
    thumbnail: img("1544161515-4ab6ce6db874"),
    visits: 8,
    spend: 9800,
  },
  {
    id: "s3",
    name: "The Barber Co.",
    thumbnail: img("1503951914875-452162b0f3f1"),
    visits: 6,
    spend: 4200,
  },
];

export const SERVICE_PREFS: ServicePref[] = [
  { service: "Haircut", bookings: 14 },
  { service: "Facial", bookings: 9 },
  { service: "Hair Color", bookings: 7 },
  { service: "Body Spa", bookings: 6 },
  { service: "Manicure", bookings: 5 },
  { service: "Skin Treatment", bookings: 4 },
];

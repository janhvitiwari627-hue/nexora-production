export const ownerBusiness = {
  name: "Luxe Hair & Spa",
  logo: "",
  isOpen: true,
};

export const kpis = [
  { label: "Today's Revenue", value: "₹24,580", delta: 12.4, positive: true, suffix: "vs yesterday" },
  { label: "Today's Bookings", value: "38", delta: 8.1, positive: true, suffix: "vs yesterday" },
  { label: "Pending Appointments", value: "6", delta: -3.2, positive: false, suffix: "vs yesterday" },
  { label: "New Customers", value: "12", delta: 22.0, positive: true, suffix: "vs yesterday" },
];

// Deterministic pseudo-random so SSR and client agree (no Math.random at module scope).
const seeded = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
};

const rDaily = seeded(101);
export const revenueDaily = Array.from({ length: 14 }, (_, i) => ({
  label: `D${i + 1}`,
  revenue: 8000 + Math.round(Math.sin(i / 2) * 3000 + rDaily() * 4000 + i * 400),
}));
const rWeekly = seeded(202);
export const revenueWeekly = Array.from({ length: 8 }, (_, i) => ({
  label: `W${i + 1}`,
  revenue: 45000 + Math.round(Math.cos(i / 2) * 8000 + rWeekly() * 6000 + i * 1500),
}));
const rMonthly = seeded(303);
export const revenueMonthly = [
  "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"
].map((m, i) => ({ label: m, revenue: 180000 + Math.round(Math.sin(i) * 20000 + rMonthly() * 30000 + i * 4000) }));

// month calendar density (current month) — use UTC + seeded random to keep SSR == CSR.
const now = new Date();
const daysInMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).getUTCDate();
const rDensity = seeded(now.getUTCFullYear() * 100 + now.getUTCMonth());
export const calendarDensity = Array.from({ length: daysInMonth }, (_, i) => ({
  day: i + 1,
  count: Math.floor(rDensity() * 14),
}));
export const calendarFirstWeekday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).getUTCDay();
export const calendarMonthLabel = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  .toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

export type BookingStatus = "confirmed" | "pending" | "completed" | "cancelled";
export const recentBookings: {
  id: string; customer: string; avatar: string; service: string; time: string; status: BookingStatus;
}[] = [
  { id: "B-2041", customer: "Priya Sharma", avatar: "PS", service: "Hair Color + Cut", time: "10:30 AM", status: "confirmed" },
  { id: "B-2042", customer: "Aman Verma", avatar: "AV", service: "Beard Styling", time: "11:15 AM", status: "pending" },
  { id: "B-2043", customer: "Riya Kapoor", avatar: "RK", service: "Facial Glow", time: "12:00 PM", status: "confirmed" },
  { id: "B-2044", customer: "Kunal Mehra", avatar: "KM", service: "Hair Spa", time: "01:30 PM", status: "completed" },
  { id: "B-2045", customer: "Neha Singh", avatar: "NS", service: "Bridal Makeup Trial", time: "03:00 PM", status: "pending" },
];

export const pendingApprovals = [
  { id: "B-2042", customer: "Aman Verma", service: "Beard Styling", time: "Today · 11:15 AM" },
  { id: "B-2045", customer: "Neha Singh", service: "Bridal Makeup Trial", time: "Today · 03:00 PM" },
  { id: "B-2049", customer: "Sara Khan", service: "Manicure + Pedicure", time: "Tomorrow · 10:00 AM" },
];

export const customerInsights = [
  { week: "W1", new: 22, returning: 48 },
  { week: "W2", new: 28, returning: 52 },
  { week: "W3", new: 19, returning: 61 },
  { week: "W4", new: 34, returning: 58 },
];

export const topPerformer = {
  name: "Anjali Rao",
  role: "Senior Stylist",
  avatar: "AR",
  bookings: 64,
  revenue: "₹1,82,400",
};

export const recentReviews = [
  { id: "r1", author: "Priya S.", rating: 5, text: "Best hair color experience I've had in years — Anjali is magic!" },
  { id: "r2", author: "Kunal M.", rating: 4, text: "Loved the head massage. Could improve waiting area comfort." },
  { id: "r3", author: "Riya K.", rating: 5, text: "Facial left my skin glowing for days. Booking again next week." },
];

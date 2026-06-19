export type AdminKPI = {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down";
  icon: string;
};

export const ADMIN_KPIS: AdminKPI[] = [
  { label: "Total Businesses", value: "12,847", delta: "+184 this week", trend: "up", icon: "Building2" },
  { label: "Total Customers", value: "4.82L", delta: "+12.3%", trend: "up", icon: "Users" },
  { label: "Bookings Today", value: "8,341", delta: "+6.1%", trend: "up", icon: "CalendarCheck" },
  { label: "Revenue MTD", value: "₹3.42Cr", delta: "+18.7%", trend: "up", icon: "IndianRupee" },
  { label: "Active Memberships", value: "94,512", delta: "+3.2%", trend: "up", icon: "Crown" },
  { label: "Pending Approvals", value: "247", delta: "Action needed", trend: "down", icon: "AlertCircle" },
];

export const REVENUE_TREND = [
  { day: "Mon", revenue: 4.2 }, { day: "Tue", revenue: 4.8 }, { day: "Wed", revenue: 5.1 },
  { day: "Thu", revenue: 4.9 }, { day: "Fri", revenue: 6.4 }, { day: "Sat", revenue: 8.2 },
  { day: "Sun", revenue: 7.1 },
];

export const BOOKING_VOLUME = [
  { day: "Mon", bookings: 5200 }, { day: "Tue", bookings: 6100 }, { day: "Wed", bookings: 6800 },
  { day: "Thu", bookings: 6500 }, { day: "Fri", bookings: 8100 }, { day: "Sat", bookings: 9800 },
  { day: "Sun", bookings: 8400 },
];

export const USER_GROWTH = [
  { month: "Jan", users: 320000 }, { month: "Feb", users: 348000 }, { month: "Mar", users: 381000 },
  { month: "Apr", users: 412000 }, { month: "May", users: 451000 }, { month: "Jun", users: 482000 },
];

export const PENDING_ACTIONS = [
  { label: "Pending business approvals", count: 247, to: "/admin/businesses" as const, severity: "high" },
  { label: "Unresolved support tickets", count: 89, to: "/admin/businesses" as const, severity: "medium" },
  { label: "Flagged reviews", count: 34, to: "/admin/businesses" as const, severity: "medium" },
  { label: "Payout disputes", count: 12, to: "/admin/businesses" as const, severity: "high" },
  { label: "KYC re-verification", count: 56, to: "/admin/businesses" as const, severity: "low" },
];

export const RECENT_ACTIVITY = [
  { id: "a1", actor: "Aarav Mehta", action: "approved", target: "Luxe Hair & Spa", time: "2m ago", icon: "CheckCircle2" },
  { id: "a2", actor: "System", action: "auto-suspended", target: "QuickCuts Barbershop", time: "14m ago", icon: "Ban" },
  { id: "a3", actor: "Sonia Rao", action: "resolved ticket", target: "#TKT-8421", time: "31m ago", icon: "MessageSquare" },
  { id: "a4", actor: "Vikram Singh", action: "rejected", target: "Glow Beauty Studio", time: "1h ago", icon: "XCircle" },
  { id: "a5", actor: "Aarav Mehta", action: "added admin", target: "deepa@nexora.app", time: "2h ago", icon: "UserPlus" },
];

export const CITY_HEATMAP = [
  { city: "Mumbai", activity: 98 },
  { city: "Bengaluru", activity: 92 },
  { city: "Delhi NCR", activity: 89 },
  { city: "Hyderabad", activity: 74 },
  { city: "Pune", activity: 68 },
  { city: "Chennai", activity: 64 },
  { city: "Kolkata", activity: 51 },
  { city: "Ahmedabad", activity: 47 },
  { city: "Jaipur", activity: 38 },
  { city: "Lucknow", activity: 29 },
];

export type CustomerTag =
  | "new"
  | "regular"
  | "vip"
  | "lost"
  | "inactive"
  | "high_value"
  | "membership"
  | "referral_champion";

export interface CustomerVisit {
  id: string;
  date: string;
  service: string;
  staff: string;
  amount: number;
  status: "completed" | "cancelled" | "no_show";
}

export interface CRMCustomer {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  avatar: string;
  lastVisit: string;
  totalVisits: number;
  lifetimeSpend: number;
  tags: CustomerTag[];
  notes: string;
  visits: CustomerVisit[];
  birthdayMonth: number; // 1-12
  birthdayDay: number;
}

export const TAG_META: Record<CustomerTag, { label: string; bg: string; text: string }> = {
  new: { label: "New", bg: "bg-success/15", text: "text-success" },
  regular: { label: "Regular", bg: "bg-primary/15", text: "text-primary" },
  vip: { label: "VIP", bg: "bg-warning/20", text: "text-warning" },
  lost: { label: "Lost", bg: "bg-danger/15", text: "text-danger" },
  inactive: { label: "Inactive", bg: "bg-muted", text: "text-muted-foreground" },
  high_value: { label: "High Value", bg: "bg-warning/15", text: "text-warning" },
  membership: { label: "Membership", bg: "bg-primary/10", text: "text-primary-dark" },
  referral_champion: { label: "Referral Champ", bg: "bg-success/15", text: "text-success" },
};

const today = new Date();
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

function makeVisits(seed: number, count: number, lastDaysAgo: number): CustomerVisit[] {
  const services = [
    "Haircut & Style",
    "Hair Color",
    "Facial Glow",
    "Manicure",
    "Beard Trim",
    "Hair Spa",
    "Pedicure",
  ];
  const staff = ["Anjali Rao", "Rohit Sen", "Meera Iyer", "Karan Bhatt"];
  return Array.from({ length: count }, (_, i) => ({
    id: `v${seed}-${i}`,
    date: daysAgo(lastDaysAgo + i * 21),
    service: services[(seed + i) % services.length],
    staff: staff[(seed + i) % staff.length],
    amount: 500 + ((seed * 37 + i * 119) % 4500),
    status: i % 9 === 0 ? "cancelled" : "completed",
  }));
}

const NAMES: [string, string, string][] = [
  ["Priya Sharma", "9876543210", "priya@example.com"],
  ["Aman Verma", "9811234567", "aman@example.com"],
  ["Riya Kapoor", "9900112233", "riya@example.com"],
  ["Kunal Mehra", "9821098765", "kunal@example.com"],
  ["Neha Singh", "9765432109", "neha@example.com"],
  ["Sara Khan", "9871122334", "sara@example.com"],
  ["Vikram Patel", "9988776655", "vikram@example.com"],
  ["Anita Desai", "9012345678", "anita@example.com"],
  ["Rahul Joshi", "9123456789", "rahul@example.com"],
  ["Ishita Roy", "9234567812", "ishita@example.com"],
  ["Meera Nair", "9345678123", "meera@example.com"],
  ["Arjun Rao", "9456781234", "arjun@example.com"],
  ["Divya Menon", "9567812345", "divya@example.com"],
  ["Sahil Kapoor", "9678123456", "sahil@example.com"],
  ["Tanvi Bose", "9789234567", "tanvi@example.com"],
];

const TAG_RECIPES: CustomerTag[][] = [
  ["vip", "high_value", "membership"],
  ["regular"],
  ["new"],
  ["lost"],
  ["inactive"],
  ["regular", "referral_champion"],
  ["vip", "high_value"],
  ["new", "membership"],
  ["lost"],
  ["regular"],
  ["vip", "referral_champion"],
  ["new"],
  ["regular", "high_value"],
  ["inactive"],
  ["regular", "membership"],
];

export const crmCustomers: CRMCustomer[] = NAMES.map(([name, mobile, email], i) => {
  const lastDaysOptions = [2, 8, 14, 21, 30, 45, 65, 90, 120, 5, 12, 35, 7, 80, 3];
  const lastDays = lastDaysOptions[i];
  const visits = 1 + (i % 12);
  const visitHistory = makeVisits(i + 1, Math.min(visits, 6), lastDays);
  const spend = visitHistory.reduce((s, v) => s + v.amount, 0) * Math.ceil(visits / 6);
  return {
    id: `c${i + 1}`,
    name,
    mobile,
    email,
    avatar: name
      .split(" ")
      .map((s) => s[0])
      .join(""),
    lastVisit: daysAgo(lastDays),
    totalVisits: visits,
    lifetimeSpend: spend,
    tags: TAG_RECIPES[i],
    notes: i % 4 === 0 ? "Prefers organic hair products. Allergic to ammonia." : "",
    visits: visitHistory,
    birthdayMonth: ((i * 7) % 12) + 1,
    birthdayDay: ((i * 13) % 27) + 1,
  };
});

export function daysSince(dateStr: string): number {
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function isLostCustomer(c: CRMCustomer): boolean {
  return daysSince(c.lastVisit) >= 60;
}

export function isBirthdayThisMonth(c: CRMCustomer): boolean {
  return c.birthdayMonth === new Date().getMonth() + 1;
}

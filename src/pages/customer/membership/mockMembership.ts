export type Tier = "Silver" | "Gold" | "Platinum";

export interface MembershipPlan {
  tier: Tier;
  memberName: string;
  memberId: string;
  memberSince: string;
  expiresOn: string;
  savingsToDate: number;
  benefits: string[];
}

export const mockActivePlan: MembershipPlan = {
  tier: "Gold",
  memberName: "Ananya Sharma",
  memberId: "NX-GLD-99481",
  memberSince: "Mar 2024",
  expiresOn: "12 Apr 2026",
  savingsToDate: 8420,
  benefits: [
    "10% off every booking",
    "Priority slot reservation",
    "Free birthday hair spa",
    "2× reward points on weekends",
    "Early access to seasonal offers",
    "Dedicated concierge chat",
  ],
};

export interface HistoryItem {
  id: string;
  tier: Tier;
  period: string;
  amountPaid: number;
  savings: number;
}

export const mockHistory: HistoryItem[] = [
  { id: "h1", tier: "Gold", period: "Apr 2025 – Apr 2026", amountPaid: 1499, savings: 5240 },
  { id: "h2", tier: "Silver", period: "Apr 2024 – Apr 2025", amountPaid: 499, savings: 1820 },
  { id: "h3", tier: "Silver", period: "Mar 2023 – Mar 2024", amountPaid: 399, savings: 1360 },
];

export interface PlanRow {
  feature: string;
  Silver: string | boolean;
  Gold: string | boolean;
  Platinum: string | boolean;
}

export const planRows: PlanRow[] = [
  { feature: "Booking discount", Silver: "5%", Gold: "10%", Platinum: "15%" },
  { feature: "Reward points multiplier", Silver: "1×", Gold: "2×", Platinum: "3×" },
  { feature: "Priority slot reservation", Silver: false, Gold: true, Platinum: true },
  { feature: "Free birthday service", Silver: false, Gold: true, Platinum: true },
  { feature: "Concierge chat", Silver: false, Gold: true, Platinum: true },
  { feature: "Exclusive partner offers", Silver: false, Gold: false, Platinum: true },
  { feature: "Complimentary monthly add-on", Silver: false, Gold: false, Platinum: true },
  { feature: "Annual price", Silver: "₹499", Gold: "₹1,499", Platinum: "₹2,999" },
];

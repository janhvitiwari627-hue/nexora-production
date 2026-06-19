export type RewardStatus = "confirmed" | "pending" | "expired";

export interface RewardHistoryEntry {
  id: string;
  dateISO: string;
  shopName: string;
  amount: number;
  pointsEarned: number;
  status: RewardStatus;
}

export interface ExpiringPoints {
  points: number;
  expiresOnISO: string;
}

export const mockPoints = {
  available: 1840,
  pending: 220,
  redeemed: 950,
  lifetime: 3010,
  nextTier: "Platinum" as const,
  pointsToNextTier: 660,
  tierProgressMax: 2500,
};

export const mockHistory: RewardHistoryEntry[] = [
  {
    id: "RH-1",
    dateISO: new Date(Date.now() - 86400000 * 3).toISOString(),
    shopName: "Glow & Co. Salon",
    amount: 1599,
    pointsEarned: 32,
    status: "confirmed",
  },
  {
    id: "RH-2",
    dateISO: new Date(Date.now() - 86400000 * 8).toISOString(),
    shopName: "The Nail Bar",
    amount: 899,
    pointsEarned: 18,
    status: "confirmed",
  },
  {
    id: "RH-3",
    dateISO: new Date(Date.now() - 86400000 * 14).toISOString(),
    shopName: "Serene Spa & Wellness",
    amount: 1899,
    pointsEarned: 38,
    status: "pending",
  },
  {
    id: "RH-4",
    dateISO: new Date(Date.now() - 86400000 * 32).toISOString(),
    shopName: "Urban Cuts Barber",
    amount: 398,
    pointsEarned: 8,
    status: "confirmed",
  },
  {
    id: "RH-5",
    dateISO: new Date(Date.now() - 86400000 * 220).toISOString(),
    shopName: "Glow & Co. Salon",
    amount: 600,
    pointsEarned: 12,
    status: "expired",
  },
];

export const mockExpiring: ExpiringPoints = {
  points: 180,
  expiresOnISO: new Date(Date.now() + 86400000 * 22).toISOString(),
};

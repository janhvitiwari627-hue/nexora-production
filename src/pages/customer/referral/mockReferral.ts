export type ReferralStatus = "joined" | "booked" | "rewarded" | "pending";

export interface ReferralRow {
  id: string;
  friendName: string;
  dateISO: string;
  status: ReferralStatus;
  rewardAmount: number;
}

export const mockReferralCode = "ANANYA240";
export const mockReferralLink = `https://nexora.app/r/${mockReferralCode}`;

export const mockReferralStats = {
  totalInvites: 14,
  successful: 6,
  rewardsEarned: 600,
  pending: 200,
};

const d = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

export const mockReferrals: ReferralRow[] = [
  { id: "f1", friendName: "Riya Mehta", dateISO: d(2), status: "rewarded", rewardAmount: 100 },
  { id: "f2", friendName: "Ankit Verma", dateISO: d(5), status: "booked", rewardAmount: 100 },
  { id: "f3", friendName: "Sneha Iyer", dateISO: d(8), status: "joined", rewardAmount: 0 },
  { id: "f4", friendName: "Karthik Rao", dateISO: d(14), status: "rewarded", rewardAmount: 100 },
  { id: "f5", friendName: "Meera Kapoor", dateISO: d(20), status: "pending", rewardAmount: 0 },
  { id: "f6", friendName: "Vihaan Patel", dateISO: d(28), status: "rewarded", rewardAmount: 100 },
];

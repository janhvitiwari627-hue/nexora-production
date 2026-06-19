export type WalletBucket = "reward" | "referral" | "cashback";
export type TxnType = "credit" | "debit" | "refund";

export interface WalletTxn {
  id: string;
  dateISO: string;
  bucket: WalletBucket;
  type: TxnType;
  amount: number;
  description: string;
}

export interface RefundItem {
  id: string;
  bookingId: string;
  shopName: string;
  amount: number;
  initiatedISO: string;
  expectedISO: string;
  status: "initiated" | "processing" | "completed";
}

export const mockWallet = {
  total: 2380,
  reward: 1250,
  referral: 600,
  cashback: 530,
};

const d = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

export const mockTxns: WalletTxn[] = [
  { id: "T1", dateISO: d(0), bucket: "reward", type: "credit", amount: 120, description: "Booking reward — Glow & Co." },
  { id: "T2", dateISO: d(2), bucket: "referral", type: "credit", amount: 100, description: "Referral bonus — Riya joined" },
  { id: "T3", dateISO: d(3), bucket: "cashback", type: "credit", amount: 80, description: "Weekend cashback — Serene Spa" },
  { id: "T4", dateISO: d(5), bucket: "reward", type: "debit", amount: 200, description: "Redeemed on booking BK-23984" },
  { id: "T5", dateISO: d(8), bucket: "cashback", type: "refund", amount: 499, description: "Refund — Aromatherapy cancelled" },
  { id: "T6", dateISO: d(14), bucket: "referral", type: "credit", amount: 100, description: "Referral bonus — Ankit joined" },
  { id: "T7", dateISO: d(22), bucket: "reward", type: "credit", amount: 50, description: "Review bonus — The Nail Bar" },
  { id: "T8", dateISO: d(40), bucket: "reward", type: "debit", amount: 150, description: "Discount applied — BK-23720" },
];

export const mockRefunds: RefundItem[] = [
  {
    id: "RF-1",
    bookingId: "BK-23410",
    shopName: "Serene Spa & Wellness",
    amount: 499,
    initiatedISO: d(2),
    expectedISO: new Date(Date.now() + 86400000 * 3).toISOString(),
    status: "processing",
  },
  {
    id: "RF-2",
    bookingId: "BK-23380",
    shopName: "The Nail Bar",
    amount: 599,
    initiatedISO: d(8),
    expectedISO: d(1),
    status: "completed",
  },
];

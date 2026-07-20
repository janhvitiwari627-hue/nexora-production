export type RewardStatus = "credited" | "pending" | "failed";

export interface QRPayment {
  id: string;
  txnId: string;
  shopName: string;
  shopThumbnail: string;
  category: string;
  dateTime: string; // ISO
  amount: number;
  rewardEarned: number;
  rewardStatus: RewardStatus;
  paymentMethod: string;
  invoiceUrl?: string;
}

const d = (daysAgo: number, h = 12, m = 0) => {
  const dt = new Date();
  dt.setDate(dt.getDate() - daysAgo);
  dt.setHours(h, m, 0, 0);
  return dt.toISOString();
};

const img = (seed: string) =>
  `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=160&h=160&q=70`;

export const QR_PAYMENTS: QRPayment[] = [
  {
    id: "q1",
    txnId: "NXQR-90234A",
    shopName: "Glow Studio",
    shopThumbnail: img("1560066984-138dadb4c035"),
    category: "Salon",
    dateTime: d(1, 18, 30),
    amount: 1450,
    rewardEarned: 72,
    rewardStatus: "credited",
    paymentMethod: "UPI · GPay",
    invoiceUrl: "#",
  },
  {
    id: "q2",
    txnId: "NXQR-90187C",
    shopName: "Urban Spa",
    shopThumbnail: img("1544161515-4ab6ce6db874"),
    category: "Spa",
    dateTime: d(3, 11, 15),
    amount: 2800,
    rewardEarned: 140,
    rewardStatus: "credited",
    paymentMethod: "UPI · PhonePe",
    invoiceUrl: "#",
  },
  {
    id: "q3",
    txnId: "NXQR-89923B",
    shopName: "The Barber Co.",
    shopThumbnail: img("1503951914875-452162b0f3f1"),
    category: "Salon",
    dateTime: d(7, 16, 5),
    amount: 600,
    rewardEarned: 30,
    rewardStatus: "pending",
    paymentMethod: "UPI · GPay",
  },
  {
    id: "q4",
    txnId: "NXQR-89455F",
    shopName: "Bliss Nails",
    shopThumbnail: img("1604654894610-df63bc536371"),
    category: "Nails",
    dateTime: d(14, 14, 20),
    amount: 950,
    rewardEarned: 0,
    rewardStatus: "failed",
    paymentMethod: "UPI · Paytm",
    invoiceUrl: "#",
  },
  {
    id: "q5",
    txnId: "NXQR-88991D",
    shopName: "Skin Aura Clinic",
    shopThumbnail: img("1570172619644-dfd03ed5d881"),
    category: "Skin",
    dateTime: d(21, 10, 0),
    amount: 3500,
    rewardEarned: 175,
    rewardStatus: "credited",
    paymentMethod: "UPI · GPay",
    invoiceUrl: "#",
  },
  {
    id: "q6",
    txnId: "NXQR-88514E",
    shopName: "Glow Studio",
    shopThumbnail: img("1560066984-138dadb4c035"),
    category: "Salon",
    dateTime: d(28, 19, 45),
    amount: 1200,
    rewardEarned: 60,
    rewardStatus: "credited",
    paymentMethod: "UPI · PhonePe",
    invoiceUrl: "#",
  },
];

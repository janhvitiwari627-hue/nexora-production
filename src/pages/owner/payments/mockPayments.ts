export type Transaction = {
  id: string;
  bookingId: string;
  customer: string;
  service: string;
  amount: number;
  fee: number;
  net: number;
  date: string;
  status: "settled" | "pending" | "processing";
};

export type Settlement = {
  id: string;
  date: string;
  count: number;
  gross: number;
  fees: number;
  net: number;
  status: "completed" | "processing" | "failed";
};

export const PAYOUT_SUMMARY = {
  pending: 24850,
  nextSettlement: "in 2 days, 14 hours",
  thisMonth: 187650,
  lastMonth: 162400,
};

export const TRANSACTIONS: Transaction[] = [
  {
    id: "t1",
    bookingId: "BK10428",
    customer: "Priya Sharma",
    service: "Bridal Makeup",
    amount: 8500,
    fee: 850,
    net: 7650,
    date: "Jun 18, 2026",
    status: "pending",
  },
  {
    id: "t2",
    bookingId: "BK10427",
    customer: "Ananya Iyer",
    service: "Hair Spa",
    amount: 1800,
    fee: 180,
    net: 1620,
    date: "Jun 18, 2026",
    status: "pending",
  },
  {
    id: "t3",
    bookingId: "BK10425",
    customer: "Rohit Mehta",
    service: "Haircut + Beard",
    amount: 950,
    fee: 95,
    net: 855,
    date: "Jun 17, 2026",
    status: "pending",
  },
  {
    id: "t4",
    bookingId: "BK10421",
    customer: "Kavya Reddy",
    service: "Manicure + Pedicure",
    amount: 2200,
    fee: 220,
    net: 1980,
    date: "Jun 17, 2026",
    status: "settled",
  },
  {
    id: "t5",
    bookingId: "BK10418",
    customer: "Neha Kapoor",
    service: "Hair Color",
    amount: 4500,
    fee: 450,
    net: 4050,
    date: "Jun 16, 2026",
    status: "settled",
  },
  {
    id: "t6",
    bookingId: "BK10415",
    customer: "Sneha Patil",
    service: "Facial",
    amount: 1500,
    fee: 150,
    net: 1350,
    date: "Jun 15, 2026",
    status: "settled",
  },
];

export const SETTLEMENTS: Settlement[] = [
  {
    id: "s1",
    date: "Jun 14, 2026",
    count: 47,
    gross: 68500,
    fees: 6850,
    net: 61650,
    status: "completed",
  },
  {
    id: "s2",
    date: "Jun 7, 2026",
    count: 52,
    gross: 74300,
    fees: 7430,
    net: 66870,
    status: "completed",
  },
  {
    id: "s3",
    date: "May 31, 2026",
    count: 38,
    gross: 51200,
    fees: 5120,
    net: 46080,
    status: "completed",
  },
  {
    id: "s4",
    date: "May 24, 2026",
    count: 41,
    gross: 58900,
    fees: 5890,
    net: 53010,
    status: "completed",
  },
];

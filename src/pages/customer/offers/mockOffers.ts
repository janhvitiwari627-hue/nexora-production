export type OfferCategory = "available" | "membership" | "festival" | "partner" | "expired";

export interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  discountLabel: string; // e.g. "20% OFF" or "₹200 OFF"
  minOrder?: number;
  maxDiscount?: number;
  expiresAt: string; // ISO
  applicableServices: string[];
  category: OfferCategory;
  brandLogo?: string;
  termsUrl?: string;
}

const inDays = (n: number) => new Date(Date.now() + n * 86400000).toISOString();

export const COUPONS: Coupon[] = [
  {
    id: "c1",
    code: "WELCOME20",
    title: "Welcome Offer",
    description: "Flat 20% off your first booking on any salon service.",
    discountLabel: "20% OFF",
    minOrder: 500,
    maxDiscount: 300,
    expiresAt: inDays(12),
    applicableServices: ["Haircut", "Hair Color", "Spa"],
    category: "available",
  },
  {
    id: "c2",
    code: "GLOW150",
    title: "Glow Up",
    description: "₹150 off on premium facial treatments.",
    discountLabel: "₹150 OFF",
    minOrder: 800,
    expiresAt: inDays(5),
    applicableServices: ["Facial", "Skin Care"],
    category: "available",
  },
  {
    id: "m1",
    code: "GOLD25",
    title: "Gold Member Exclusive",
    description: "25% off across all partner spas every weekend.",
    discountLabel: "25% OFF",
    expiresAt: inDays(60),
    applicableServices: ["Spa", "Massage", "Wellness"],
    category: "membership",
  },
  {
    id: "f1",
    code: "DIWALI500",
    title: "Diwali Glow",
    description: "Festive ₹500 off on bookings above ₹2,500.",
    discountLabel: "₹500 OFF",
    minOrder: 2500,
    expiresAt: inDays(20),
    applicableServices: ["All Services"],
    category: "festival",
  },
  {
    id: "p1",
    code: "AMEXNX10",
    title: "Amex Card Offer",
    description: "Extra 10% cashback with Amex credit cards.",
    discountLabel: "10% CASHBACK",
    expiresAt: inDays(45),
    applicableServices: ["All Services"],
    category: "partner",
  },
  {
    id: "p2",
    code: "ZOMATOPRO",
    title: "Zomato Pro Partner",
    description: "Flat ₹250 off for Zomato Pro members.",
    discountLabel: "₹250 OFF",
    expiresAt: inDays(30),
    applicableServices: ["Dining-linked Services"],
    category: "partner",
  },
  {
    id: "e1",
    code: "MONSOON15",
    title: "Monsoon Special",
    description: "15% off — expired last month.",
    discountLabel: "15% OFF",
    expiresAt: inDays(-10),
    applicableServices: ["Haircut"],
    category: "expired",
  },
];

import type { Service } from "@/components/shared/ServiceCard";
import type { Staff } from "@/components/shared/StaffCard";

export type PaymentMethod = "upi" | "qr" | "card";

export type BookingState = {
  shopName: string;
  shopAddress: string;
  services: Service[];
  selectedServiceIds: string[];
  staff: Staff[];
  selectedStaffId: string | null;
  date: string | null; // YYYY-MM-DD
  time: string | null; // HH:mm
  coupon: string;
  couponApplied: { code: string; discount: number } | null;
  useRewards: boolean;
  rewardBalance: number;
  paymentMethod: PaymentMethod;
};

export const PLATFORM_FEE = 25;
export const ADVANCE_RATIO = 0.25;
export const REWARD_VALUE_PER_POINT = 1;
export const VALID_COUPONS: Record<string, number> = {
  FIRST20: 0.2,
  GLOW999: 0.15,
  BRIDE25: 0.25,
};

export function selectedServices(b: BookingState): Service[] {
  return b.services.filter((s) => b.selectedServiceIds.includes(s.id));
}

export function subtotal(b: BookingState): number {
  return selectedServices(b).reduce((sum, s) => sum + (s.offer_price ?? s.price), 0);
}

export function totalDuration(b: BookingState): number {
  return selectedServices(b).reduce((sum, s) => sum + s.duration_minutes, 0);
}

export function couponDiscount(b: BookingState): number {
  if (!b.couponApplied) return 0;
  return Math.round(subtotal(b) * b.couponApplied.discount);
}

export function rewardsDiscount(b: BookingState): number {
  if (!b.useRewards) return 0;
  const max = Math.floor(subtotal(b) * 0.1); // cap rewards at 10% of subtotal
  return Math.min(b.rewardBalance * REWARD_VALUE_PER_POINT, max);
}

export function grandTotal(b: BookingState): number {
  return Math.max(0, subtotal(b) + PLATFORM_FEE - couponDiscount(b) - rewardsDiscount(b));
}

export function advancePayable(b: BookingState): number {
  return Math.round(grandTotal(b) * ADVANCE_RATIO);
}

export function formatINR(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

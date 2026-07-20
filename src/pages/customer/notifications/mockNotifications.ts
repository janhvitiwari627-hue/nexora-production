export type NotificationType = "booking" | "reward" | "wallet" | "offer" | "referral" | "system";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  createdAt: string; // ISO
  read: boolean;
  href?: string;
}

const ago = (mins: number) => new Date(Date.now() - mins * 60_000).toISOString();

export const NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    type: "booking",
    title: "Booking confirmed",
    description: "Your appointment at Glow Studio is confirmed for Sat, 4:30 PM.",
    createdAt: ago(8),
    read: false,
    href: "/dashboard/bookings",
  },
  {
    id: "n2",
    type: "reward",
    title: "You earned 120 points",
    description: "Great job! Points credited from your last visit at Urban Spa.",
    createdAt: ago(55),
    read: false,
    href: "/dashboard/rewards",
  },
  {
    id: "n3",
    type: "offer",
    title: "Diwali Glow — ₹500 OFF",
    description: "Festive offer unlocked. Use code DIWALI500 before it expires.",
    createdAt: ago(60 * 3),
    read: false,
    href: "/dashboard/offers",
  },
  {
    id: "n4",
    type: "wallet",
    title: "Refund processed",
    description: "₹450 credited to your Nexora Wallet for cancelled booking #B-2031.",
    createdAt: ago(60 * 9),
    read: true,
    href: "/dashboard/wallet",
  },
  {
    id: "n5",
    type: "referral",
    title: "Aarav joined Nexora 🎉",
    description: "Your friend signed up using your code. ₹100 will unlock on their first booking.",
    createdAt: ago(60 * 26),
    read: true,
    href: "/dashboard/referrals",
  },
  {
    id: "n6",
    type: "system",
    title: "Profile updated",
    description: "Your phone number was changed successfully.",
    createdAt: ago(60 * 48),
    read: true,
  },
  {
    id: "n7",
    type: "booking",
    title: "Rate your last visit",
    description: "How was your experience at The Barber Co.? Share a quick review.",
    createdAt: ago(60 * 70),
    read: true,
    href: "/dashboard/reviews",
  },
];

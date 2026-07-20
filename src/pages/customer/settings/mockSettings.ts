export interface Address {
  id: string;
  label: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface ActiveDevice {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastSeen: string;
  current: boolean;
}

export interface LoginEntry {
  id: string;
  at: string;
  device: string;
  ip: string;
  location: string;
  status: "success" | "failed";
}

export interface UpiId {
  id: string;
  vpa: string;
  preferred: boolean;
}

export interface SavedCard {
  id: string;
  brand: "Visa" | "Mastercard" | "RuPay" | "Amex";
  last4: string;
  expiry: string;
  preferred: boolean;
}

export const PROFILE = {
  fullName: "Aarav Sharma",
  username: "aarav.sharma",
  gender: "male" as "male" | "female" | "other" | "prefer_not",
  dob: "1996-04-12",
  country: "India",
  state: "Karnataka",
  city: "Bengaluru",
  email: "aarav.sharma@example.com",
  emailVerified: true,
  phone: "+91 98765 43210",
  phoneVerified: true,
  avatarUrl: "",
};

export const ADDRESSES: Address[] = [
  {
    id: "a1",
    label: "Home",
    line1: "B-204, Skyline Residency, HSR Layout",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560102",
    isDefault: true,
  },
  {
    id: "a2",
    label: "Work",
    line1: "5th Floor, Innov8, Koramangala",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560034",
    isDefault: false,
  },
];

export const ACTIVE_DEVICES: ActiveDevice[] = [
  {
    id: "d1",
    device: "iPhone 15 Pro",
    browser: "Safari",
    location: "Bengaluru, IN",
    lastSeen: "2026-06-19T11:14:00Z",
    current: true,
  },
  {
    id: "d2",
    device: "MacBook Pro",
    browser: "Chrome 128",
    location: "Bengaluru, IN",
    lastSeen: "2026-06-18T20:02:00Z",
    current: false,
  },
  {
    id: "d3",
    device: "Pixel 8",
    browser: "Chrome Mobile",
    location: "Mumbai, IN",
    lastSeen: "2026-06-14T08:30:00Z",
    current: false,
  },
];

export const LOGIN_HISTORY: LoginEntry[] = [
  {
    id: "l1",
    at: "2026-06-19T11:14:00Z",
    device: "iPhone 15 Pro · Safari",
    ip: "103.21.x.x",
    location: "Bengaluru, IN",
    status: "success",
  },
  {
    id: "l2",
    at: "2026-06-18T20:02:00Z",
    device: "MacBook Pro · Chrome",
    ip: "103.21.x.x",
    location: "Bengaluru, IN",
    status: "success",
  },
  {
    id: "l3",
    at: "2026-06-17T07:45:00Z",
    device: "Unknown · Firefox",
    ip: "45.118.x.x",
    location: "Hyderabad, IN",
    status: "failed",
  },
  {
    id: "l4",
    at: "2026-06-14T08:30:00Z",
    device: "Pixel 8 · Chrome Mobile",
    ip: "49.207.x.x",
    location: "Mumbai, IN",
    status: "success",
  },
];

export const UPI_IDS: UpiId[] = [
  { id: "u1", vpa: "aarav@okhdfc", preferred: true },
  { id: "u2", vpa: "aarav.sharma@okaxis", preferred: false },
];

export const SAVED_CARDS: SavedCard[] = [
  { id: "c1", brand: "Visa", last4: "4242", expiry: "08/27", preferred: false },
  { id: "c2", brand: "RuPay", last4: "8821", expiry: "11/26", preferred: false },
];

export const NOTIF_TYPES = [
  { key: "bookings", label: "Booking updates" },
  { key: "rewards", label: "Rewards & points" },
  { key: "offers", label: "Offers & coupons" },
  { key: "referrals", label: "Referral activity" },
  { key: "wallet", label: "Wallet & payments" },
  { key: "system", label: "Account & security" },
] as const;

export const NOTIF_CHANNELS = ["Email", "SMS", "Push", "WhatsApp"] as const;

export type NotifKey = (typeof NOTIF_TYPES)[number]["key"];
export type NotifChannel = (typeof NOTIF_CHANNELS)[number];

export const DEFAULT_NOTIF_MATRIX: Record<NotifKey, Record<NotifChannel, boolean>> = {
  bookings: { Email: true, SMS: true, Push: true, WhatsApp: true },
  rewards: { Email: true, SMS: false, Push: true, WhatsApp: false },
  offers: { Email: true, SMS: false, Push: true, WhatsApp: true },
  referrals: { Email: true, SMS: false, Push: true, WhatsApp: false },
  wallet: { Email: true, SMS: true, Push: true, WhatsApp: false },
  system: { Email: true, SMS: true, Push: true, WhatsApp: false },
};

export const CONNECTED_ACCOUNTS = [
  { id: "google", name: "Google", connected: true, email: "aarav.sharma@gmail.com" },
  { id: "apple", name: "Apple", connected: false, email: "" },
  { id: "facebook", name: "Facebook", connected: false, email: "" },
];

export const TIMEZONES = [
  "Asia/Kolkata (IST, UTC+5:30)",
  "Asia/Dubai (GST, UTC+4:00)",
  "Asia/Singapore (SGT, UTC+8:00)",
  "Europe/London (GMT, UTC+0:00)",
  "America/New_York (EST, UTC-5:00)",
];

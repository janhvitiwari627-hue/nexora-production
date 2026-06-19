export type BookingStatus = "confirmed" | "pending" | "accepted";
export type BookingTab = "upcoming" | "completed" | "cancelled" | "rescheduled";

export interface UpcomingBooking {
  id: string;
  shopName: string;
  shopSlug: string;
  shopImage: string;
  service: string;
  staff: string;
  dateISO: string;
  status: BookingStatus;
  phone: string;
  mapsUrl: string;
}

export interface CompletedBooking {
  id: string;
  shopName: string;
  shopSlug: string;
  shopImage: string;
  service: string;
  dateISO: string;
  amount: number;
  rewardsEarned: number;
  reviewed: boolean;
}

export type RefundStatus = "refunded" | "processing" | "not-applicable";

export interface CancelledBooking {
  id: string;
  shopName: string;
  shopSlug: string;
  shopImage: string;
  service: string;
  dateISO: string;
  reason: string;
  refundStatus: RefundStatus;
  refundAmount?: number;
}

const now = Date.now();
const day = 86400000;

export const mockUpcoming: UpcomingBooking[] = [
  {
    id: "BK-23984",
    shopName: "Glow & Co. Salon",
    shopSlug: "glow-and-co-salon",
    shopImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&q=80",
    service: "Haircut + Hair Spa",
    staff: "Priya M.",
    dateISO: new Date(now + day * 1 + 1000 * 60 * 60 * 3).toISOString(),
    status: "confirmed",
    phone: "+919876543210",
    mapsUrl: "https://maps.google.com/?q=Glow+and+Co+Salon",
  },
  {
    id: "BK-23985",
    shopName: "Serene Spa & Wellness",
    shopSlug: "serene-spa",
    shopImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=200&q=80",
    service: "Deep Tissue Massage · 60m",
    staff: "Aarav K.",
    dateISO: new Date(now + day * 3).toISOString(),
    status: "pending",
    phone: "+919812345678",
    mapsUrl: "https://maps.google.com/?q=Serene+Spa",
  },
  {
    id: "BK-23986",
    shopName: "Urban Cuts Barber",
    shopSlug: "urban-cuts-barber",
    shopImage: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&q=80",
    service: "Beard Sculpt + Hot Towel",
    staff: "Rohan S.",
    dateISO: new Date(now + day * 6).toISOString(),
    status: "accepted",
    phone: "+919999988877",
    mapsUrl: "https://maps.google.com/?q=Urban+Cuts",
  },
];

export const mockCompleted: CompletedBooking[] = [
  {
    id: "BK-23801",
    shopName: "The Nail Bar",
    shopSlug: "nail-bar",
    shopImage: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=200&q=80",
    service: "Gel Manicure + Nail Art",
    dateISO: new Date(now - day * 4).toISOString(),
    amount: 899,
    rewardsEarned: 18,
    reviewed: false,
  },
  {
    id: "BK-23720",
    shopName: "Glow & Co. Salon",
    shopSlug: "glow-and-co-salon",
    shopImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&q=80",
    service: "Hair Coloring",
    dateISO: new Date(now - day * 18).toISOString(),
    amount: 2499,
    rewardsEarned: 50,
    reviewed: true,
  },
  {
    id: "BK-23501",
    shopName: "Urban Cuts Barber",
    shopSlug: "urban-cuts-barber",
    shopImage: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&q=80",
    service: "Haircut",
    dateISO: new Date(now - day * 32).toISOString(),
    amount: 398,
    rewardsEarned: 8,
    reviewed: true,
  },
];

export const mockCancelled: CancelledBooking[] = [
  {
    id: "BK-23410",
    shopName: "Serene Spa & Wellness",
    shopSlug: "serene-spa",
    shopImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=200&q=80",
    service: "Aromatherapy · 45m",
    dateISO: new Date(now - day * 9).toISOString(),
    reason: "Cancelled by you — schedule conflict",
    refundStatus: "refunded",
    refundAmount: 499,
  },
  {
    id: "BK-23380",
    shopName: "The Nail Bar",
    shopSlug: "nail-bar",
    shopImage: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=200&q=80",
    service: "Pedicure Express",
    dateISO: new Date(now - day * 22).toISOString(),
    reason: "Cancelled by shop — staff unavailable",
    refundStatus: "processing",
    refundAmount: 599,
  },
];

export const mockRescheduled: UpcomingBooking[] = [
  {
    id: "BK-23999",
    shopName: "Glow & Co. Salon",
    shopSlug: "glow-and-co-salon",
    shopImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&q=80",
    service: "Hair Spa",
    staff: "Priya M.",
    dateISO: new Date(now + day * 9).toISOString(),
    status: "accepted",
    phone: "+919876543210",
    mapsUrl: "https://maps.google.com/?q=Glow+and+Co+Salon",
  },
];

export function formatBookingDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).replace(",", " ·");
}

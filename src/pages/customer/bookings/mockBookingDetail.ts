import type { BookingStatus } from "./mockBookings";

export type TimelineStatus = "pending" | "confirmed" | "accepted" | "in-service" | "completed";

export interface BookingDetail {
  id: string;
  status: BookingStatus | "completed";
  timelineStatus: TimelineStatus;
  shop: {
    name: string;
    slug: string;
    image: string;
    address: string;
    phone: string;
    mapsUrl: string;
  };
  service: {
    name: string;
    staff: string;
    durationMinutes: number;
    dateISO: string;
  };
  payment: {
    servicePrice: number;
    platformFee: number;
    discount: number;
    advancePaid: number;
  };
  isUpcoming: boolean;
  reviewed?: boolean;
}

export const mockBookingDetail: BookingDetail = {
  id: "BK-23984",
  status: "confirmed",
  timelineStatus: "confirmed",
  shop: {
    name: "Glow & Co. Salon",
    slug: "glow-and-co-salon",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80",
    address: "12 MG Road, Indiranagar, Bengaluru 560038",
    phone: "+919876543210",
    mapsUrl: "https://maps.google.com/?q=Glow+and+Co+Salon",
  },
  service: {
    name: "Haircut + Hair Spa",
    staff: "Priya M.",
    durationMinutes: 75,
    dateISO: new Date(Date.now() + 1000 * 60 * 60 * 26).toISOString(),
  },
  payment: {
    servicePrice: 1599,
    platformFee: 29,
    discount: 100,
    advancePaid: 400,
  },
  isUpcoming: true,
};

export const mockCompletedBookingDetail: BookingDetail = {
  ...mockBookingDetail,
  id: "BK-23720",
  status: "completed",
  timelineStatus: "completed",
  isUpcoming: false,
  reviewed: false,
  service: {
    ...mockBookingDetail.service,
    dateISO: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
  },
};

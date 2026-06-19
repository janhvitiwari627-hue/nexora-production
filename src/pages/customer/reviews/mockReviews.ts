export type ReviewStatus = "published" | "pending";

export interface MyReview {
  id: string;
  shopName: string;
  shopSlug: string;
  shopImage: string;
  rating: number;
  text: string;
  photos: string[];
  dateISO: string;
  status: ReviewStatus;
}

export interface PendingReviewItem {
  bookingId: string;
  shopName: string;
  shopSlug: string;
  shopImage: string;
  service: string;
  completedISO: string;
}

const d = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

export const mockReviews: MyReview[] = [
  {
    id: "rv1",
    shopName: "Glow & Co. Salon",
    shopSlug: "glow-and-co-salon",
    shopImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&q=80",
    rating: 5,
    text: "Best haircut I've had in years. Priya nailed exactly what I wanted and the hair spa was so relaxing.",
    photos: [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&q=80",
    ],
    dateISO: d(4),
    status: "published",
  },
  {
    id: "rv2",
    shopName: "Serene Spa & Wellness",
    shopSlug: "serene-spa",
    shopImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=200&q=80",
    rating: 4,
    text: "Loved the deep tissue massage. Could use a little more privacy in the changing area.",
    photos: [],
    dateISO: d(18),
    status: "pending",
  },
  {
    id: "rv3",
    shopName: "Urban Cuts Barber",
    shopSlug: "urban-cuts-barber",
    shopImage: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&q=80",
    rating: 5,
    text: "Crisp fade, hot towel and great chat. Rohan is a wizard with the clippers.",
    photos: [
      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=300&q=80",
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=300&q=80",
    ],
    dateISO: d(33),
    status: "published",
  },
];

export const mockPendingReviews: PendingReviewItem[] = [
  {
    bookingId: "BK-23801",
    shopName: "The Nail Bar",
    shopSlug: "nail-bar",
    shopImage: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=200&q=80",
    service: "Gel Manicure + Nail Art",
    completedISO: d(2),
  },
  {
    bookingId: "BK-23789",
    shopName: "Glow & Co. Salon",
    shopSlug: "glow-and-co-salon",
    shopImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&q=80",
    service: "Hair Coloring",
    completedISO: d(6),
  },
];

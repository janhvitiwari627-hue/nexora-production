export type BusinessStatus = "pending" | "active" | "suspended" | "rejected";

export type AdminBusiness = {
  id: string;
  name: string;
  owner: string;
  mobile: string;
  email: string;
  category: string;
  city: string;
  area: string;
  status: BusinessStatus;
  joinedAt: string;
  totalBookings: number;
  revenue: number;
  rating: number;
  reviews: number;
  staff: number;
  avatar: string;
  photos: string[];
  documents: { name: string; verified: boolean }[];
  address: string;
};

const IMG = (id: string) => `https://images.unsplash.com/${id}?w=400&q=70`;

export const ADMIN_BUSINESSES: AdminBusiness[] = [
  {
    id: "b1",
    name: "Luxe Hair & Spa",
    owner: "Priya Sharma",
    mobile: "+91 98765 43210",
    email: "luxe@example.com",
    category: "Salon & Spa",
    city: "Mumbai",
    area: "Bandra West",
    status: "active",
    joinedAt: "2025-03-12",
    totalBookings: 2847,
    revenue: 1842500,
    rating: 4.8,
    reviews: 412,
    staff: 12,
    avatar: IMG("photo-1560066984-138dadb4c035"),
    photos: [
      IMG("photo-1560066984-138dadb4c035"),
      IMG("photo-1521590832167-7bcbfaa6381f"),
      IMG("photo-1522337360788-8b13dee7a37e"),
    ],
    documents: [
      { name: "GST Certificate", verified: true },
      { name: "Trade License", verified: true },
      { name: "PAN", verified: true },
    ],
    address: "Plot 12, Linking Road, Bandra West, Mumbai 400050",
  },
  {
    id: "b2",
    name: "Glow Beauty Studio",
    owner: "Riya Kapoor",
    mobile: "+91 99887 65432",
    email: "glow@example.com",
    category: "Beauty Salon",
    city: "Bengaluru",
    area: "Indiranagar",
    status: "pending",
    joinedAt: "2026-06-15",
    totalBookings: 0,
    revenue: 0,
    rating: 0,
    reviews: 0,
    staff: 6,
    avatar: IMG("photo-1522337360788-8b13dee7a37e"),
    photos: [IMG("photo-1522337360788-8b13dee7a37e"), IMG("photo-1487412947147-5cebf100ffc2")],
    documents: [
      { name: "GST Certificate", verified: false },
      { name: "Trade License", verified: true },
    ],
    address: "100ft Road, Indiranagar, Bengaluru 560038",
  },
  {
    id: "b3",
    name: "Urban Barber Co",
    owner: "Rohit Mehta",
    mobile: "+91 91234 56789",
    email: "urban@example.com",
    category: "Barber Shop",
    city: "Pune",
    area: "Koregaon Park",
    status: "active",
    joinedAt: "2024-11-04",
    totalBookings: 1932,
    revenue: 642300,
    rating: 4.6,
    reviews: 287,
    staff: 5,
    avatar: IMG("photo-1503951914875-452162b0f3f1"),
    photos: [IMG("photo-1503951914875-452162b0f3f1"), IMG("photo-1521490683132-aaab64d3a924")],
    documents: [
      { name: "Trade License", verified: true },
      { name: "PAN", verified: true },
    ],
    address: "Lane 5, Koregaon Park, Pune 411001",
  },
  {
    id: "b4",
    name: "QuickCuts Express",
    owner: "Sanjay Patil",
    mobile: "+91 90909 12345",
    email: "quickcuts@example.com",
    category: "Barber Shop",
    city: "Mumbai",
    area: "Andheri East",
    status: "suspended",
    joinedAt: "2025-01-22",
    totalBookings: 487,
    revenue: 124000,
    rating: 3.2,
    reviews: 96,
    staff: 3,
    avatar: IMG("photo-1521490683132-aaab64d3a924"),
    photos: [IMG("photo-1521490683132-aaab64d3a924")],
    documents: [{ name: "GST Certificate", verified: false }],
    address: "Chakala, Andheri East, Mumbai 400099",
  },
  {
    id: "b5",
    name: "Serene Wellness Spa",
    owner: "Anita Desai",
    mobile: "+91 98989 33333",
    email: "serene@example.com",
    category: "Spa & Wellness",
    city: "Hyderabad",
    area: "Jubilee Hills",
    status: "pending",
    joinedAt: "2026-06-16",
    totalBookings: 0,
    revenue: 0,
    rating: 0,
    reviews: 0,
    staff: 8,
    avatar: IMG("photo-1540555700478-4be289fbecef"),
    photos: [IMG("photo-1540555700478-4be289fbecef"), IMG("photo-1571019613454-1cb2f99b2d8b")],
    documents: [
      { name: "GST Certificate", verified: true },
      { name: "Trade License", verified: true },
      { name: "PAN", verified: true },
    ],
    address: "Road No. 36, Jubilee Hills, Hyderabad 500033",
  },
  {
    id: "b6",
    name: "Ink Canvas Tattoo",
    owner: "Karan Verma",
    mobile: "+91 97000 87654",
    email: "inkcanvas@example.com",
    category: "Tattoo Studio",
    city: "Delhi NCR",
    area: "Hauz Khas",
    status: "rejected",
    joinedAt: "2026-05-30",
    totalBookings: 0,
    revenue: 0,
    rating: 0,
    reviews: 0,
    staff: 4,
    avatar: IMG("photo-1565058379802-bbe93b2f703a"),
    photos: [IMG("photo-1565058379802-bbe93b2f703a")],
    documents: [{ name: "Trade License", verified: false }],
    address: "Hauz Khas Village, New Delhi 110016",
  },
  {
    id: "b7",
    name: "Bridal Bloom Studio",
    owner: "Meera Iyer",
    mobile: "+91 95555 11122",
    email: "bridal@example.com",
    category: "Bridal Makeup",
    city: "Chennai",
    area: "Nungambakkam",
    status: "active",
    joinedAt: "2025-08-19",
    totalBookings: 412,
    revenue: 1840000,
    rating: 4.9,
    reviews: 138,
    staff: 9,
    avatar: IMG("photo-1519415943484-9fa1873496d4"),
    photos: [IMG("photo-1519415943484-9fa1873496d4"), IMG("photo-1487412947147-5cebf100ffc2")],
    documents: [
      { name: "GST Certificate", verified: true },
      { name: "Trade License", verified: true },
    ],
    address: "Sterling Road, Nungambakkam, Chennai 600034",
  },
  {
    id: "b8",
    name: "Nail Atelier",
    owner: "Sneha Reddy",
    mobile: "+91 93333 44455",
    email: "nail@example.com",
    category: "Nail Salon",
    city: "Bengaluru",
    area: "Koramangala",
    status: "pending",
    joinedAt: "2026-06-17",
    totalBookings: 0,
    revenue: 0,
    rating: 0,
    reviews: 0,
    staff: 4,
    avatar: IMG("photo-1604654894610-df63bc536371"),
    photos: [IMG("photo-1604654894610-df63bc536371")],
    documents: [{ name: "Trade License", verified: true }],
    address: "5th Block, Koramangala, Bengaluru 560095",
  },
];

export const STATUS_META: Record<BusinessStatus, { label: string; classes: string }> = {
  pending: {
    label: "Pending",
    classes: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  },
  active: {
    label: "Active",
    classes: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  },
  suspended: {
    label: "Suspended",
    classes: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  },
  rejected: {
    label: "Rejected",
    classes: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  },
};

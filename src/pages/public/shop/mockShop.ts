import type { Service } from "@/components/shared/ServiceCard";
import type { Staff } from "@/components/shared/StaffCard";
import type { Review } from "@/components/shared/ReviewCard";

export type MockShop = {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  area: string;
  city: string;
  address: string;
  rating: number;
  review_count: number;
  price_level: number;
  is_verified: boolean;
  badges: string[];
  cover_images: string[];
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  open_hours: string;
  lat: number;
  lng: number;
  stats: { bookings: string; experience: string; staff: number; services: number };
  story: string;
  certifications: string[];
  awards: { title: string; year: number }[];
  policies: { title: string; body: string }[];
  faqs: { q: string; a: string }[];
  service_categories: { name: string; items: Service[] }[];
  staff: Staff[];
  gallery_photos: string[];
  gallery_videos: { id: string; thumb: string; youtubeId: string; title: string }[];
  reviews: Review[];
  offers: {
    id: string;
    code: string;
    title: string;
    description: string;
    expiry: string;
    discount: string;
  }[];
};

const PHOTOS = [
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600&q=80",
  "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=1600&q=80",
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1600&q=80",
  "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=1600&q=80",
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1600&q=80",
];

export const MOCK_SHOP: MockShop = {
  slug: "looks-unisex-salon",
  name: "Looks Unisex Salon",
  tagline: "Where every transformation tells your story",
  category: "Salon",
  area: "Malviya Nagar",
  city: "Jaipur",
  address: "Shop 12, Sector 4, Malviya Nagar, Jaipur, Rajasthan 302017",
  rating: 4.8,
  review_count: 1284,
  price_level: 3,
  is_verified: true,
  badges: ["Premium Partner", "Top Rated", "Instant Book"],
  cover_images: PHOTOS,
  phone: "+91 98765 43210",
  whatsapp: "+91 98765 43210",
  email: "hello@looksjaipur.in",
  website: "https://looksjaipur.in",
  open_hours: "10:00 AM – 9:00 PM · Open today",
  lat: 26.8543,
  lng: 75.8242,
  stats: { bookings: "12k+", experience: "8 yrs", staff: 14, services: 42 },
  story:
    "Founded in 2017, Looks Unisex Salon has redefined personal grooming in Jaipur with a blend of international techniques and warm Rajasthani hospitality. Our master stylists train annually with L'Oréal Paris and Wella Education to bring you trends straight from the global runway.",
  certifications: ["L'Oréal Certified", "Wella Master Salon", "ISO 9001:2015", "OSHA Sanitation"],
  awards: [
    { title: "Best Salon — Jaipur Style Awards", year: 2024 },
    { title: "Customer Choice — UrbanClap", year: 2023 },
    { title: "Top 10 Salons Rajasthan", year: 2022 },
  ],
  policies: [
    {
      title: "Cancellation",
      body: "Free cancellation up to 4 hours before your slot. Within 4 hours, 50% of service price is charged.",
    },
    {
      title: "Refund",
      body: "Prepaid amounts are refunded to the original payment method within 5–7 business days.",
    },
    {
      title: "Hygiene",
      body: "All tools are sterilised between clients. Single-use blades and disposable towels are used as standard.",
    },
    {
      title: "Children",
      body: "Children under 10 must be accompanied by an adult. Kids' chair available on request.",
    },
  ],
  faqs: [
    {
      q: "Do you accept walk-ins?",
      a: "Yes, but we strongly recommend booking ahead — weekend slots fill quickly.",
    },
    {
      q: "Do you offer home service?",
      a: "Yes, select services are available at home within Jaipur for an additional travel fee.",
    },
    {
      q: "Which brands do you use?",
      a: "We exclusively use L'Oréal Professionnel, Wella, Olaplex, and Schwarzkopf.",
    },
    {
      q: "Is parking available?",
      a: "Yes, complimentary valet parking is offered to all clients.",
    },
    {
      q: "Are stylists trained for curly hair?",
      a: "Absolutely — three of our senior stylists specialise in textured and curly hair.",
    },
  ],
  service_categories: [
    {
      name: "Hair",
      items: [
        {
          id: "s1",
          name: "Haircut & Style — Women",
          duration_minutes: 60,
          price: 1200,
          offer_price: 999,
          description: "Consult, shampoo, precision cut & blow-dry",
        },
        {
          id: "s2",
          name: "Haircut — Men",
          duration_minutes: 30,
          price: 600,
          offer_price: null,
          description: "Scissor cut with beard trim",
        },
        {
          id: "s3",
          name: "Global Hair Colour",
          duration_minutes: 120,
          price: 4500,
          offer_price: 3999,
        },
        {
          id: "s4",
          name: "Keratin Smoothening",
          duration_minutes: 180,
          price: 8000,
          offer_price: null,
        },
      ],
    },
    {
      name: "Skin & Facial",
      items: [
        {
          id: "s5",
          name: "Hydra Glow Facial",
          duration_minutes: 75,
          price: 2500,
          offer_price: 1999,
        },
        {
          id: "s6",
          name: "Anti-Ageing Facial",
          duration_minutes: 90,
          price: 3500,
          offer_price: null,
        },
        { id: "s7", name: "Express Clean-up", duration_minutes: 30, price: 800, offer_price: null },
      ],
    },
    {
      name: "Nails",
      items: [
        { id: "s8", name: "Gel Manicure", duration_minutes: 45, price: 1200, offer_price: null },
        {
          id: "s9",
          name: "Nail Art (per finger)",
          duration_minutes: 15,
          price: 150,
          offer_price: null,
        },
      ],
    },
    {
      name: "Spa & Massage",
      items: [
        {
          id: "s10",
          name: "Aromatherapy Massage",
          duration_minutes: 60,
          price: 2200,
          offer_price: 1899,
        },
        {
          id: "s11",
          name: "Head & Shoulder Spa",
          duration_minutes: 30,
          price: 800,
          offer_price: null,
        },
      ],
    },
  ],
  staff: [
    {
      id: "st1",
      name: "Aanya Sharma",
      designation: "Senior Stylist",
      avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=80",
      experience_years: 8,
      specializations: ["Balayage", "Bridal", "Curly hair"],
      rating: 4.9,
      available: true,
      instagram_url: "https://instagram.com",
      whatsapp_url: "https://wa.me/919876543210",
    },
    {
      id: "st2",
      name: "Rohan Mehta",
      designation: "Master Barber",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80",
      experience_years: 10,
      specializations: ["Fade", "Beard sculpt"],
      rating: 4.8,
      available: true,
      instagram_url: "https://instagram.com",
      whatsapp_url: "https://wa.me/919876543210",
    },
    {
      id: "st3",
      name: "Priya Nair",
      designation: "Skin Therapist",
      avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80",
      experience_years: 6,
      specializations: ["Hydra facial", "Acne care"],
      rating: 4.7,
      available: false,
      instagram_url: "https://instagram.com",
      whatsapp_url: "https://wa.me/919876543210",
    },
    {
      id: "st4",
      name: "Vikram Singh",
      designation: "Colour Specialist",
      avatar_url: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&q=80",
      experience_years: 12,
      specializations: ["Highlights", "Global colour", "Olaplex"],
      rating: 4.9,
      available: true,
      instagram_url: "https://instagram.com",
      whatsapp_url: "https://wa.me/919876543210",
    },
  ],
  gallery_photos: [
    ...PHOTOS,
    "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1200&q=80",
    "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200&q=80",
    "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=1200&q=80",
    "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=1200&q=80",
  ],
  gallery_videos: [
    {
      id: "v1",
      thumb: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      youtubeId: "dQw4w9WgXcQ",
      title: "Bridal transformation reel",
    },
    {
      id: "v2",
      thumb: "https://img.youtube.com/vi/ScMzIvxBSi4/hqdefault.jpg",
      youtubeId: "ScMzIvxBSi4",
      title: "Behind the scenes",
    },
    {
      id: "v3",
      thumb: "https://img.youtube.com/vi/aqz-KE-bpKQ/hqdefault.jpg",
      youtubeId: "aqz-KE-bpKQ",
      title: "Hair colour masterclass",
    },
  ],
  reviews: [
    {
      id: "r1",
      author_name: "Meera Kapoor",
      author_avatar: null,
      rating: 5,
      date: "2 days ago",
      text: "Aanya gave me the most beautiful balayage I've ever had. The salon is spotless and everyone made me feel like a VIP from the moment I walked in. Will definitely be back!",
      photos: [PHOTOS[1], PHOTOS[2]],
      helpful_count: 24,
      owner_reply: {
        author: "Owner",
        date: "1 day ago",
        text: "Thank you Meera! Aanya will be thrilled. See you soon ❤️",
      },
    },
    {
      id: "r2",
      author_name: "Arjun Verma",
      author_avatar: null,
      rating: 4,
      date: "1 week ago",
      text: "Great haircut by Rohan. The wait was a little longer than expected but the service made up for it.",
      photos: [],
      helpful_count: 12,
      owner_reply: null,
    },
    {
      id: "r3",
      author_name: "Sneha Reddy",
      author_avatar: null,
      rating: 5,
      date: "2 weeks ago",
      text: "The hydra glow facial is magic. My skin has never looked better.",
      photos: [PHOTOS[3]],
      helpful_count: 31,
      owner_reply: null,
    },
  ],
  offers: [
    {
      id: "o1",
      code: "FIRST20",
      title: "20% off your first visit",
      description: "Valid on all hair services for new customers",
      expiry: "31 Dec 2026",
      discount: "20%",
    },
    {
      id: "o2",
      code: "GLOW999",
      title: "Hydra Facial @ ₹999",
      description: "Limited slots every Tuesday & Wednesday",
      expiry: "15 Jul 2026",
      discount: "₹1000 off",
    },
    {
      id: "o3",
      code: "BRIDE25",
      title: "Bridal package — 25% off",
      description: "Book hair + makeup + skin together",
      expiry: "30 Sep 2026",
      discount: "25%",
    },
  ],
};

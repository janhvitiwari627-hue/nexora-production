export interface FavoriteShop {
  id: string;
  slug: string;
  name: string;
  category: string;
  area: string;
  city: string;
  cover: string;
  rating: number;
  reviews: number;
  phone: string;
  mapsUrl: string;
  offers?: number;
}

export interface VisitedShop extends FavoriteShop {
  lastVisitedISO: string;
}

export interface RecommendedShop extends FavoriteShop {
  reason: string;
}

export const mockSaved: FavoriteShop[] = [
  {
    id: "1",
    slug: "glow-and-co-salon",
    name: "Glow & Co. Salon",
    category: "Hair & Beauty",
    area: "Indiranagar",
    city: "Bengaluru",
    cover: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80",
    rating: 4.8,
    reviews: 421,
    phone: "+919876543210",
    mapsUrl: "https://maps.google.com/?q=Glow+and+Co",
    offers: 3,
  },
  {
    id: "2",
    slug: "urban-cuts-barber",
    name: "Urban Cuts Barber",
    category: "Barber",
    area: "Koramangala",
    city: "Bengaluru",
    cover: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80",
    rating: 4.7,
    reviews: 268,
    phone: "+919812345678",
    mapsUrl: "https://maps.google.com/?q=Urban+Cuts",
    offers: 1,
  },
  {
    id: "3",
    slug: "serene-spa",
    name: "Serene Spa & Wellness",
    category: "Spa",
    area: "HSR Layout",
    city: "Bengaluru",
    cover: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80",
    rating: 4.9,
    reviews: 612,
    phone: "+919999988877",
    mapsUrl: "https://maps.google.com/?q=Serene+Spa",
    offers: 2,
  },
  {
    id: "4",
    slug: "nail-bar",
    name: "The Nail Bar",
    category: "Nails",
    area: "Whitefield",
    city: "Bengaluru",
    cover: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80",
    rating: 4.6,
    reviews: 184,
    phone: "+919811122233",
    mapsUrl: "https://maps.google.com/?q=Nail+Bar",
  },
];

export const mockVisited: VisitedShop[] = [
  {
    ...mockSaved[0],
    id: "v1",
    lastVisitedISO: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    ...mockSaved[3],
    id: "v2",
    lastVisitedISO: new Date(Date.now() - 86400000 * 12).toISOString(),
  },
  {
    ...mockSaved[1],
    id: "v3",
    lastVisitedISO: new Date(Date.now() - 86400000 * 25).toISOString(),
  },
];

export const mockRecommended: RecommendedShop[] = [
  {
    id: "r1",
    slug: "bloom-skin-clinic",
    name: "Bloom Skin Clinic",
    category: "Skin Care",
    area: "Jayanagar",
    city: "Bengaluru",
    cover: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80",
    rating: 4.8,
    reviews: 312,
    phone: "+919800011122",
    mapsUrl: "https://maps.google.com/?q=Bloom+Skin",
    reason: "Matches your love for hair-care premium brands",
  },
  {
    id: "r2",
    slug: "lush-locks",
    name: "Lush Locks Studio",
    category: "Hair & Beauty",
    area: "Indiranagar",
    city: "Bengaluru",
    cover: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
    rating: 4.7,
    reviews: 198,
    phone: "+919801212345",
    mapsUrl: "https://maps.google.com/?q=Lush+Locks",
    reason: "Popular with Gold members in your area",
  },
  {
    id: "r3",
    slug: "the-grooming-co",
    name: "The Grooming Co.",
    category: "Barber",
    area: "Koramangala",
    city: "Bengaluru",
    cover: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80",
    rating: 4.6,
    reviews: 144,
    phone: "+919800099887",
    mapsUrl: "https://maps.google.com/?q=The+Grooming+Co",
    reason: "Similar vibe to Urban Cuts Barber",
  },
];

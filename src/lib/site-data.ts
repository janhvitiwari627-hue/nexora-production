import { queryOptions } from "@tanstack/react-query";
import { getSalonBySlug } from "./salons.functions";
import { expandMockBusiness, getMockBusinessBySlug, type MockBusiness } from "./mock-businesses";
import type { ShopData } from "@/components/whiteLabelWebsite/types";

/**
 * Unified data shape used by the customer-facing template routes
 * (`/site/:slug`, `/site/:slug/services`, `/site/:slug/book`,
 * `/site/:slug/booking-success`).
 *
 * A "site" is EITHER a real salon from the DB OR a mock/demo business
 * from `mock-businesses`. Both surfaces expose the same fields to the
 * page components so services always render and booking always works,
 * even for template previews or unpublished demo slugs.
 */
export type SiteService = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  duration_minutes: number | null;
  price: number;
  image_url: string | null;
};

export type SiteStaff = {
  id: string;
  name: string;
  role: string | null;
  bio: string | null;
  avatar_url: string | null;
  rating: number | null;
};

export type SiteSalon = {
  id: string;
  slug: string;
  name: string;
  address: string | null;
  location: string | null;
  phone: string | null;
  whatsapp: string | null;
};

export type SiteReview = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export type SiteData = {
  salon: SiteSalon;
  services: SiteService[];
  staff: SiteStaff[];
  reviews: SiteReview[];
  isMock: boolean;
};

function mockToServices(shop: ShopData): SiteService[] {
  return shop.services.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.desc ?? null,
    category: s.category ?? null,
    duration_minutes: s.duration ?? 30,
    price: Number(s.price ?? 0),
    image_url: s.image ?? null,
  }));
}

function mockToStaff(shop: ShopData): SiteStaff[] {
  return shop.staff.map((member) => ({
    id: member.id,
    name: member.name,
    role: member.designation ?? null,
    bio: member.specialization ?? null,
    avatar_url: member.image ?? null,
    rating: member.rating ?? null,
  }));
}

function mockToSite(business: MockBusiness): SiteData {
  const shop = expandMockBusiness(business);
  return {
    salon: {
      id: `mock:${business.slug}`,
      slug: business.slug,
      name: business.name,
      address: shop.address ?? null,
      location: shop.city ?? null,
      phone: shop.phone ?? null,
      whatsapp: shop.whatsapp ?? null,
    },
    services: mockToServices(shop),
    staff: mockToStaff(shop),
    reviews: [],
    isMock: true,
  };
}

export function isMockSalonId(id: string | undefined | null): boolean {
  return typeof id === "string" && id.startsWith("mock:");
}

async function fetchSite(slug: string): Promise<SiteData | null> {
  const dbData = await getSalonBySlug({ data: { slug } }).catch(() => null);
  if (dbData?.salon) {
    return {
      salon: {
        id: dbData.salon.id,
        slug: dbData.salon.slug,
        name: dbData.salon.name,
        address: dbData.salon.address ?? null,
        location: dbData.salon.location ?? null,
        phone: dbData.salon.phone ?? null,
        whatsapp: dbData.salon.whatsapp ?? null,
      },
      services: (dbData.services ?? []).map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description ?? null,
        category: s.category ?? null,
        duration_minutes: s.duration_minutes ?? null,
        price: Number(s.price ?? 0),
        image_url: s.image_url ?? null,
      })),
      staff: (dbData.staff ?? []).map((member) => ({
        id: member.id,
        name: member.name,
        role: member.role ?? null,
        bio: member.bio ?? null,
        avatar_url: member.avatar_url ?? null,
        rating: member.rating ?? null,
      })),
      reviews: (dbData.reviews ?? []).map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment ?? null,
        created_at: r.created_at,
      })),
      isMock: false,
    };
  }

  const mock = getMockBusinessBySlug(slug);
  if (mock) return mockToSite(mock);
  return null;
}

export const siteBySlugQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["site", slug],
    queryFn: () => fetchSite(slug),
    staleTime: 60_000,
  });

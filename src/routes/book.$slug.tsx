import { createFileRoute, redirect } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { BookingFlowPage, type RealSalonRef } from "@/pages/public/BookingFlowPage";
import { salonBySlugQueryOptions } from "@/lib/salons.queries";
import type { Service } from "@/components/shared/ServiceCard";
import type { Staff } from "@/components/shared/StaffCard";

export const Route = createFileRoute("/book/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/site/$slug_/book",
      params: { slug: params.slug },
      search: { service: undefined },
    });
  },
  loader: async ({ context, params }) => {
    try {
      const result = await context.queryClient.ensureQueryData(
        salonBySlugQueryOptions(params.slug),
      );
      return { hasReal: !!result };
    } catch {
      return { hasReal: false };
    }
  },
  head: () => ({
    meta: [
      { title: "Book your appointment — Nexora" },
      {
        name: "description",
        content: "Pick services, stylist, date and pay 25% to confirm.",
      },
    ],
  }),
  component: BookingRoute,
});

function BookingRoute() {
  const { slug } = Route.useParams();
  const { hasReal } = Route.useLoaderData();
  if (!hasReal) return <BookingFlowPage />;
  return <RealBookingLoader slug={slug} />;
}

function RealBookingLoader({ slug }: { slug: string }) {
  const { data } = useSuspenseQuery(salonBySlugQueryOptions(slug));
  if (!data) return <BookingFlowPage />;
  const services: Service[] = data.services.map((s) => ({
    id: s.id,
    name: s.name,
    duration_minutes: s.duration_minutes ?? 30,
    price: Number(s.price),
    description: s.description ?? null,
  }));
  const staff: Staff[] = data.staff.map((m) => ({
    id: m.id,
    name: m.name,
    designation: m.role ?? "Stylist",
    avatar_url: m.avatar_url ?? null,
    experience_years: 0,
    specializations: [],
    rating: Number(m.rating ?? 4.5),
    available: true,
  }));
  const salon: RealSalonRef = {
    id: data.salon.id,
    name: data.salon.name,
    address: data.salon.address ?? data.salon.location ?? "",
    services,
    staff,
  };
  return <BookingFlowPage salon={salon} />;
}

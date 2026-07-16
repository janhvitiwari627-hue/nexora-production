import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Clock,
  LoaderCircle,
  MessageCircle,
} from "lucide-react";
import { getPublicAppointmentReceipt } from "@/lib/public-booking";
import { salonBySlugQueryOptions } from "@/lib/salons.queries";
import { buildIcs, downloadIcs } from "@/lib/ics";
import { SalonNotFound } from "@/pages/public/site/SalonNotFound";

export const Route = createFileRoute("/site/$slug_/booking-success")({
  validateSearch: (search: Record<string, unknown>) => ({
    booking: typeof search.booking === "string" ? search.booking : "",
  }),
  head: () => ({
    meta: [{ title: "Appointment created · Nexora" }],
  }),
  component: BookingSuccessPage,
});

function money(value: unknown) {
  return `₹${Number(value ?? 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function BookingSuccessPage() {
  const { slug } = Route.useParams();
  if (!slug || slug === "undefined" || slug === "null") {
    return <SalonNotFound />;
  }
  const { booking } = Route.useSearch();
  const receipt = useQuery({
    queryKey: ["public-booking-receipt", booking],
    queryFn: () => getPublicAppointmentReceipt(booking),
    enabled: Boolean(booking),
    retry: false,
  });
  const salonQuery = useQuery(salonBySlugQueryOptions(slug));

  if (receipt.isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50">
        <LoaderCircle className="h-7 w-7 animate-spin text-violet-700" />
      </main>
    );
  }

  if (!receipt.data) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-4 text-center">
        <div>
          <h1 className="text-2xl font-bold">Booking details are unavailable</h1>
          <p className="mt-2 text-sm text-slate-600">
            Open this page on the same device used to create the appointment.
          </p>
          <Link
            to="/site/$slug_/book"
            params={{ slug }}
            search={{ service: undefined }}
            className="mt-5 inline-flex rounded-xl bg-violet-700 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Return to booking
          </Link>
        </div>
      </main>
    );
  }

  const row = receipt.data;
  const salon = Array.isArray(row.salons) ? row.salons[0] : row.salons;
  const staff = Array.isArray(row.staff) ? row.staff[0] : row.staff;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-xl rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
        <CheckCircle2 className="h-12 w-12 text-emerald-600" />
        <p className="mt-5 text-sm font-semibold text-violet-700">Appointment created</p>
        <h1 className="mt-1 text-3xl font-bold">Advance payment is pending</h1>
        <p className="mt-2 text-sm text-slate-600">
          No payment has been collected or marked successful. Your booking will remain pending until
          the advance is paid.
        </p>

        <div className="mt-6 rounded-2xl bg-slate-50 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-bold">{row.service_name}</p>
              <p className="text-sm text-slate-600">{salon?.name ?? "Salon"}</p>
              <p className="mt-1 text-xs text-slate-500">
                {staff?.name ?? "Any available professional"}
              </p>
            </div>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
              Advance pending
            </span>
          </div>
          <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-slate-500" />
              {row.booking_date}
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-500" />
              {String(row.booking_time).slice(0, 5)}
            </span>
          </div>
        </div>

        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-600">Booking reference</dt>
            <dd className="font-mono font-bold">{row.booking_reference}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-600">Total</dt>
            <dd className="font-bold">{money(row.price)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-600">Advance (25%)</dt>
            <dd>{money(row.advance_amount)}</dd>
          </div>
          <div className="flex justify-between border-t pt-3">
            <dt className="text-slate-600">Remaining (75%)</dt>
            <dd>{money(row.remaining)}</dd>
          </div>
        </dl>

        {(() => {
          const salon = salonQuery.data?.salon;
          const rawWa = (salon?.whatsapp ?? salon?.phone ?? "") as string;
          const waDigits = rawWa.replace(/[^\d]/g, "");
          if (!waDigits) return null;
          const message = encodeURIComponent(
            `Hi ${salon?.name ?? ""}, I just booked ${row.service_name} on ${row.booking_date} at ${String(row.booking_time).slice(0, 5)}. Reference: ${row.booking_reference}.`,
          );
          return (
            <a
              href={`https://wa.me/${waDigits}?text=${message}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-600 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-100"
            >
              <MessageCircle className="h-4 w-4" />
              Message salon on WhatsApp
            </a>
          );
        })()}
        {(() => {
          const salon = salonQuery.data?.salon;
          const services = salonQuery.data?.services ?? [];
          const [year, month, day] = String(row.booking_date).split("-").map(Number);
          const [hour, minute] = String(row.booking_time).slice(0, 5).split(":").map(Number);
          if (!year || !month || !day || Number.isNaN(hour) || Number.isNaN(minute)) return null;
          const start = new Date(year, month - 1, day, hour, minute, 0);
          if (Number.isNaN(start.getTime())) return null;
          const matched = services.find((service) => service.id === row.service_id);
          const durationMinutes = Number(matched?.duration_minutes ?? 60) || 60;
          const end = new Date(start.getTime() + durationMinutes * 60_000);

          const location = [salon?.name, salon?.address, salon?.location]
            .filter(Boolean)
            .join(", ");
          const description = [
            `Booking reference: ${row.booking_reference}`,
            `Service: ${row.service_name}`,
            salon?.phone ? `Salon phone: ${salon.phone}` : null,
          ]
            .filter(Boolean)
            .join("\n");

          const handleDownload = () => {
            const ics = buildIcs({
              uid: `${row.booking_reference}@nexora`,
              start,
              end,
              summary: `${row.service_name} · ${salon?.name ?? "Salon"}`,
              description,
              location: location || undefined,
              url: typeof window !== "undefined" ? window.location.href : undefined,
            });
            downloadIcs(`nexora-booking-${row.booking_reference}`, ics);
          };

          return (
            <button
              type="button"
              onClick={handleDownload}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-800 hover:bg-violet-100"
            >
              <CalendarPlus className="h-4 w-4" />
              Add to calendar (Google · Apple · Outlook)
            </button>
          );
        })()}


        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/dashboard/bookings"
            className="inline-flex flex-1 justify-center rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white"
          >
            View bookings
          </Link>
          <Link
            to="/site/$businessSlug"
            params={{ businessSlug: slug }}
            className="inline-flex flex-1 justify-center rounded-xl border px-4 py-2.5 text-sm font-semibold"
          >
            Back to salon
          </Link>
        </div>
      </div>
    </main>
  );
}

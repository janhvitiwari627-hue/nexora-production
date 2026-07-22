import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock, LoaderCircle } from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { supabase } from "@/integrations/supabase/client";

async function listPublicSessionBookings() {
  const { data, error } = await (supabase.from("bookings") as any)
    .select(
      "id, booking_date, start_time, final_amount, status, payment_status, shop:shops(name), booking_items(service_name_snapshot)",
    )
    .order("booking_date", { ascending: false })
    .order("start_time", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export function PublicBookingsPage() {
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (mounted) setHasSession(Boolean(data.session));
    });
    return () => {
      mounted = false;
    };
  }, []);

  const bookings = useQuery({
    queryKey: ["public-session", "bookings"],
    queryFn: listPublicSessionBookings,
    enabled: hasSession === true,
    retry: false,
  });

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-12">
        <h1 className="text-3xl font-bold">My bookings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Appointments created from salon websites on this device.
        </p>

        {hasSession === null || bookings.isLoading ? (
          <div className="grid min-h-64 place-items-center">
            <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : hasSession === false ? (
          <EmptyBookings message="No booking session was found on this device." />
        ) : bookings.isError ? (
          <EmptyBookings message="Your bookings are not available yet. Here is a sample preview." />
        ) : !bookings.data?.length ? (
          <EmptyBookings message="You have not created an appointment yet." />
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {bookings.data.map((booking) => {
              const shop = Array.isArray(booking.shop) ? booking.shop[0] : booking.shop;
              const items = Array.isArray(booking.booking_items) ? booking.booking_items : [];
              const serviceName =
                items
                  .map((item: { service_name_snapshot?: string | null }) =>
                    item.service_name_snapshot?.trim(),
                  )
                  .filter(Boolean)
                  .join(", ") || "Salon appointment";
              const advancePending = booking.payment_status === "advance_pending";
              return (
                <article key={booking.id} className="rounded-2xl border bg-card p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-bold">{serviceName}</h2>
                      <p className="text-sm text-muted-foreground">{shop?.name ?? "Salon"}</p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        advancePending
                          ? "bg-amber-100 text-amber-800"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {advancePending ? "Advance pending" : booking.status.replaceAll("_", " ")}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm">
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      {booking.booking_date}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {String(booking.start_time).slice(0, 5)}
                    </span>
                  </div>
                  <div className="mt-4 flex justify-between border-t pt-3 text-sm">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-bold">
                      ₹{Number(booking.final_amount).toLocaleString("en-IN")}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
      <PublicFooter />
    </div>
  );
}

function EmptyBookings({ message }: { message: string }) {
  return (
    <div className="mt-8 space-y-4">
      <div className="rounded-2xl border bg-card p-6 text-center">
        <p className="font-semibold">No bookings yet</p>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        <Link
          to="/"
          className="mt-5 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Explore salons
        </Link>
      </div>
      <article className="rounded-2xl border border-dashed bg-card/70 p-5 opacity-80">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              Sample preview
            </span>
            <h2 className="mt-3 font-bold">Haircut & Styling</h2>
            <p className="text-sm text-muted-foreground">Your selected salon</p>
          </div>
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800">
            Upcoming
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="h-4 w-4" /> Selected date
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock className="h-4 w-4" /> Selected time
          </span>
        </div>
        <p className="mt-4 border-t pt-3 text-xs text-muted-foreground">
          This is only an example. Your real booking will appear here after confirmation.
        </p>
      </article>
    </div>
  );
}

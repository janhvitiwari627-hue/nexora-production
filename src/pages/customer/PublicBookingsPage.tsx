import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock, LoaderCircle } from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { supabase } from "@/integrations/supabase/client";

async function listPublicSessionBookings() {
  const { data, error } = await supabase
    .from("bookings")
    .select(
      "id, service_name, booking_date, booking_time, price, status, payment_status, salons(name)",
    )
    .order("booking_date", { ascending: false })
    .order("booking_time", { ascending: false });
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
          <div role="alert" className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="font-semibold text-red-800">Bookings could not be loaded</p>
            <p className="mt-1 text-sm text-red-700">
              {bookings.error instanceof Error ? bookings.error.message : "Please try again."}
            </p>
          </div>
        ) : !bookings.data?.length ? (
          <EmptyBookings message="You have not created an appointment yet." />
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {bookings.data.map((booking) => {
              const salon = Array.isArray(booking.salons) ? booking.salons[0] : booking.salons;
              const advancePending = booking.payment_status === "advance_pending";
              return (
                <article key={booking.id} className="rounded-2xl border bg-card p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-bold">{booking.service_name}</h2>
                      <p className="text-sm text-muted-foreground">{salon?.name ?? "Salon"}</p>
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
                      {String(booking.booking_time).slice(0, 5)}
                    </span>
                  </div>
                  <div className="mt-4 flex justify-between border-t pt-3 text-sm">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-bold">
                      ₹{Number(booking.price).toLocaleString("en-IN")}
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
    <div className="mt-8 rounded-2xl border bg-card p-8 text-center">
      <p className="text-muted-foreground">{message}</p>
      <Link
        to="/"
        className="mt-5 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
      >
        Explore salons
      </Link>
    </div>
  );
}

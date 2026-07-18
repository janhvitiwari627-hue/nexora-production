import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock, LoaderCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";

async function listBookings() {
  const { data, error } = await supabase
    .from("bookings")
    .select(
      "id, service_name, booking_date, booking_time, price, status, payment_status, salons(name), staff(name)",
    )
    .order("booking_date", { ascending: false })
    .order("booking_time", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export function CustomerAppBookings() {
  const user = useAuthStore((state) => state.user);
  const bookings = useQuery({
    queryKey: ["customer-app", "bookings", user?.id],
    queryFn: listBookings,
    enabled: Boolean(user),
    retry: false,
  });

  if (!user) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <CalendarDays className="mx-auto h-10 w-10 text-violet-700" />
        <h1 className="mt-4 text-2xl font-black">Login to view bookings</h1>
        <p className="mt-2 text-sm text-slate-500">
          Your upcoming and past bookings will appear here.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/login"
            className="rounded-full bg-violet-700 px-5 py-2.5 text-sm font-bold text-white"
          >
            Login
          </Link>
          <Link to="/signup" className="rounded-full border bg-white px-5 py-2.5 text-sm font-bold">
            Signup
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
      <h1 className="text-3xl font-black">My bookings</h1>
      <p className="mt-1 text-sm text-slate-500">Upcoming appointments and booking history.</p>
      {bookings.isLoading ? (
        <div className="grid min-h-64 place-items-center">
          <LoaderCircle className="h-6 w-6 animate-spin text-violet-700" />
        </div>
      ) : bookings.isError ? (
        <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          Bookings could not be loaded.
        </p>
      ) : bookings.data?.length ? (
        <div className="mt-6 space-y-4">
          {bookings.data.map((booking) => {
            const salon = Array.isArray(booking.salons) ? booking.salons[0] : booking.salons;
            const staff = Array.isArray(booking.staff) ? booking.staff[0] : booking.staff;
            return (
              <article key={booking.id} className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-bold">{booking.service_name}</h2>
                    <p className="text-sm text-slate-500">
                      {salon?.name ?? "Salon"} · {staff?.name ?? "Any professional"}
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                    {booking.payment_status === "advance_pending"
                      ? "Advance pending"
                      : booking.status.replaceAll("_", " ")}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    {booking.booking_date}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {String(booking.booking_time).slice(0, 5)}
                  </span>
                </div>
                <p className="mt-4 border-t pt-3 text-right font-bold">
                  ₹{Number(booking.price).toLocaleString("en-IN")}
                </p>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border bg-white p-8 text-center">
          <p className="font-bold">No bookings yet</p>
          <Link
            to="/app/customer/search"
            className="mt-4 inline-flex rounded-full bg-violet-700 px-5 py-2.5 text-sm font-bold text-white"
          >
            Find a salon
          </Link>
        </div>
      )}
    </main>
  );
}

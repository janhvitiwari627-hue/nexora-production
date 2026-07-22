import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock, LoaderCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";

async function listBookings() {
  const { data, error } = await (supabase.from("bookings") as any)
    .select(
      "id, booking_date, start_time, final_amount, status, payment_status, shop:shops(name), staff(name), booking_items(service_name_snapshot)",
    )
    .order("booking_date", { ascending: false })
    .order("start_time", { ascending: false });
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
        <CalendarDays className="mx-auto h-10 w-10 text-[#9a6b16]" />
        <h1 className="mt-4 text-2xl font-black">Login to view bookings</h1>
        <p className="mt-2 text-sm text-[#7a746a]">
          Your upcoming and past bookings will appear here.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/login"
            className="rounded-full bg-[#0b0a08] px-5 py-2.5 text-sm font-bold text-[#f3cf70]"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="rounded-full border border-[#e8e0d2] bg-white px-5 py-2.5 text-sm font-bold"
          >
            Signup
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
      <h1 className="text-3xl font-black">My bookings</h1>
      <p className="mt-1 text-sm text-[#7a746a]">Upcoming appointments and booking history.</p>
      {bookings.isLoading ? (
        <div className="grid min-h-64 place-items-center">
          <LoaderCircle className="h-6 w-6 animate-spin text-[#9a6b16]" />
        </div>
      ) : bookings.isError ? (
        <div className="mt-8 rounded-2xl border border-[#e8e0d2] bg-white p-8 text-center">
          <p className="font-bold">No bookings yet</p>
          <p className="mt-1 text-sm text-[#7a746a]">Find a salon to create your first booking.</p>
        </div>
      ) : bookings.data?.length ? (
        <div className="mt-6 space-y-4">
          {bookings.data.map((booking) => {
            const shop = Array.isArray(booking.shop) ? booking.shop[0] : booking.shop;
            const staff = Array.isArray(booking.staff) ? booking.staff[0] : booking.staff;
            const items = Array.isArray(booking.booking_items) ? booking.booking_items : [];
            const serviceName =
              items
                .map((item: { service_name_snapshot?: string | null }) =>
                  item.service_name_snapshot?.trim(),
                )
                .filter(Boolean)
                .join(", ") || "Salon appointment";
            return (
              <article
                key={booking.id}
                className="rounded-2xl border border-[#e8e0d2] bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-bold">{serviceName}</h2>
                    <p className="text-sm text-[#7a746a]">
                      {shop?.name ?? "Salon"} · {staff?.name ?? "Any professional"}
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                    {booking.payment_status === "advance_pending"
                      ? "Advance pending"
                      : booking.status.replaceAll("_", " ")}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-[#655f56]">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    {booking.booking_date}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {String(booking.start_time).slice(0, 5)}
                  </span>
                </div>
                <p className="mt-4 border-t pt-3 text-right font-bold">
                  ₹{Number(booking.final_amount).toLocaleString("en-IN")}
                </p>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-[#e8e0d2] bg-white p-8 text-center">
          <p className="font-bold">No bookings yet</p>
          <Link
            to="/app/customer/search"
            className="mt-4 inline-flex rounded-full bg-[#0b0a08] px-5 py-2.5 text-sm font-bold text-[#f3cf70]"
          >
            Find a salon
          </Link>
        </div>
      )}
    </main>
  );
}

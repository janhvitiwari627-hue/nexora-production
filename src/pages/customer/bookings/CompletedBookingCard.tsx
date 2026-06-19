import { Link } from "@tanstack/react-router";
import { Star, RotateCcw } from "lucide-react";
import { formatBookingDate, type CompletedBooking } from "./mockBookings";

export function CompletedBookingCard({ booking }: { booking: CompletedBooking }) {
  return (
    <article className="overflow-hidden rounded-2xl border bg-card p-4 shadow-sm transition hover:shadow-md">
      <div className="flex gap-4">
        <img
          src={booking.shopImage}
          alt={booking.shopName}
          className="h-20 w-20 shrink-0 rounded-2xl object-cover"
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold sm:text-base">{booking.shopName}</h3>
          <p className="truncate text-sm text-muted-foreground">{booking.service}</p>
          <p className="text-xs text-muted-foreground">{formatBookingDate(booking.dateISO)}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold text-heading">
              Amount: ₹{booking.amount}
            </span>
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
              Rewards: +{booking.rewardsEarned} pts
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={booking.reviewed}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          <Star className="h-3.5 w-3.5 fill-current" />
          {booking.reviewed ? "Review Submitted" : "Review Shop"}
        </button>
        <Link
          to="/book/$slug"
          params={{ slug: booking.shopSlug }}
          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-primary px-3 py-2 text-xs font-bold text-primary transition hover:bg-primary/5"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Rebook
        </Link>
      </div>
    </article>
  );
}

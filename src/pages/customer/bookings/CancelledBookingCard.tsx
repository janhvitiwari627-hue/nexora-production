import { Link } from "@tanstack/react-router";
import { Info, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBookingDate, type CancelledBooking, type RefundStatus } from "./mockBookings";

const REFUND: Record<RefundStatus, { label: string; classes: string }> = {
  refunded: { label: "Refunded", classes: "bg-emerald-100 text-emerald-700" },
  processing: { label: "Refund Processing", classes: "bg-amber-100 text-amber-700" },
  "not-applicable": { label: "No Refund", classes: "bg-muted text-muted-foreground" },
};

export function CancelledBookingCard({ booking }: { booking: CancelledBooking }) {
  const r = REFUND[booking.refundStatus];
  return (
    <article className="overflow-hidden rounded-2xl border bg-card p-4 shadow-sm transition hover:shadow-md">
      <div className="flex gap-4">
        <img
          src={booking.shopImage}
          alt={booking.shopName}
          className="h-20 w-20 shrink-0 rounded-2xl object-cover grayscale"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold sm:text-base">{booking.shopName}</h3>
              <p className="truncate text-sm text-muted-foreground">{booking.service}</p>
              <p className="text-xs text-muted-foreground">{formatBookingDate(booking.dateISO)}</p>
            </div>
            <span
              className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold", r.classes)}
            >
              {r.label}
              {booking.refundAmount ? ` · ₹${booking.refundAmount}` : ""}
            </span>
          </div>
          <div className="mt-2 flex items-start gap-2 rounded-xl bg-muted/60 p-2.5 text-xs text-heading">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span>{booking.reason}</span>
          </div>
        </div>
      </div>

      <Link
        to="/book/$slug"
        params={{ slug: booking.shopSlug }}
        className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition hover:opacity-90"
      >
        <RotateCcw className="h-3.5 w-3.5" /> Book Again
      </Link>
    </article>
  );
}

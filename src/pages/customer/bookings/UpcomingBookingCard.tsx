import { CalendarClock, X, MapPin, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBookingDate, type UpcomingBooking, type BookingStatus } from "./mockBookings";

const STATUS: Record<BookingStatus, { label: string; classes: string }> = {
  confirmed: { label: "Confirmed", classes: "bg-emerald-100 text-emerald-700" },
  pending: { label: "Pending", classes: "bg-amber-100 text-amber-700" },
  accepted: { label: "Accepted", classes: "bg-indigo-100 text-indigo-700" },
};

export function UpcomingBookingCard({ booking }: { booking: UpcomingBooking }) {
  const s = STATUS[booking.status];
  return (
    <article className="overflow-hidden rounded-2xl border bg-card p-4 shadow-sm transition hover:shadow-md">
      <div className="flex gap-4">
        <img
          src={booking.shopImage}
          alt={booking.shopName}
          className="h-20 w-20 shrink-0 rounded-2xl object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold sm:text-base">{booking.shopName}</h3>
              <p className="truncate text-sm text-muted-foreground">{booking.service}</p>
              <p className="text-xs text-muted-foreground">with {booking.staff}</p>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold",
                s.classes,
              )}
            >
              {s.label}
            </span>
          </div>
          <p className="mt-2 text-xs font-semibold text-heading">
            {formatBookingDate(booking.dateISO)}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <ActionButton icon={CalendarClock} label="Reschedule" />
        <ActionButton icon={X} label="Cancel" tone="danger" />
        <ActionButton icon={MapPin} label="Directions" href={booking.mapsUrl} />
        <ActionButton icon={Phone} label="Call" href={`tel:${booking.phone}`} />
      </div>
    </article>
  );
}

function ActionButton({
  icon: Icon,
  label,
  href,
  tone = "default",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href?: string;
  tone?: "default" | "danger";
}) {
  const cls = cn(
    "inline-flex w-full items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition",
    tone === "danger"
      ? "border-rose-200 text-rose-600 hover:bg-rose-50"
      : "border-border text-heading hover:border-primary/40 hover:bg-primary/5",
  );
  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        <Icon className="h-3.5 w-3.5" /> {label}
      </a>
    );
  }
  return (
    <button type="button" className={cls}>
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

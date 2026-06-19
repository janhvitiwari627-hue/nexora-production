import { Calendar, MapPin, Phone, RotateCcw, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { mockUpcomingBooking } from "../mockUser";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) +
    " · " +
    d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export function UpcomingBookingWidget() {
  const b = mockUpcomingBooking;

  if (!b) {
    return (
      <div className="rounded-3xl border border-dashed bg-card p-8 text-center">
        <Calendar className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-3 font-semibold">No upcoming bookings</p>
        <Link
          to="/search"
          className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
        >
          Book your next appointment →
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
      <div className="grid gap-4 p-4 sm:grid-cols-[140px_minmax(0,1fr)]">
        <img
          src={b.shopCover}
          alt={b.shopName}
          className="h-32 w-full rounded-2xl object-cover sm:h-full"
        />
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-lg font-bold">{b.shopName}</h3>
              <p className="truncate text-sm text-muted-foreground">
                {b.service} · with {b.staff}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
              {b.status}
            </span>
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium">
            <Calendar className="h-4 w-4 text-primary" />
            {formatDate(b.dateISO)}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="outline">
              <RotateCcw className="h-3.5 w-3.5" /> Reschedule
            </Button>
            <Button size="sm" variant="outline">
              <X className="h-3.5 w-3.5" /> Cancel
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a href={b.mapsUrl} target="_blank" rel="noreferrer">
                <MapPin className="h-3.5 w-3.5" /> Navigate
              </a>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a href={`tel:${b.phone}`}>
                <Phone className="h-3.5 w-3.5" /> Call
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

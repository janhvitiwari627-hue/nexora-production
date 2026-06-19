import { Link } from "@tanstack/react-router";
import { Calendar, CheckCircle2, XCircle, RefreshCw, type LucideIcon } from "lucide-react";
import type { BookingTab } from "./mockBookings";

const EMPTY: Record<
  BookingTab,
  { Icon: LucideIcon; title: string; subtitle: string; cta: string; href: string }
> = {
  upcoming: {
    Icon: Calendar,
    title: "No upcoming bookings",
    subtitle: "Book your next appointment in seconds.",
    cta: "Explore Shops",
    href: "/search",
  },
  completed: {
    Icon: CheckCircle2,
    title: "Nothing completed yet",
    subtitle: "Once you finish a visit, it will show up here.",
    cta: "Find a Service",
    href: "/search",
  },
  cancelled: {
    Icon: XCircle,
    title: "No cancellations",
    subtitle: "All your bookings are on track. Nice!",
    cta: "View Upcoming",
    href: "/dashboard/bookings",
  },
  rescheduled: {
    Icon: RefreshCw,
    title: "No rescheduled bookings",
    subtitle: "Need to move a slot? You can reschedule from the upcoming tab.",
    cta: "View Upcoming",
    href: "/dashboard/bookings",
  },
};

export function BookingsEmptyState({ tab }: { tab: BookingTab }) {
  const e = EMPTY[tab];
  return (
    <div className="grid place-items-center rounded-3xl border border-dashed bg-card/60 px-6 py-16 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
        <e.Icon className="h-8 w-8" />
      </div>
      <h3 className="mt-4 text-lg font-bold">{e.title}</h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{e.subtitle}</p>
      <Link
        to={e.href}
        className="mt-5 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground transition hover:opacity-90"
      >
        {e.cta}
      </Link>
    </div>
  );
}

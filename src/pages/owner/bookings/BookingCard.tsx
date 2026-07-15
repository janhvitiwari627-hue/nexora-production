import { Phone, MessageCircle, Eye, Check, UserX, X as XIcon, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { STATUS_META, type OwnerBooking, type OwnerBookingStatus } from "./mockOwnerBookings";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: OwnerBookingStatus }) {
  const m = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        m.bg,
        m.text,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", m.dot)} />
      {m.label}
    </span>
  );
}

export function BookingCard({
  booking,
  selected,
  onSelect,
  onView,
  onAction,
  onSuggest,
}: {
  booking: OwnerBooking;
  selected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onView: (b: OwnerBooking) => void;
  onAction: (id: string, next: OwnerBookingStatus) => void;
  onSuggest: (booking: OwnerBooking) => void;
}) {
  const wa = `https://wa.me/91${booking.mobile}?text=Hi%20${encodeURIComponent(booking.customer)}`;
  const isFinal =
    booking.status === "completed" ||
    booking.status === "cancelled" ||
    booking.status === "no_show";
  const can = {
    confirm: booking.status === "pending",
    complete: booking.status === "confirmed",
    noShow: booking.status === "confirmed" || booking.status === "pending",
    cancel: !isFinal,
  };

  return (
    <div className="bg-card border-border rounded-xl border p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start gap-3">
        <Checkbox
          checked={selected}
          onCheckedChange={(c) => onSelect(booking.id, Boolean(c))}
          className="mt-1"
          aria-label={`Select ${booking.id}`}
        />
        <div className="bg-primary/10 text-primary grid h-10 w-10 shrink-0 place-items-center rounded-full font-bold">
          {booking.avatar}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <a
                href={`tel:${booking.mobile}`}
                className="text-heading hover:text-primary inline-flex items-center gap-1.5 truncate font-semibold"
              >
                {booking.customer}
                <Phone className="h-3.5 w-3.5 md:hidden" />
              </a>
              <div className="text-muted-foreground text-xs">
                {booking.id} · {booking.mobile}
              </div>
            </div>
            <StatusBadge status={booking.status} />
          </div>
          <div className="text-body mt-2 grid grid-cols-1 gap-1 text-sm sm:grid-cols-3">
            <div>
              <span className="text-muted-foreground">Service:</span> {booking.service}
            </div>
            <div>
              <span className="text-muted-foreground">Staff:</span> {booking.staff}
            </div>
            <div>
              <span className="text-muted-foreground">When:</span> {booking.date} · {booking.time}
            </div>
          </div>
          <div className="text-body mt-1 text-sm">
            <span className="text-muted-foreground">Advance:</span> ₹
            {booking.advance.toLocaleString()}{" "}
            <span className="text-muted-foreground">/ Total:</span> ₹
            {booking.total.toLocaleString()}
          </div>
          {booking.serviceMode === "home" && booking.address && (
            <div className="text-body mt-1 text-sm">
              <span className="text-muted-foreground">Home service:</span> {booking.address}
            </div>
          )}
          {booking.proposalStatus === "pending" && (
            <div className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Waiting for customer response to {booking.proposedDate} at {booking.proposedTime}.
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {can.confirm && (
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => onAction(booking.id, "confirmed")}
              >
                <Check className="h-4 w-4" /> Confirm
              </Button>
            )}
            {can.confirm && (
              <Button size="sm" variant="outline" onClick={() => onSuggest(booking)}>
                <CalendarClock className="h-4 w-4" /> Suggest New Time
              </Button>
            )}
            {can.complete && (
              <Button
                size="sm"
                className="bg-success hover:bg-success/90 text-white"
                onClick={() => onAction(booking.id, "completed")}
              >
                <Check className="h-4 w-4" /> Complete
              </Button>
            )}
            {can.noShow && (
              <Button size="sm" variant="outline" onClick={() => onAction(booking.id, "no_show")}>
                <UserX className="h-4 w-4" /> No Show
              </Button>
            )}
            {can.cancel && (
              <Button
                size="sm"
                variant="outline"
                className="text-danger border-danger/40 hover:bg-danger/10"
                onClick={() => onAction(booking.id, "cancelled")}
              >
                <XIcon className="h-4 w-4" /> Cancel
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => onView(booking)}>
              <Eye className="h-4 w-4" /> Details
            </Button>
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="text-success hover:bg-success/10 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

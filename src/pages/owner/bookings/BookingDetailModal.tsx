import { MessageCircle, Phone, User } from "lucide-react";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./BookingCard";
import type { OwnerBooking } from "./mockOwnerBookings";

export function BookingDetailModal({
  booking,
  onClose,
}: {
  booking: OwnerBooking | null;
  onClose: () => void;
}) {
  if (!booking) return null;
  const wa = `https://wa.me/91${booking.mobile}?text=Hi%20${encodeURIComponent(booking.customer)}%2C%20regarding%20your%20booking%20${booking.id}`;

  return (
    <Modal open={!!booking} onClose={onClose} title={`Booking ${booking.id}`} size="lg">
      <div className="space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary grid h-12 w-12 place-items-center rounded-full font-bold">
              {booking.avatar}
            </div>
            <div>
              <div className="text-heading text-lg font-bold">{booking.customer}</div>
              <a
                href={`tel:${booking.mobile}`}
                className="text-muted-foreground hover:text-primary inline-flex items-center gap-1 text-sm"
              >
                <Phone className="h-3.5 w-3.5" /> {booking.mobile}
              </a>
            </div>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <Detail label="Service" value={booking.service} />
          <Detail label="Staff" value={booking.staff} />
          <Detail label="Duration" value={`${booking.durationMin} min`} />
          <Detail label="Date" value={booking.date} />
          <Detail label="Time" value={booking.time} />
          <Detail label="Booking ID" value={booking.id} />
          <Detail label="Advance Paid" value={`₹${booking.advance.toLocaleString()}`} />
          <Detail label="Total" value={`₹${booking.total.toLocaleString()}`} />
          <Detail
            label="Balance"
            value={`₹${(booking.total - booking.advance).toLocaleString()}`}
          />
        </div>

        {booking.notes && (
          <div className="bg-muted/40 rounded-lg p-3 text-sm">
            <div className="text-muted-foreground mb-1 text-xs uppercase">Notes</div>
            {booking.notes}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <button className="text-primary inline-flex items-center gap-1.5 text-sm font-medium hover:underline">
            <User className="h-4 w-4" /> View customer history
          </button>
          <div className="flex gap-2">
            <a href={wa} target="_blank" rel="noreferrer">
              <Button className="bg-success hover:bg-success/90 text-white">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </Button>
            </a>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-muted-foreground text-xs uppercase tracking-wide">{label}</div>
      <div className="text-heading mt-0.5 font-medium">{value}</div>
    </div>
  );
}

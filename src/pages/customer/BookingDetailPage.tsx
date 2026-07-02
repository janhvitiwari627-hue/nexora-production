import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useBookingRefreshing } from "@/lib/booking-refresh-signal";
import {
  Copy,
  Check,
  Download,
  Phone,
  MapPin,
  Clock,
  CalendarClock,
  X,
  Star,
  FileText,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { StatusTimeline } from "./bookings/StatusTimeline";
import { formatBookingDate } from "./bookings/mockBookings";
import { mockBookingDetail, type BookingDetail } from "./bookings/mockBookingDetail";

const STATUS_BADGE: Record<string, string> = {
  confirmed: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  accepted: "bg-indigo-100 text-indigo-700",
  completed: "bg-slate-200 text-slate-700",
};

export function BookingDetailPage({ booking = mockBookingDetail }: { booking?: BookingDetail }) {
  const [copied, setCopied] = useState(false);
  const qrWrapRef = useRef<HTMLDivElement>(null);
  const isRefreshing = useBookingRefreshing(booking.id);

  const total = booking.payment.servicePrice + booking.payment.platformFee - booking.payment.discount;
  const remaining = Math.max(0, total - booking.payment.advancePaid);

  const copyId = () => {
    navigator.clipboard?.writeText(booking.id).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const downloadQR = () => {
    const canvas = qrWrapRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${booking.id}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      {isRefreshing && (
        <>
          {/* Indeterminate top progress bar */}
          <div
            role="progressbar"
            aria-label="Refreshing booking details"
            className="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-primary/10"
          >
            <div className="h-full w-1/3 animate-[refreshSlide_1.1s_ease-in-out_infinite] bg-primary" />
          </div>
          {/* Aria-live status pill */}
          <div
            aria-live="polite"
            className="fixed left-1/2 top-3 z-50 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-primary/30 bg-card px-3 py-1.5 text-xs font-semibold text-heading shadow-md"
          >
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            Refreshing booking details…
          </div>
          <style>{`@keyframes refreshSlide{0%{transform:translateX(-100%)}50%{transform:translateX(150%)}100%{transform:translateX(400%)}}`}</style>
        </>
      )}
      <main
        className={
          "mx-auto w-full max-w-5xl px-4 py-6 transition-opacity sm:py-10 " +
          (isRefreshing ? "opacity-70" : "")
        }
        aria-busy={isRefreshing}
      >
        <Link
          to="/dashboard/bookings"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-heading"
        >
          <ArrowLeft className="h-4 w-4" /> Back to bookings
        </Link>

        {/* Header */}
        <header className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-5 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Booking ID
            </p>
            <div className="mt-1 flex items-center gap-2">
              <h1 className="text-xl font-black sm:text-2xl">{booking.id}</h1>
              <button
                type="button"
                onClick={copyId}
                aria-label="Copy booking ID"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:text-heading"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <span
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-bold capitalize",
              STATUS_BADGE[booking.status] ?? "bg-muted text-heading",
            )}
          >
            {booking.status}
          </span>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          {/* Left column */}
          <div className="space-y-6">
            <StatusTimeline current={booking.timelineStatus} />

            {/* Shop card */}
            <section className="rounded-2xl border bg-card p-5 shadow-sm">
              <h3 className="text-sm font-bold">Shop Details</h3>
              <div className="mt-3 flex gap-4">
                <img
                  src={booking.shop.image}
                  alt={booking.shop.name}
                  className="h-20 w-20 shrink-0 rounded-2xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <Link
                    to="/shop/$slug"
                    params={{ slug: booking.shop.slug }}
                    className="text-base font-bold hover:underline"
                  >
                    {booking.shop.name}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">{booking.shop.address}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      href={`tel:${booking.shop.phone}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold transition hover:border-primary/40 hover:bg-primary/5"
                    >
                      <Phone className="h-3.5 w-3.5" /> {booking.shop.phone}
                    </a>
                    <a
                      href={booking.shop.mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold transition hover:border-primary/40 hover:bg-primary/5"
                    >
                      <MapPin className="h-3.5 w-3.5" /> Directions
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Service details */}
            <section className="rounded-2xl border bg-card p-5 shadow-sm">
              <h3 className="text-sm font-bold">Service Details</h3>
              <dl className="mt-3 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                <Detail label="Service" value={booking.service.name} />
                <Detail label="Staff" value={booking.service.staff} />
                <Detail
                  label="Duration"
                  value={
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {booking.service.durationMinutes} min
                    </span>
                  }
                />
                <Detail
                  label="When"
                  value={formatBookingDate(booking.service.dateISO)}
                  span={2}
                />
                <Detail label="Total" value={`₹${total}`} />
                <Detail label="Advance Paid" value={`₹${booking.payment.advancePaid}`} />
                <Detail
                  label="Remaining"
                  value={
                    <span className={remaining > 0 ? "text-amber-600" : "text-emerald-600"}>
                      ₹{remaining}
                    </span>
                  }
                />
              </dl>
            </section>

            {/* Payment breakdown */}
            <section className="rounded-2xl border bg-card p-5 shadow-sm">
              <h3 className="text-sm font-bold">Payment Breakdown</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <Line label="Service price" value={`₹${booking.payment.servicePrice}`} />
                <Line label="Platform fee" value={`₹${booking.payment.platformFee}`} />
                {booking.payment.discount > 0 && (
                  <Line
                    label="Discount"
                    value={`− ₹${booking.payment.discount}`}
                    valueClass="text-emerald-600"
                  />
                )}
                <div className="border-t pt-2">
                  <Line label="Total" value={`₹${total}`} bold />
                </div>
                <Line
                  label="Advance paid"
                  value={`− ₹${booking.payment.advancePaid}`}
                  valueClass="text-emerald-600"
                />
                <div className="border-t pt-2">
                  <Line
                    label="Remaining at shop"
                    value={`₹${remaining}`}
                    bold
                    valueClass={remaining > 0 ? "text-amber-600" : "text-emerald-600"}
                  />
                </div>
              </ul>
            </section>
          </div>

          {/* Right column */}
          <aside className="space-y-6">
            <div className="rounded-2xl border bg-card p-5 text-center shadow-sm">
              <h3 className="text-sm font-bold">Show this at the shop</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Scan for instant check-in
              </p>
              <div
                ref={qrWrapRef}
                className="mx-auto mt-4 w-fit rounded-2xl border bg-white p-4"
              >
                <QRCodeCanvas
                  value={`nexora:booking:${booking.id}`}
                  size={180}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <button
                type="button"
                onClick={downloadQR}
                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-primary px-3 py-2 text-xs font-bold text-primary transition hover:bg-primary/5"
              >
                <Download className="h-3.5 w-3.5" /> Download QR
              </button>
            </div>

            {/* Conditional actions */}
            <div className="space-y-2 rounded-2xl border bg-card p-5 shadow-sm">
              <h3 className="text-sm font-bold">Actions</h3>
              {booking.isUpcoming ? (
                <>
                  <ActionBtn icon={CalendarClock} label="Reschedule" />
                  <ActionBtn icon={X} label="Cancel Booking" tone="danger" />
                </>
              ) : (
                <>
                  <ActionBtn
                    icon={Star}
                    label={booking.reviewed ? "Review Submitted" : "Write a Review"}
                    primary
                    disabled={booking.reviewed}
                  />
                  <ActionBtn icon={FileText} label="Download Invoice" />
                </>
              )}
            </div>
          </aside>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

function Detail({
  label,
  value,
  span,
}: {
  label: string;
  value: React.ReactNode;
  span?: number;
}) {
  return (
    <div className={span === 2 ? "col-span-2" : undefined}>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-semibold text-heading">{value}</dd>
    </div>
  );
}

function Line({
  label,
  value,
  bold,
  valueClass,
}: {
  label: string;
  value: string;
  bold?: boolean;
  valueClass?: string;
}) {
  return (
    <li className="flex items-center justify-between">
      <span className={cn("text-muted-foreground", bold && "font-bold text-heading")}>
        {label}
      </span>
      <span className={cn(bold ? "font-black text-heading" : "font-semibold", valueClass)}>
        {value}
      </span>
    </li>
  );
}

function ActionBtn({
  icon: Icon,
  label,
  primary,
  tone,
  disabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  primary?: boolean;
  tone?: "danger";
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "inline-flex w-full items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-xs font-bold transition disabled:opacity-50",
        primary && "bg-primary text-primary-foreground hover:opacity-90",
        tone === "danger" && "border border-rose-200 text-rose-600 hover:bg-rose-50",
        !primary && !tone && "border border-border text-heading hover:border-primary/40 hover:bg-primary/5",
      )}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

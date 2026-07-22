import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { QRCodeCanvas } from "qrcode.react";
import { motion } from "framer-motion";
import { Calendar, Check, CheckCircle2, Copy, Loader2, MessageCircle, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { createRemainingPaymentQr } from "@/lib/razorpay.functions";
import { QueuedBookingsList } from "@/components/shared/QueuedBookingsList";
import {
  advancePayable,
  formatINR,
  grandTotal,
  selectedServices,
  type BookingState,
} from "./state";

// (Removed Lottie animation in favor of a lightweight SVG check to avoid ESM interop issues.)

function buildICS({
  uid,
  title,
  description,
  location,
  date,
  time,
  durationMin,
}: {
  uid: string;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  durationMin: number;
}) {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const start = new Date(y, m - 1, d, hh, mm);
  const end = new Date(start.getTime() + durationMin * 60 * 1000);
  const fmt = (dt: Date) =>
    dt
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  const esc = (s: string) => s.replace(/[\\,;]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Nexora//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${uid}@nexora`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${esc(title)}`,
    `DESCRIPTION:${esc(description)}`,
    `LOCATION:${esc(location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function BookingConfirmationScreen({
  booking,
  bookingId,
}: {
  booking: BookingState;
  bookingId: string;
}) {
  const [copied, setCopied] = useState(false);
  const items = selectedServices(booking);
  const total = grandTotal(booking);
  const advance = advancePayable(booking);
  const services = items.map((s) => s.name).join(", ");
  const durationMin = items.reduce((a, s) => a + s.duration_minutes, 0);

  const qrPayload = useMemo(
    () =>
      JSON.stringify({
        id: bookingId,
        shop: booking.shopName,
        date: booking.date,
        time: booking.time,
      }),
    [bookingId, booking.shopName, booking.date, booking.time],
  );

  const copyId = () => {
    navigator.clipboard?.writeText(bookingId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const downloadICS = () => {
    if (!booking.date || !booking.time) return;
    const ics = buildICS({
      uid: bookingId,
      title: `${booking.shopName} — ${services}`,
      description: `Booking ${bookingId}\nServices: ${services}\nPaid advance: ${formatINR(advance)}`,
      location: booking.shopAddress,
      date: booking.date,
      time: booking.time,
      durationMin,
    });
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${bookingId}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const waText = encodeURIComponent(
    `I just booked ${booking.shopName}! Booking ID ${bookingId} on ${booking.date} at ${booking.time}. Services: ${services}.`,
  );

  return (
    <div className="mx-auto max-w-2xl py-10">
      <div className="flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="grid h-32 w-32 place-items-center rounded-full bg-success/15"
        >
          <CheckCircle2 className="h-20 w-20 text-success" strokeWidth={2.5} />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-heading mt-2 text-3xl font-black md:text-4xl"
        >
          Booking confirmed!
        </motion.h2>
        <p className="text-muted-foreground mt-2 max-w-md text-sm">
          We've sent the details to your phone. Show the QR at the salon for instant check-in.
        </p>
      </div>

      <QueuedBookingsList className="mt-6" />

      <div className="border-border bg-card mt-8 rounded-[var(--radius-card-lg)] border p-6 shadow-[var(--shadow-card)]">
        <div className="text-muted-foreground text-[11px] uppercase tracking-wider">Booking ID</div>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-heading font-mono text-2xl font-black tracking-wide">
            {bookingId}
          </span>
          <button
            type="button"
            onClick={copyId}
            aria-label="Copy booking id"
            className={cn(
              "grid h-9 w-9 place-items-center rounded-full transition",
              copied ? "bg-success/15 text-success" : "hover:bg-muted text-muted-foreground",
            )}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[200px_1fr]">
          <div className="grid place-items-center rounded-2xl bg-white p-3 ring-1 ring-border">
            <QRCodeCanvas value={qrPayload} size={172} bgColor="#ffffff" fgColor="#0A2540" />
          </div>
          <dl className="space-y-2 text-sm">
            <Row k="Salon" v={booking.shopName} />
            <Row k="Address" v={booking.shopAddress} />
            <Row k="Date" v={booking.date ?? "—"} />
            <Row k="Time" v={booking.time ?? "—"} />
            <Row k="Services" v={services} />
            <Row
              k="Stylist"
              v={
                booking.selectedStaffId
                  ? (booking.staff.find((s) => s.id === booking.selectedStaffId)?.name ?? "Any")
                  : "Any available"
              }
            />
            <Row k="Total" v={formatINR(total)} />
            <Row k="Paid (advance)" v={formatINR(advance)} highlight />
          </dl>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={downloadICS}
            className="border-primary text-primary hover:bg-primary/5 inline-flex items-center gap-1.5 rounded-[var(--radius-button)] border px-4 py-2.5 text-sm font-bold"
          >
            <Calendar className="h-4 w-4" /> Add to Calendar
          </button>
          <a
            href={`https://wa.me/?text=${waText}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-button)] bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white hover:brightness-110"
          >
            <MessageCircle className="h-4 w-4" /> Share on WhatsApp
          </a>
          <Link
            to="/"
            className="bg-gradient-cta text-primary-foreground ml-auto inline-flex items-center gap-1.5 rounded-[var(--radius-button)] px-4 py-2.5 text-sm font-bold shadow-[var(--shadow-glow)] hover:brightness-110"
          >
            View My Bookings
          </Link>
        </div>
      </div>

      <RemainingPaymentQr bookingId={bookingId} fallbackAmount={Math.max(0, total - advance)} />
    </div>
  );
}

function RemainingPaymentQr({
  bookingId,
  fallbackAmount,
}: {
  bookingId: string;
  fallbackAmount: number;
}) {
  const createQr = useServerFn(createRemainingPaymentQr);
  const qrQuery = useQuery({
    queryKey: ["razorpay-remaining-qr", bookingId],
    queryFn: () => createQr({ data: { bookingId } }),
    retry: false,
    staleTime: 25 * 60 * 1000,
  });
  const qr = qrQuery.data as
    | { imageUrl: string; amount: number; expiresAt: string | null; testMode: boolean }
    | undefined;

  return (
    <section className="border-border bg-card mt-6 rounded-[var(--radius-card-lg)] border p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 text-primary grid h-10 w-10 shrink-0 place-items-center rounded-xl">
          <QrCode className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-heading font-black">Remaining 75% payment QR</h3>
          <p className="text-muted-foreground mt-1 text-xs">
            Fixed amount: {formatINR(qr?.amount ?? fallbackAmount)}. This single-use QR is for this
            booking only.
          </p>
        </div>
      </div>

      {qrQuery.isLoading && (
        <div className="text-muted-foreground mt-5 inline-flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Generating secure Razorpay QR…
        </div>
      )}
      {qrQuery.isError && (
        <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs font-semibold text-amber-900">
          QR is not available yet. Razorpay QR Code API must be enabled for the Test account. Your
          booking and 25% advance remain confirmed.
        </div>
      )}
      {qr && (
        <div className="mt-5 grid gap-4 sm:grid-cols-[220px_1fr] sm:items-center">
          <div className="grid place-items-center rounded-2xl border bg-white p-3">
            <img src={qr.imageUrl} alt="Razorpay remaining payment QR" className="h-48 w-48" />
          </div>
          <div className="space-y-2 text-sm">
            <div className="text-primary text-2xl font-black">{formatINR(qr.amount)}</div>
            <p className="text-muted-foreground text-xs">
              {qr.testMode ? "TEST MODE — no real money will be charged." : "Live payment QR"}
            </p>
            {qr.expiresAt && (
              <p className="text-muted-foreground text-xs">
                Expires: {new Date(qr.expiresAt).toLocaleString("en-IN")}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function Row({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <dt className="text-muted-foreground w-24 shrink-0 text-[11px] uppercase tracking-wider">
        {k}
      </dt>
      <dd
        className={cn(
          "text-heading flex-1 break-words font-semibold",
          highlight && "text-primary font-black",
        )}
      >
        {v}
      </dd>
    </div>
  );
}

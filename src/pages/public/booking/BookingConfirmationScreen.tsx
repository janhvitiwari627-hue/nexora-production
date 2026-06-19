import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import Lottie from "lottie-react";
import { QRCodeCanvas } from "qrcode.react";
import { motion } from "framer-motion";
import { Calendar, Check, Copy, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  advancePayable,
  formatINR,
  grandTotal,
  selectedServices,
  type BookingState,
} from "./state";

// Minimal embedded "success check" Lottie (small, deterministic, no fetch).
const successAnimation = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 60,
  w: 200,
  h: 200,
  nm: "success",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "circle",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [100, 100] },
        a: { a: 0, k: [0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [0, 0, 100], h: 0, i: { x: [0.4], y: [1] }, o: { x: [0.4], y: [0] } },
            { t: 25, s: [100, 100, 100] },
          ],
        },
      },
      ao: 0,
      shapes: [
        {
          ty: "el",
          d: 1,
          s: { a: 0, k: [140, 140] },
          p: { a: 0, k: [0, 0] },
          nm: "Ellipse",
        },
        {
          ty: "fl",
          c: { a: 0, k: [0.149, 0.769, 0.439, 1] },
          o: { a: 0, k: 100 },
          nm: "Fill",
        },
      ],
      ip: 0,
      op: 60,
      st: 0,
      bm: 0,
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "check",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [100, 100] },
        a: { a: 0, k: [0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: [
        {
          ty: "sh",
          ks: {
            a: 0,
            k: {
              i: [[0, 0], [0, 0], [0, 0]],
              o: [[0, 0], [0, 0], [0, 0]],
              v: [[-30, 0], [-8, 22], [34, -22]],
              c: false,
            },
          },
          nm: "Check path",
        },
        {
          ty: "tm",
          s: { a: 0, k: 0 },
          e: {
            a: 1,
            k: [
              { t: 20, s: [0], h: 0, i: { x: [0.4], y: [1] }, o: { x: [0.4], y: [0] } },
              { t: 50, s: [100] },
            ],
          },
          o: { a: 0, k: 0 },
          m: 1,
        },
        {
          ty: "st",
          c: { a: 0, k: [1, 1, 1, 1] },
          o: { a: 0, k: 100 },
          w: { a: 0, k: 14 },
          lc: 2,
          lj: 2,
          nm: "Stroke",
        },
      ],
      ip: 0,
      op: 60,
      st: 0,
      bm: 0,
    },
  ],
} as const;

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
        <div className="h-40 w-40">
          <Lottie animationData={successAnimation} loop={false} />
        </div>
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

      <div className="border-border bg-card mt-8 rounded-[var(--radius-card-lg)] border p-6 shadow-[var(--shadow-card)]">
        <div className="text-muted-foreground text-[11px] uppercase tracking-wider">
          Booking ID
        </div>
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
                  ? booking.staff.find((s) => s.id === booking.selectedStaffId)?.name ?? "Any"
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
    </div>
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

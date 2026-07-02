import { useMemo, useState } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { OfflineBanner } from "@/components/shared/OfflineBanner";
import { OfflineSyncStatus } from "@/components/shared/OfflineSyncStatus";
import { TASK_CREATE_AND_CONFIRM_BOOKING } from "@/lib/booking-offline-sync";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { BookingTabBar } from "./bookings/BookingTabBar";
import { BookingFilterRow, type DateRangeId } from "./bookings/BookingFilterRow";
import { UpcomingBookingCard } from "./bookings/UpcomingBookingCard";
import { CompletedBookingCard } from "./bookings/CompletedBookingCard";
import { CancelledBookingCard } from "./bookings/CancelledBookingCard";
import { BookingsEmptyState } from "./bookings/BookingsEmptyState";
import {
  mockUpcoming,
  mockCompleted,
  mockCancelled,
  mockRescheduled,
  type BookingTab,
} from "./bookings/mockBookings";

const RANGE_MS: Record<DateRangeId, number> = {
  today: 86400000,
  "7d": 7 * 86400000,
  "30d": 30 * 86400000,
  "6m": 182 * 86400000,
  custom: Infinity,
};

function withinRange(iso: string, range: DateRangeId | null) {
  if (!range) return true;
  const diff = Math.abs(Date.now() - new Date(iso).getTime());
  return diff <= RANGE_MS[range];
}

function matchesQuery(q: string, ...fields: string[]) {
  if (!q.trim()) return true;
  const needle = q.toLowerCase();
  return fields.some((f) => f.toLowerCase().includes(needle));
}

export function MyBookingsPage() {
  const [tab, setTab] = useState<BookingTab>("upcoming");
  const [range, setRange] = useState<DateRangeId | null>(null);
  const [query, setQuery] = useState("");

  const counts = {
    upcoming: mockUpcoming.length,
    completed: mockCompleted.length,
    cancelled: mockCancelled.length,
    rescheduled: mockRescheduled.length,
  };

  const upcoming = useMemo(
    () =>
      mockUpcoming.filter(
        (b) =>
          withinRange(b.dateISO, range) &&
          matchesQuery(query, b.shopName, b.service, b.id),
      ),
    [range, query],
  );
  const completed = useMemo(
    () =>
      mockCompleted.filter(
        (b) =>
          withinRange(b.dateISO, range) &&
          matchesQuery(query, b.shopName, b.service, b.id),
      ),
    [range, query],
  );
  const cancelled = useMemo(
    () =>
      mockCancelled.filter(
        (b) =>
          withinRange(b.dateISO, range) &&
          matchesQuery(query, b.shopName, b.service, b.id),
      ),
    [range, query],
  );
  const rescheduled = useMemo(
    () =>
      mockRescheduled.filter(
        (b) =>
          withinRange(b.dateISO, range) &&
          matchesQuery(query, b.shopName, b.service, b.id),
      ),
    [range, query],
  );

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-10">
        <header className="mb-6">
          <h1 className="text-2xl font-black sm:text-3xl">My Bookings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage upcoming visits, revisit past appointments, and rebook your favourites.
          </p>
        </header>

        <div className="mb-4 space-y-3">
          <OfflineBanner hint="Your bookings list may be out of date until you reconnect." />
          <OfflineSyncStatus type={TASK_CREATE_AND_CONFIRM_BOOKING} itemLabel="booking" />
        </div>

        <div className="space-y-5">
          <BookingTabBar active={tab} counts={counts} onChange={setTab} />
          <BookingFilterRow
            range={range}
            onRangeChange={setRange}
            query={query}
            onQueryChange={setQuery}
          />

          <div className="grid gap-4 md:grid-cols-2">
            {tab === "upcoming" &&
              (upcoming.length
                ? upcoming.map((b) => <UpcomingBookingCard key={b.id} booking={b} />)
                : null)}
            {tab === "completed" &&
              (completed.length
                ? completed.map((b) => <CompletedBookingCard key={b.id} booking={b} />)
                : null)}
            {tab === "cancelled" &&
              (cancelled.length
                ? cancelled.map((b) => <CancelledBookingCard key={b.id} booking={b} />)
                : null)}
            {tab === "rescheduled" &&
              (rescheduled.length
                ? rescheduled.map((b) => <UpcomingBookingCard key={b.id} booking={b} />)
                : null)}
          </div>

          {tab === "upcoming" && !upcoming.length && <BookingsEmptyState tab="upcoming" />}
          {tab === "completed" && !completed.length && <BookingsEmptyState tab="completed" />}
          {tab === "cancelled" && !cancelled.length && <BookingsEmptyState tab="cancelled" />}
          {tab === "rescheduled" && !rescheduled.length && (
            <BookingsEmptyState tab="rescheduled" />
          )}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

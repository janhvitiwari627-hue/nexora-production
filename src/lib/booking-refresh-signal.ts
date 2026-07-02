/**
 * Lightweight cross-component signal for "a booking's data is being
 * refreshed right now" — used to render a loading indicator on the
 * booking details page after an in-place confirmation update.
 *
 * Publisher: QueuedBookingsList (when a queued task flips to Confirmed
 * while the user is already on that booking's detail page).
 * Subscriber: BookingDetailPage via `useBookingRefreshing(id)`.
 */
import { useEffect, useState } from "react";

const EVENT_NAME = "nx:booking-refresh";

type Phase = "start" | "end";
type Detail = { id: string; phase: Phase };

export function emitBookingRefresh(id: string, phase: Phase) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<Detail>(EVENT_NAME, { detail: { id, phase } }),
  );
}

/** Fires start → auto-end after `minMs` OR when caller calls the returned fn. */
export function beginBookingRefresh(id: string, minMs = 900) {
  emitBookingRefresh(id, "start");
  let ended = false;
  const end = () => {
    if (ended) return;
    ended = true;
    emitBookingRefresh(id, "end");
  };
  setTimeout(end, minMs);
  return end;
}

/**
 * Returns true while a refresh for `bookingId` is in flight.
 * Safe on SSR (defaults to false).
 */
export function useBookingRefreshing(bookingId: string | undefined): boolean {
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (!bookingId || typeof window === "undefined") return;
    const onEvt = (e: Event) => {
      const ce = e as CustomEvent<Detail>;
      if (!ce.detail || ce.detail.id !== bookingId) return;
      setActive(ce.detail.phase === "start");
    };
    window.addEventListener(EVENT_NAME, onEvt as EventListener);
    return () => window.removeEventListener(EVENT_NAME, onEvt as EventListener);
  }, [bookingId]);
  return active;
}

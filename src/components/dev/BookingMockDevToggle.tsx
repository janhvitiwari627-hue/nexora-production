import { useEffect, useState } from "react";
import {
  resolveBookingAvailability,
  setBookingMock,
  type BookingMockState,
} from "@/lib/mock-booking-availability";

/**
 * Floating dev-only toggle for the mock booking-availability flag.
 * Lets us flip `/site/<slug>/book` between the real booking form and
 * the "Booking not enabled yet" screen for a given slug, without
 * editing URLs or opening devtools.
 *
 * The state is persisted per-slug in localStorage via
 * `mock-booking-availability`, so it survives navigation between the
 * template preview and the white-label booking route.
 */
export function BookingMockDevToggle({ slug }: { slug: string }) {
  const [state, setState] = useState<BookingMockState>("on");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setState(resolveBookingAvailability(slug));
  }, [slug]);

  if (!mounted) return null;

  const apply = (next: BookingMockState) => {
    setBookingMock(slug, next);
    setState(next);
  };

  const enabled = state === "on";

  return (
    <div
      role="group"
      aria-label="Mock booking availability"
      className="fixed right-3 bottom-3 z-[70] flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-3 py-1.5 text-xs shadow-lg backdrop-blur"
    >
      <span className="font-semibold text-slate-700">Booking mock</span>
      <span className="text-slate-400">·</span>
      <span className="max-w-[7rem] truncate text-slate-500" title={slug}>
        {slug}
      </span>
      <button
        type="button"
        onClick={() => apply(enabled ? "off" : "on")}
        aria-pressed={enabled}
        className={`ml-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold transition ${
          enabled
            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
            : "bg-rose-100 text-rose-800 hover:bg-rose-200"
        }`}
      >
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            enabled ? "bg-emerald-500" : "bg-rose-500"
          }`}
          aria-hidden
        />
        {enabled ? "Enabled" : "Disabled"}
      </button>
    </div>
  );
}

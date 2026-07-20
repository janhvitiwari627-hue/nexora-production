import { Clock } from "lucide-react";
import type { BookingState } from "./state";
import { selectedServices, subtotal, totalDuration, formatINR } from "./state";

export function SummarySidebar({
  booking,
  onPrimary,
  primaryLabel,
  primaryDisabled,
}: {
  booking: BookingState;
  onPrimary: () => void;
  primaryLabel: string;
  primaryDisabled?: boolean;
}) {
  const items = selectedServices(booking);
  const minutes = totalDuration(booking);
  return (
    <aside className="border-border bg-card sticky top-24 hidden h-fit w-full rounded-[var(--radius-card-lg)] border p-5 shadow-[var(--shadow-card)] lg:block">
      <h3 className="text-heading text-base font-bold">Your booking</h3>
      <p className="text-muted-foreground mt-0.5 text-xs">{booking.shopName}</p>

      <div className="mt-4 space-y-2 border-t border-border pt-4">
        {items.length === 0 ? (
          <p className="text-muted-foreground text-xs">No services selected yet.</p>
        ) : (
          items.map((s) => (
            <div key={s.id} className="flex items-start justify-between gap-3 text-sm">
              <span className="text-heading line-clamp-2">{s.name}</span>
              <span className="text-heading shrink-0 font-semibold">
                {formatINR(s.offer_price ?? s.price)}
              </span>
            </div>
          ))
        )}
      </div>

      {items.length > 0 && (
        <>
          <div className="text-muted-foreground mt-4 flex items-center gap-2 text-xs">
            <Clock className="h-3.5 w-3.5" /> Total duration: {minutes} min
          </div>
          <div className="border-border mt-3 flex items-center justify-between border-t pt-3">
            <span className="text-heading text-sm font-bold">Subtotal</span>
            <span className="text-heading text-lg font-black">{formatINR(subtotal(booking))}</span>
          </div>
        </>
      )}

      <button
        type="button"
        onClick={onPrimary}
        disabled={primaryDisabled}
        className="bg-gradient-cta text-primary-foreground mt-5 inline-flex w-full items-center justify-center rounded-[var(--radius-button)] px-4 py-3 text-sm font-bold shadow-[var(--shadow-glow)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {primaryLabel}
      </button>
    </aside>
  );
}

export function SummaryStickyBar({
  booking,
  onPrimary,
  primaryLabel,
  primaryDisabled,
}: {
  booking: BookingState;
  onPrimary: () => void;
  primaryLabel: string;
  primaryDisabled?: boolean;
}) {
  const items = selectedServices(booking);
  return (
    <div className="border-border bg-card/95 fixed inset-x-0 bottom-0 z-40 border-t p-3 shadow-[0_-8px_24px_rgba(10,37,64,0.08)] backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
        <div>
          <div className="text-muted-foreground text-[10px] uppercase tracking-wider">
            {items.length} selected · {totalDuration(booking)} min
          </div>
          <div className="text-heading text-lg font-black">{formatINR(subtotal(booking))}</div>
        </div>
        <button
          type="button"
          onClick={onPrimary}
          disabled={primaryDisabled}
          className="bg-gradient-cta text-primary-foreground inline-flex flex-1 items-center justify-center rounded-[var(--radius-button)] px-5 py-3 text-sm font-bold shadow-[var(--shadow-glow)] disabled:opacity-50"
        >
          {primaryLabel}
        </button>
      </div>
    </div>
  );
}

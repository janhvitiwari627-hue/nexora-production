import { Calendar, Sparkles, Tag } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { CouponCodeDisplay } from "./CouponCodeDisplay";
import type { Coupon } from "./mockOffers";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const daysLeft = (iso: string) =>
  Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);

export function CouponCard({ coupon }: { coupon: Coupon }) {
  const expired = coupon.category === "expired";
  const days = daysLeft(coupon.expiresAt);
  const urgent = !expired && days <= 7;

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border bg-card shadow-sm transition ${
        expired
          ? "opacity-60 border-border"
          : "border-border hover:shadow-md hover:-translate-y-0.5"
      }`}
    >
      {/* Ticket notches */}
      <span className="absolute -left-2 top-1/2 -translate-y-1/2 size-4 rounded-full bg-background border border-border" />
      <span className="absolute -right-2 top-1/2 -translate-y-1/2 size-4 rounded-full bg-background border border-border" />

      <div className="flex flex-col sm:flex-row">
        {/* Left badge strip */}
        <div className="flex sm:flex-col items-center justify-center gap-1 bg-gradient-to-br from-primary to-indigo-500 text-primary-foreground px-4 py-3 sm:w-32">
          <Sparkles className="size-4" aria-hidden />
          <div className="text-lg sm:text-xl font-bold leading-tight text-center">
            {coupon.discountLabel}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-foreground">{coupon.title}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {coupon.description}
              </p>
            </div>
            {urgent && (
              <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 px-2 py-0.5 rounded-full">
                {days <= 1 ? "Last day" : `${days}d left`}
              </span>
            )}
          </div>

          <CouponCodeDisplay code={coupon.code} disabled={expired} />

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="size-3.5" />
              {expired ? "Expired" : "Valid till"} {fmtDate(coupon.expiresAt)}
            </span>
            {coupon.minOrder && (
              <span className="inline-flex items-center gap-1">
                <Tag className="size-3.5" />
                Min ₹{coupon.minOrder}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {coupon.applicableServices.slice(0, 4).map((s) => (
              <span
                key={s}
                className="text-[11px] bg-muted text-foreground/80 px-2 py-0.5 rounded-md"
              >
                {s}
              </span>
            ))}
          </div>

          <div className="pt-1">
            {expired ? (
              <button
                disabled
                className="w-full sm:w-auto text-sm font-medium px-4 py-2 rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
              >
                Offer Expired
              </button>
            ) : (
              <Link
                to="/dashboard/bookings"
                className="inline-flex w-full sm:w-auto justify-center text-sm font-medium px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition"
              >
                Apply to Booking
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

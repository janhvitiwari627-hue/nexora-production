import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  CreditCard,
  Gift,
  QrCode,
  ShieldCheck,
  Smartphone,
  Tag,
  Upload,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  advancePayable,
  couponDiscount,
  formatINR,
  grandTotal,
  PLATFORM_FEE,
  rewardsDiscount,
  selectedServices,
  subtotal,
  VALID_COUPONS,
  type BookingState,
  type PaymentMethod,
} from "./state";


export function Step4Payment({
  booking,
  setCoupon,
  applyCoupon,
  removeCoupon,
  toggleRewards,
  setMethod,
  onPay,
}: {
  booking: BookingState;
  setCoupon: (v: string) => void;
  applyCoupon: () => void;
  removeCoupon: () => void;
  toggleRewards: () => void;
  setMethod: (m: PaymentMethod) => void;
  onPay: () => void;
}) {
  const [couponError, setCouponError] = useState<string | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const items = selectedServices(booking);


  const handleApply = () => {
    const code = booking.coupon.trim().toUpperCase();
    if (!code) return setCouponError("Enter a coupon code");
    if (!VALID_COUPONS[code]) return setCouponError("Invalid or expired code");
    setCouponError(null);
    applyCoupon();
  };

  const total = grandTotal(booking);
  const advance = advancePayable(booking);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <header>
          <h2 className="text-heading text-2xl font-black md:text-3xl">Review & pay</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Pay {Math.round((advance / Math.max(1, total)) * 100)}% advance to confirm. Rest at the salon.
          </p>
        </header>

        {/* Summary card */}
        <section className="border-border bg-card rounded-[var(--radius-card-lg)] border p-5">
          <h3 className="text-heading mb-3 text-sm font-bold uppercase tracking-wider">Booking</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Detail label="Salon" value={booking.shopName} />
            <Detail
              label="Stylist"
              value={
                booking.selectedStaffId
                  ? booking.staff.find((s) => s.id === booking.selectedStaffId)?.name ?? ""
                  : "Any available"
              }
            />
            <Detail label="Date" value={booking.date ?? "—"} />
            <Detail label="Time" value={booking.time ?? "—"} />
          </div>
          <div className="mt-4 border-t border-border pt-3">
            {items.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-1 text-sm">
                <span className="text-heading">
                  {s.name}{" "}
                  <span className="text-muted-foreground text-xs">({s.duration_minutes}m)</span>
                </span>
                <span className="text-heading font-semibold">
                  {formatINR(s.offer_price ?? s.price)}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Coupon */}
        <section className="border-border bg-card rounded-[var(--radius-card-lg)] border p-5">
          <h3 className="text-heading mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
            <Tag className="h-4 w-4" /> Coupon
          </h3>
          {booking.couponApplied ? (
            <div className="bg-success/10 text-success flex items-center justify-between rounded-[var(--radius-button)] px-3 py-2.5 text-sm font-semibold">
              <span className="inline-flex items-center gap-2">
                <Check className="h-4 w-4" />{booking.couponApplied.code} applied · {Math.round(booking.couponApplied.discount * 100)}% off
              </span>
              <button
                type="button"
                onClick={removeCoupon}
                aria-label="Remove coupon"
                className="hover:bg-success/15 grid h-7 w-7 place-items-center rounded-full"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-stretch gap-2">
              <input
                value={booking.coupon}
                onChange={(e) => {
                  setCoupon(e.target.value);
                  setCouponError(null);
                }}
                placeholder="Enter code (e.g. FIRST20)"
                maxLength={32}
                className="border-border bg-background placeholder:text-muted-foreground w-full rounded-[var(--radius-button)] border px-3 py-2 text-sm uppercase outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={handleApply}
                className="border-primary text-primary hover:bg-primary/5 rounded-[var(--radius-button)] border px-4 text-sm font-bold"
              >
                Apply
              </button>
            </div>
          )}
          {couponError && <p className="text-danger mt-2 text-xs font-semibold">{couponError}</p>}
        </section>

        {/* Rewards */}
        <section className="border-border bg-card flex items-center justify-between gap-3 rounded-[var(--radius-card-lg)] border p-5">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-gold grid h-10 w-10 place-items-center rounded-xl text-heading">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <div className="text-heading text-sm font-bold">Use reward points</div>
              <div className="text-muted-foreground text-xs">
                Balance: {booking.rewardBalance} pts ·{" "}
                {booking.useRewards
                  ? `Saving ${formatINR(rewardsDiscount(booking))}`
                  : `Save up to ${formatINR(Math.floor(subtotal(booking) * 0.1))}`}
              </div>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={booking.useRewards}
            onClick={toggleRewards}
            className={cn(
              "relative h-7 w-12 rounded-full transition",
              booking.useRewards ? "bg-primary" : "bg-muted",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition",
                booking.useRewards ? "right-0.5" : "left-0.5",
              )}
            />
          </button>
        </section>

        {/* Payment method */}
        <section className="border-border bg-card rounded-[var(--radius-card-lg)] border p-5">
          <h3 className="text-heading mb-3 text-sm font-bold uppercase tracking-wider">
            Payment method
          </h3>
          <div className="grid gap-2 md:grid-cols-3">
            {(
              [
                { id: "upi", label: "UPI", icon: Smartphone, sub: "GPay · PhonePe · Paytm" },
                { id: "qr", label: "Scan QR", icon: QrCode, sub: "Any UPI app" },
                { id: "card", label: "Card", icon: CreditCard, sub: "Visa · Mastercard · Rupay" },
              ] as const
            ).map(({ id, label, icon: Icon, sub }) => {
              const checked = booking.paymentMethod === id;
              return (
                <label
                  key={id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-[var(--radius-card)] border p-3 transition",
                    checked
                      ? "border-primary bg-primary/5 shadow-[var(--shadow-glow)]"
                      : "border-border hover:border-primary/40",
                  )}
                >
                  <input
                    type="radio"
                    name="paymethod"
                    className="sr-only"
                    checked={checked}
                    onChange={() => setMethod(id)}
                  />
                  <Icon className="text-primary h-5 w-5" />
                  <div className="flex-1">
                    <div className="text-heading text-sm font-bold">{label}</div>
                    <div className="text-muted-foreground text-[11px]">{sub}</div>
                  </div>
                  <span
                    className={cn(
                      "grid h-5 w-5 place-items-center rounded-full border-2",
                      checked ? "border-primary" : "border-muted-foreground/40",
                    )}
                  >
                    {checked && <span className="bg-primary h-2.5 w-2.5 rounded-full" />}
                  </span>
                </label>
              );
            })}
          </div>
        </section>

        <p className="text-muted-foreground text-xs">
          By proceeding you agree to free cancellation up to 4 hours before your slot. Within 4 hours,
          the 25% advance is non-refundable.
        </p>
      </div>

      {/* Pricing breakdown */}
      <aside className="border-border bg-card h-fit rounded-[var(--radius-card-lg)] border p-5 shadow-[var(--shadow-card)] lg:sticky lg:top-24">
        <h3 className="text-heading mb-4 text-base font-bold">Pricing</h3>
        <Row label="Subtotal" value={formatINR(subtotal(booking))} />
        <Row label="Platform fee" value={formatINR(PLATFORM_FEE)} />
        {couponDiscount(booking) > 0 && (
          <Row
            label={`Coupon (${booking.couponApplied?.code})`}
            value={`− ${formatINR(couponDiscount(booking))}`}
            tone="success"
          />
        )}
        {rewardsDiscount(booking) > 0 && (
          <Row
            label="Rewards"
            value={`− ${formatINR(rewardsDiscount(booking))}`}
            tone="success"
          />
        )}
        <div className="border-border my-3 border-t" />
        <Row label="Total" value={formatINR(total)} bold />
        <Row label="Pay now (25% advance)" value={formatINR(advance)} bold tone="primary" />
        <Row
          label="Pay at salon"
          value={formatINR(total - advance)}
          muted
        />

        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={onPay}
          className="bg-gradient-cta text-primary-foreground mt-5 inline-flex w-full items-center justify-center rounded-[var(--radius-button)] px-4 py-3.5 text-sm font-bold shadow-[var(--shadow-glow)] hover:brightness-110"
        >
          Pay {formatINR(advance)} to confirm
        </motion.button>
        <p className="text-muted-foreground mt-3 inline-flex items-center gap-1.5 text-[11px]">
          <ShieldCheck className="text-success h-3.5 w-3.5" /> 256-bit secure payment
        </p>
      </aside>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-muted-foreground text-[11px] uppercase tracking-wider">{label}</div>
      <div className="text-heading font-semibold">{value}</div>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  muted,
  tone,
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
  tone?: "primary" | "success";
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-1 text-sm",
        muted && "text-muted-foreground",
      )}
    >
      <span className={cn(bold && "text-heading font-bold")}>{label}</span>
      <span
        className={cn(
          bold && "text-heading font-black",
          tone === "primary" && "text-primary font-black",
          tone === "success" && "text-success font-bold",
        )}
      >
        {value}
      </span>
    </div>
  );
}

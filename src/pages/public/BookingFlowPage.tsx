import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { MOCK_SHOP } from "./shop/mockShop";
import { StepProgressIndicator, type BookingStepIndex } from "./booking/StepProgressIndicator";
import { Step1Services } from "./booking/Step1Services";
import { Step2Staff } from "./booking/Step2Staff";
import { Step3DateTime } from "./booking/Step3DateTime";
import { Step4Payment } from "./booking/Step4Payment";
import { BookingConfirmationScreen } from "./booking/BookingConfirmationScreen";
import { SummarySidebar, SummaryStickyBar } from "./booking/Summary";
import {
  advancePayable,
  formatINR,
  selectedServices,
  VALID_COUPONS,
  type BookingState,
  type PaymentMethod,
} from "./booking/state";

function genBookingId() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let id = "NX-";
  for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

export function BookingFlowPage() {
  const shop = MOCK_SHOP;
  const allServices = useMemo(
    () => shop.service_categories.flatMap((c) => c.items),
    [shop.service_categories],
  );

  const [booking, setBooking] = useState<BookingState>({
    shopName: shop.name,
    shopAddress: shop.address,
    services: allServices,
    selectedServiceIds: [allServices[0]?.id].filter(Boolean) as string[],
    staff: shop.staff,
    selectedStaffId: null,
    date: null,
    time: null,
    coupon: "",
    couponApplied: null,
    useRewards: false,
    rewardBalance: 320,
    paymentMethod: "upi" as PaymentMethod,
  });
  const [step, setStep] = useState<BookingStepIndex>(0);
  const [confirmed, setConfirmed] = useState<string | null>(null);

  const stepValid: Record<BookingStepIndex, boolean> = {
    0: booking.selectedServiceIds.length > 0,
    1: true,
    2: !!booking.date && !!booking.time,
    3: true,
  };

  const goNext = () => {
    if (!stepValid[step]) return;
    setStep((s) => (s < 3 ? ((s + 1) as BookingStepIndex) : s));
  };
  const goBack = () => setStep((s) => (s > 0 ? ((s - 1) as BookingStepIndex) : s));

  const primaryLabel =
    step === 0
      ? "Continue to staff"
      : step === 1
        ? "Continue to date & time"
        : step === 2
          ? "Continue to payment"
          : `Pay ${formatINR(advancePayable(booking))}`;

  const onPay = () => setConfirmed(genBookingId());

  if (confirmed) {
    return (
      <div className="min-h-screen bg-background px-4 md:px-6">
        <BookingConfirmationScreen booking={booking} bookingId={confirmed} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32 lg:pb-12">
      {/* Header */}
      <div className="border-border bg-card/95 sticky top-0 z-30 border-b backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4 md:px-6">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            className="text-muted-foreground hover:text-heading mb-3 inline-flex items-center gap-1 text-xs font-semibold disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <StepProgressIndicator active={step} />
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 md:px-6 md:py-10 lg:grid-cols-[1fr_320px]">
        <main className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3 }}
            >
              {step === 0 && (
                <Step1Services
                  booking={booking}
                  onToggle={(id) =>
                    setBooking((b) => {
                      const has = b.selectedServiceIds.includes(id);
                      return {
                        ...b,
                        selectedServiceIds: has
                          ? b.selectedServiceIds.filter((x) => x !== id)
                          : [...b.selectedServiceIds, id],
                      };
                    })
                  }
                />
              )}
              {step === 1 && (
                <Step2Staff
                  booking={booking}
                  onSelect={(id) => setBooking((b) => ({ ...b, selectedStaffId: id }))}
                />
              )}
              {step === 2 && (
                <Step3DateTime
                  date={booking.date}
                  time={booking.time}
                  onPickDate={(d) => setBooking((b) => ({ ...b, date: d, time: null }))}
                  onPickTime={(t) => setBooking((b) => ({ ...b, time: t }))}
                />
              )}
              {step === 3 && (
                <Step4Payment
                  booking={booking}
                  setCoupon={(v) => setBooking((b) => ({ ...b, coupon: v }))}
                  applyCoupon={() => {
                    const code = booking.coupon.trim().toUpperCase();
                    const pct = VALID_COUPONS[code];
                    if (!pct) return;
                    setBooking((b) => ({
                      ...b,
                      couponApplied: { code, discount: pct },
                    }));
                  }}
                  removeCoupon={() =>
                    setBooking((b) => ({ ...b, couponApplied: null, coupon: "" }))
                  }
                  toggleRewards={() => setBooking((b) => ({ ...b, useRewards: !b.useRewards }))}
                  setMethod={(m) => setBooking((b) => ({ ...b, paymentMethod: m }))}
                  onPay={onPay}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {step < 3 && (
          <SummarySidebar
            booking={booking}
            onPrimary={goNext}
            primaryLabel={primaryLabel}
            primaryDisabled={!stepValid[step]}
          />
        )}
      </div>

      {step < 3 && (
        <SummaryStickyBar
          booking={booking}
          onPrimary={goNext}
          primaryLabel={primaryLabel}
          primaryDisabled={!stepValid[step]}
        />
      )}
    </div>
  );
}

// keep helper exposed for future use
export { selectedServices };

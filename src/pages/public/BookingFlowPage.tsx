import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
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
import type { Service } from "@/components/shared/ServiceCard";
import type { Staff } from "@/components/shared/StaffCard";
import { createBooking, confirmBookingPayment } from "@/lib/bookings.functions";
import { PublicPageHeader } from "@/components/shared/PublicPageHeader";

export type RealSalonRef = {
  id: string;
  name: string;
  address: string;
  services: Service[];
  staff: Staff[];
};

function isUuid(s: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

export function BookingFlowPage({ salon }: { salon?: RealSalonRef } = {}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createFn = useServerFn(createBooking);
  const confirmFn = useServerFn(confirmBookingPayment);

  const shop = MOCK_SHOP;
  const allServices = useMemo<Service[]>(() => {
    if (salon && salon.services.length > 0) return salon.services;
    return shop.service_categories.flatMap((c) => c.items);
  }, [salon, shop.service_categories]);
  const allStaff = useMemo<Staff[]>(
    () => (salon && salon.staff.length > 0 ? salon.staff : shop.staff),
    [salon, shop.staff],
  );

  const [booking, setBooking] = useState<BookingState>({
    shopName: salon?.name ?? shop.name,
    shopAddress: salon?.address ?? shop.address,
    services: allServices,
    selectedServiceIds: [allServices[0]?.id].filter(Boolean) as string[],
    staff: allStaff,
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
  const [paying, setPaying] = useState(false);

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

  const payMutation = useMutation({
    mutationFn: async () => {
      if (!salon || !isUuid(salon.id)) {
        // Mock fallback — no real persistence
        await new Promise((r) => setTimeout(r, 600));
        return { id: `NX-${Math.random().toString(36).slice(2, 10).toUpperCase()}` };
      }
      if (!booking.date || !booking.time) throw new Error("Pick date & time");
      const selected = selectedServices(booking);
      if (selected.length === 0) throw new Error("Pick a service");
      const primary = selected[0];
      const totalPrice = selected.reduce(
        (sum, s) => sum + (s.offer_price ?? s.price),
        0,
      );
      const created = await createFn({
        data: {
          salon_id: salon.id,
          service_name: selected.map((s) => s.name).join(", ").slice(0, 200) || primary.name,
          price: totalPrice,
          booking_date: booking.date,
          booking_time: booking.time,
        },
      });
      const advance = Number((created as { advance_amount?: number }).advance_amount ?? totalPrice * 0.25);
      const confirmedRow = await confirmFn({
        data: {
          id: (created as { id: string }).id,
          amount_paid: advance,
          payment_reference: `MOCK-${Date.now()}`,
        },
      });
      return confirmedRow as { id: string };
    },
    onSuccess: (row) => {
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      setConfirmed(String((row as { id: string }).id));
    },
    onError: (err: Error) => {
      toast.error(err.message || "Payment failed");
      setPaying(false);
    },
  });

  const onPay = () => {
    if (paying) return;
    setPaying(true);
    payMutation.mutate(undefined, { onSettled: () => setPaying(false) });
  };

  if (confirmed) {
    return (
      <div className="min-h-screen bg-background px-4 md:px-6">
        <BookingConfirmationScreen booking={booking} bookingId={confirmed} />
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-background pb-32 lg:pb-12">
    <PublicPageHeader />
      {/* Header */}
      <div className="border-border bg-card/95 sticky top-0 z-30 border-b backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4 md:px-6">
          <button
            type="button"
            onClick={step === 0 ? () => navigate({ to: "/search" }) : goBack}
            className="text-muted-foreground hover:text-heading mb-3 inline-flex items-center gap-1 text-xs font-semibold"
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

export { selectedServices };

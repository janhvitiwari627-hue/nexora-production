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
import { createBooking } from "@/lib/bookings.functions";
import { createRazorpayAdvanceOrder, verifyRazorpayAdvance } from "@/lib/razorpay.functions";
import { PublicPageHeader } from "@/components/shared/PublicPageHeader";
import { OfflineBanner, OfflinePill } from "@/components/shared/OfflineBanner";
import { QueuedBookingsList } from "@/components/shared/QueuedBookingsList";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { enqueueCreateAndConfirmBooking } from "@/lib/booking-offline-sync";

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

type RazorpayCheckoutResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOrderPayload = {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  testMode: boolean;
};

async function openRazorpayCheckout(
  order: RazorpayOrderPayload,
  shopName: string,
): Promise<RazorpayCheckoutResponse> {
  if (typeof window === "undefined") throw new Error("Payment can only be opened in the app.");
  const razorpayWindow = window as typeof window & {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (
        event: string,
        callback: (response: { error?: { description?: string } }) => void,
      ) => void;
    };
  };
  if (!razorpayWindow.Razorpay) {
    await new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
      );
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener(
          "error",
          () => reject(new Error("Payment screen could not load.")),
          {
            once: true,
          },
        );
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Payment screen could not load."));
      document.head.appendChild(script);
    });
  }
  if (!razorpayWindow.Razorpay) throw new Error("Razorpay Checkout is unavailable.");

  return new Promise<RazorpayCheckoutResponse>((resolve, reject) => {
    let completed = false;
    const checkout = new razorpayWindow.Razorpay!({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: "Nexora Salons",
      description: `25% booking advance for ${shopName}`,
      order_id: order.orderId,
      image: "/nexora-final-logo.jpg",
      handler: (response: RazorpayCheckoutResponse) => {
        completed = true;
        resolve(response);
      },
      modal: {
        ondismiss: () => {
          if (!completed) reject(new Error("Payment was cancelled."));
        },
      },
      theme: { color: "#C79222" },
    });
    checkout.on("payment.failed", (response) => {
      if (!completed) reject(new Error(response.error?.description || "Payment failed."));
    });
    checkout.open();
  });
}

export function BookingFlowPage({ salon }: { salon?: RealSalonRef } = {}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createFn = useServerFn(createBooking);
  const createOrderFn = useServerFn(createRazorpayAdvanceOrder);
  const verifyPaymentFn = useServerFn(verifyRazorpayAdvance);
  const online = useOnlineStatus();

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
      const totalPrice = selected.reduce((sum, s) => sum + (s.offer_price ?? s.price), 0);
      const created = await createFn({
        data: {
          salon_id: salon.id,
          service_name:
            selected
              .map((s) => s.name)
              .join(", ")
              .slice(0, 200) || primary.name,
          price: totalPrice,
          booking_date: booking.date,
          booking_time: booking.time,
        },
      });
      const bookingId = (created as { id: string }).id;
      const order = (await createOrderFn({
        data: { bookingId },
      })) as RazorpayOrderPayload;
      const checkoutResult = await openRazorpayCheckout(order, booking.shopName);
      const verification = await verifyPaymentFn({
        data: {
          bookingId,
          razorpayOrderId: checkoutResult.razorpay_order_id,
          razorpayPaymentId: checkoutResult.razorpay_payment_id,
          razorpaySignature: checkoutResult.razorpay_signature,
        },
      });
      return (verification as { booking: { id: string } }).booking;
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
    if (!online) {
      // Queue for background sync when the connection returns.
      if (!salon || !isUuid(salon.id)) {
        toast.error("You're offline. Reconnect to complete this booking.");
        return;
      }
      if (!booking.date || !booking.time) {
        toast.error("Pick a date and time first.");
        return;
      }
      const selected = selectedServices(booking);
      if (selected.length === 0) {
        toast.error("Pick at least one service.");
        return;
      }
      const totalPrice = selected.reduce((sum, s) => sum + (s.offer_price ?? s.price), 0);
      enqueueCreateAndConfirmBooking({
        salon_id: salon.id,
        service_name:
          selected
            .map((s) => s.name)
            .join(", ")
            .slice(0, 200) || selected[0].name,
        price: totalPrice,
        booking_date: booking.date,
        booking_time: booking.time,
        advance_amount: Math.round(totalPrice * 0.25 * 100) / 100,
        shop_name: booking.shopName,
      });
      toast.success(
        "Saved offline — we'll confirm your booking automatically once you're back online.",
      );
      return;
    }
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
          <div className="mb-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={step === 0 ? () => navigate({ to: "/search" }) : goBack}
              className="text-muted-foreground hover:text-heading inline-flex items-center gap-1 text-xs font-semibold"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            <OfflinePill />
          </div>
          <StepProgressIndicator active={step} />
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-3 px-4 pt-4 md:px-6">
        <OfflineBanner
          message={
            step === 3
              ? "You're offline — we'll save your booking and confirm it when you're back"
              : "You're offline — keep going, we'll finish the booking once you're back online"
          }
          hint={
            step === 3
              ? "Tap Pay to queue this booking. It syncs automatically the moment your connection returns."
              : "Selections are saved on this device. Staff availability updates when you reconnect."
          }
        />
        <QueuedBookingsList />
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

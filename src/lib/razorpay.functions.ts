import { createHmac, timingSafeEqual } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  notes?: Record<string, string>;
};

type RazorpayPayment = {
  id: string;
  order_id: string | null;
  amount: number;
  currency: string;
  status: string;
  captured: boolean;
  method?: string;
};

type RazorpayQr = {
  id: string;
  image_url: string;
  image_content?: string;
  close_by?: number;
};

const BookingInput = z.object({ bookingId: z.string().uuid() });

function credentials() {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!keyId || !keySecret) throw new Error("Razorpay is not configured on the server.");
  return { keyId, keySecret };
}

async function requestRazorpay<T>(path: string, init?: RequestInit): Promise<T> {
  const { keyId, keySecret } = credentials();
  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const payload = (await response.json().catch(() => ({}))) as T & {
    error?: { description?: string };
  };
  if (!response.ok) {
    throw new Error(payload.error?.description || `Razorpay request failed (${response.status})`);
  }
  return payload;
}

function secureEqual(left: string, right: string) {
  const a = Buffer.from(left, "utf8");
  const b = Buffer.from(right, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

export const createRazorpayAdvanceOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => BookingInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: booking, error } = await context.supabase
      .from("bookings")
      .select("id, user_id, advance_amount, payment_deadline, status, payment_status")
      .eq("id", data.bookingId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!booking) throw new Error("Booking not found.");
    if (booking.status === "confirmed" || booking.payment_status === "paid") {
      throw new Error("This booking advance is already paid.");
    }
    if (booking.status === "expired" || booking.status === "cancelled") {
      throw new Error("This booking is no longer active.");
    }
    if (booking.payment_deadline && new Date(booking.payment_deadline) < new Date()) {
      throw new Error("Payment window has expired. Please create the booking again.");
    }

    const amount = Math.round(Number(booking.advance_amount ?? 0) * 100);
    if (!Number.isSafeInteger(amount) || amount < 100) {
      throw new Error("The booking advance amount is invalid.");
    }
    const order = await requestRazorpay<RazorpayOrder>("/orders", {
      method: "POST",
      body: JSON.stringify({
        amount,
        currency: "INR",
        receipt: `nx_${booking.id.replaceAll("-", "").slice(0, 20)}_${Date.now()}`.slice(0, 40),
        notes: {
          booking_id: booking.id,
          customer_id: context.userId,
          payment_type: "ADVANCE",
        },
      }),
    });
    const { keyId } = credentials();
    return {
      keyId,
      orderId: order.id,
      bookingId: booking.id,
      amount: order.amount,
      currency: order.currency,
      testMode: keyId.startsWith("rzp_test_"),
    };
  });

export const verifyRazorpayAdvance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        bookingId: z.string().uuid(),
        razorpayOrderId: z.string().min(1).max(100),
        razorpayPaymentId: z.string().min(1).max(100),
        razorpaySignature: z.string().min(32).max(256),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, user_id, salon_id, advance_amount, status, payment_status")
      .eq("id", data.bookingId)
      .eq("user_id", userId)
      .maybeSingle();
    if (bookingError) throw new Error(bookingError.message);
    if (!booking) throw new Error("Booking not found.");

    const { data: existing } = await supabase
      .from("payments")
      .select("id, status, booking_id, razorpay_payment_id")
      .eq("customer_id", userId)
      .eq("razorpay_payment_id", data.razorpayPaymentId)
      .maybeSingle();
    if (existing?.status === "SUCCESS") {
      return { success: true, payment: existing, booking, alreadyProcessed: true };
    }

    const expectedSignature = createHmac("sha256", credentials().keySecret)
      .update(`${data.razorpayOrderId}|${data.razorpayPaymentId}`)
      .digest("hex");
    if (!secureEqual(expectedSignature, data.razorpaySignature)) {
      throw new Error("Payment verification failed.");
    }

    const [order, gatewayPayment] = await Promise.all([
      requestRazorpay<RazorpayOrder>(`/orders/${encodeURIComponent(data.razorpayOrderId)}`),
      requestRazorpay<RazorpayPayment>(`/payments/${encodeURIComponent(data.razorpayPaymentId)}`),
    ]);
    const expectedAmount = Math.round(Number(booking.advance_amount ?? 0) * 100);
    if (
      order.notes?.booking_id !== booking.id ||
      order.amount !== expectedAmount ||
      order.currency !== "INR" ||
      gatewayPayment.order_id !== order.id ||
      gatewayPayment.amount !== expectedAmount ||
      gatewayPayment.currency !== "INR"
    ) {
      throw new Error("Payment details do not match this booking.");
    }
    if (!gatewayPayment.captured || gatewayPayment.status !== "captured") {
      throw new Error("Payment is authorised but not captured yet. Please wait and try again.");
    }

    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        booking_id: booking.id,
        salon_id: booking.salon_id,
        customer_id: userId,
        amount: expectedAmount / 100,
        currency: "INR",
        payment_type: "ADVANCE",
        payment_method: gatewayPayment.method?.toUpperCase() ?? "RAZORPAY",
        razorpay_order_id: order.id,
        razorpay_payment_id: gatewayPayment.id,
        status: "SUCCESS",
        processed_at: new Date().toISOString(),
        gateway_response: { verified: true, captured: true, provider: "razorpay" },
      })
      .select()
      .single();
    if (paymentError) throw new Error(paymentError.message);

    const { data: confirmedBooking, error: confirmError } = await supabase
      .from("bookings")
      .update({ status: "confirmed", payment_status: "paid" })
      .eq("id", booking.id)
      .eq("user_id", userId)
      .select("*")
      .single();
    if (confirmError) throw new Error(confirmError.message);

    const cashback = Math.round(Number(payment.amount) * 0.02 * 100) / 100;
    if (cashback > 0) {
      await supabase.from("rewards_ledger").insert({
        customer_id: userId,
        payment_id: payment.id,
        reward_type: "CASHBACK",
        amount: cashback,
        percentage: 2,
        status: "EARNED",
        expires_at: new Date(Date.now() + 90 * 86_400_000).toISOString(),
      });
    }
    return { success: true, payment, booking: confirmedBooking };
  });

export const createRemainingPaymentQr = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => BookingInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: booking, error } = await context.supabase
      .from("bookings")
      .select("id, user_id, price, advance_amount, status, payment_status")
      .eq("id", data.bookingId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!booking) throw new Error("Booking not found.");
    if (booking.status !== "confirmed" || booking.payment_status !== "paid") {
      throw new Error("Pay the 25% advance before generating the remaining-payment QR.");
    }
    const amount = Math.round(
      Math.max(0, Number(booking.price ?? 0) - Number(booking.advance_amount ?? 0)) * 100,
    );
    if (amount < 100) throw new Error("No remaining payment is due.");

    const qr = await requestRazorpay<RazorpayQr>("/payments/qr_codes", {
      method: "POST",
      body: JSON.stringify({
        type: "upi_qr",
        name: `Nexora ${booking.id.slice(0, 8)}`,
        usage: "single_use",
        fixed_amount: true,
        payment_amount: amount,
        description: "Nexora booking remaining payment",
        close_by: Math.floor(Date.now() / 1000) + 30 * 60,
        notes: { booking_id: booking.id, payment_type: "REMAINING" },
      }),
    });
    return {
      id: qr.id,
      imageUrl: qr.image_url,
      imageContent: qr.image_content ?? null,
      amount: amount / 100,
      expiresAt: qr.close_by ? new Date(qr.close_by * 1000).toISOString() : null,
      testMode: credentials().keyId.startsWith("rzp_test_"),
    };
  });

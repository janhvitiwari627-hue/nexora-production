import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// MOCK Razorpay credentials — replace via env when real keys are available
const MOCK_KEY_ID = process.env.RAZORPAY_KEY_ID ?? "rzp_test_mock_1234567890";

const randomId = (prefix: string) =>
  `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;

export const createPaymentOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      bookingId?: string;
      salonId?: string;
      amount: number;
      paymentType?: "ADVANCE" | "REMAINING" | "FULL" | "QR_PAYMENT";
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const orderId = randomId("order");
    const { data: payment, error } = await supabase
      .from("payments")
      .insert({
        booking_id: data.bookingId ?? null,
        salon_id: data.salonId ?? null,
        customer_id: userId,
        amount: data.amount,
        payment_type: data.paymentType ?? "ADVANCE",
        razorpay_order_id: orderId,
        status: "CREATED",
        gateway_response: { mock: true, key_id: MOCK_KEY_ID },
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return {
      keyId: MOCK_KEY_ID,
      orderId,
      paymentId: payment.id,
      amount: Math.round(data.amount * 100),
      currency: "INR",
      mock: true,
    };
  });

export const verifyPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      paymentId: string;
      razorpayPaymentId?: string;
      method?: string;
      simulateFailure?: boolean;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const rzpPaymentId = data.razorpayPaymentId ?? randomId("pay");
    const success = !data.simulateFailure;
    const { data: payment, error } = await supabase
      .from("payments")
      .update({
        razorpay_payment_id: rzpPaymentId,
        payment_method: data.method ?? "UPI",
        status: success ? "SUCCESS" : "FAILED",
        processed_at: new Date().toISOString(),
        gateway_response: { mock: true, verified: success },
        failure_reason: success ? null : "Mock failure",
      })
      .eq("id", data.paymentId)
      .select()
      .single();
    if (error) throw new Error(error.message);

    // Award 2% cashback on success
    if (success && payment.customer_id) {
      const cashback = Math.round(Number(payment.amount) * 0.02 * 100) / 100;
      await supabase.from("rewards_ledger").insert({
        customer_id: payment.customer_id,
        payment_id: payment.id,
        reward_type: "CASHBACK",
        amount: cashback,
        percentage: 2,
        status: "EARNED",
        expires_at: new Date(Date.now() + 90 * 86400_000).toISOString(),
      });
    }
    return { success, payment };
  });

export const generateQRPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { salonId: string; amount: number }) => input)
  .handler(async ({ data, context }) => {
    const code = `NXQR-${randomId("q").toUpperCase()}`;
    const { data: qr, error } = await context.supabase
      .from("qr_payments")
      .insert({
        salon_id: data.salonId,
        amount: data.amount,
        qr_code: code,
        status: "GENERATED",
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return qr;
  });

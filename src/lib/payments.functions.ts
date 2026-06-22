import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const MOCK_KEY_ID = process.env.RAZORPAY_KEY_ID ?? "rzp_test_mock_1234567890";

const randomId = (prefix: string) =>
  `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;

// ---------- Razorpay (mock) order + verify ----------

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

// ---------- QR Payment ----------

export const generateQRPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { salonId: string; amount?: number }) => input)
  .handler(async ({ data, context }) => {
    const code = `NXQR-${randomId("q").toUpperCase()}`;
    const { data: qr, error } = await context.supabase
      .from("qr_payments")
      .insert({
        salon_id: data.salonId,
        amount: data.amount ?? null,
        qr_code: code,
        status: "GENERATED",
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return qr;
  });

export const scanQRPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { qrCode: string; amount: number; method?: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: qr, error: qrErr } = await supabase
      .from("qr_payments")
      .select("*")
      .eq("qr_code", data.qrCode)
      .single();
    if (qrErr || !qr) throw new Error("Invalid QR code");
    if (qr.status === "PAID") throw new Error("QR already used");
    if (qr.expires_at && new Date(qr.expires_at) < new Date())
      throw new Error("QR expired");

    // Create payment + mark as SUCCESS (mock)
    const orderId = randomId("order");
    const rzpPaymentId = randomId("pay");
    const { data: payment, error: pErr } = await supabase
      .from("payments")
      .insert({
        salon_id: qr.salon_id,
        customer_id: userId,
        amount: data.amount,
        payment_type: "QR_PAYMENT",
        payment_method: data.method ?? "UPI",
        razorpay_order_id: orderId,
        razorpay_payment_id: rzpPaymentId,
        status: "SUCCESS",
        processed_at: new Date().toISOString(),
        gateway_response: { mock: true, qr_code: data.qrCode },
      })
      .select()
      .single();
    if (pErr) throw new Error(pErr.message);

    await supabase
      .from("qr_payments")
      .update({ status: "PAID", payment_id: payment.id, customer_id: userId })
      .eq("id", qr.id);

    // 2% cashback
    const cashback = Math.round(Number(payment.amount) * 0.02 * 100) / 100;
    await supabase.from("rewards_ledger").insert({
      customer_id: userId,
      payment_id: payment.id,
      reward_type: "CASHBACK",
      amount: cashback,
      percentage: 2,
      status: "EARNED",
      expires_at: new Date(Date.now() + 90 * 86400_000).toISOString(),
    });

    return { payment, cashback };
  });

// ---------- Wallet / Withdrawals ----------

export const getSalonWallet = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { salonId: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: wallet } = await supabase
      .from("salon_wallets")
      .select("*")
      .eq("salon_id", data.salonId)
      .maybeSingle();
    const { data: txs } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("salon_id", data.salonId)
      .order("created_at", { ascending: false })
      .limit(50);
    const { data: withdrawals } = await supabase
      .from("withdrawals")
      .select("*")
      .eq("salon_id", data.salonId)
      .order("created_at", { ascending: false })
      .limit(20);
    return { wallet, transactions: txs ?? [], withdrawals: withdrawals ?? [] };
  });

export const requestWithdrawal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      salonId: string;
      amount: number;
      bank: { accountName: string; accountNumber: string; ifsc: string };
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const { data: id, error } = await context.supabase.rpc("request_withdrawal", {
      _salon_id: data.salonId,
      _amount: data.amount,
      _bank: data.bank,
    });
    if (error) throw new Error(error.message);
    return { withdrawalId: id };
  });

// ---------- Escrow release (manual trigger by salon owner on booking completion) ----------

export const releaseBookingEscrow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { bookingId: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: booking, error: bErr } = await supabase
      .from("bookings")
      .select("id, salon_id, status")
      .eq("id", data.bookingId)
      .single();
    if (bErr || !booking) throw new Error("Booking not found");

    const { data: isOwner } = await supabase.rpc("is_salon_owner", {
      _user_id: userId,
      _salon_id: booking.salon_id,
    });
    if (!isOwner) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: payments } = await supabaseAdmin
      .from("payments")
      .select("id")
      .eq("booking_id", data.bookingId)
      .eq("status", "SUCCESS")
      .eq("released_to_wallet", false);

    const results: unknown[] = [];
    for (const p of payments ?? []) {
      const { data: r, error } = await supabaseAdmin.rpc("release_payment_to_wallet", {
        _payment_id: p.id,
      });
      if (!error) results.push(r);
    }
    return { released: results.length, results };
  });

// ---------- Financial analytics ----------

export const getSalonFinancials = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { salonId: string; days?: number }) => input)
  .handler(async ({ data, context }) => {
    const since = new Date(Date.now() - (data.days ?? 30) * 86400_000).toISOString();
    const { data: pays } = await context.supabase
      .from("payments")
      .select("amount, status, payment_method, payment_type, created_at")
      .eq("salon_id", data.salonId)
      .gte("created_at", since);

    const list = pays ?? [];
    const success = list.filter((p) => p.status === "SUCCESS");
    const totalRevenue = success.reduce((s, p) => s + Number(p.amount), 0);
    const successRate = list.length ? (success.length / list.length) * 100 : 0;

    const byMethod: Record<string, number> = {};
    for (const p of success) {
      const m = p.payment_method ?? "OTHER";
      byMethod[m] = (byMethod[m] ?? 0) + Number(p.amount);
    }
    const byDay: Record<string, number> = {};
    for (const p of success) {
      const day = p.created_at.slice(0, 10);
      byDay[day] = (byDay[day] ?? 0) + Number(p.amount);
    }
    return {
      totalRevenue,
      transactionCount: list.length,
      successCount: success.length,
      successRate: Math.round(successRate * 10) / 10,
      byMethod,
      byDay,
    };
  });

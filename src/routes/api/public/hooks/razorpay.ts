import { createHmac, timingSafeEqual } from "node:crypto";
import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type PaymentEntity = {
  id: string;
  order_id: string | null;
  amount: number;
  currency: string;
  status: string;
  captured: boolean;
  method?: string;
};

type QrEntity = {
  id: string;
  notes?: { booking_id?: string; payment_type?: string };
};

type OrderEntity = {
  id: string;
  amount: number;
  currency: string;
  notes?: { booking_id?: string; customer_id?: string };
};

type RazorpayEvent = {
  event: string;
  payload?: {
    payment?: { entity?: PaymentEntity };
    qr_code?: { entity?: QrEntity };
  };
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function signatureMatches(rawBody: string, received: string, secret: string) {
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(received, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

export const Route = createFileRoute("/api/public/hooks/razorpay")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
        const supabaseUrl = process.env.SUPABASE_URL?.trim();
        const supabaseSecret = (
          process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
        )?.trim();
        const razorpayKeyId = process.env.RAZORPAY_KEY_ID?.trim();
        const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
        if (
          !webhookSecret ||
          !supabaseUrl ||
          !supabaseSecret ||
          !razorpayKeyId ||
          !razorpayKeySecret
        ) {
          console.error("[razorpay-webhook] Missing server secrets");
          return json({ error: "Webhook is not configured" }, 503);
        }

        const rawBody = await request.text();
        const signature = request.headers.get("x-razorpay-signature") ?? "";
        if (!signature || !signatureMatches(rawBody, signature, webhookSecret)) {
          return json({ error: "Invalid signature" }, 401);
        }

        let event: RazorpayEvent;
        try {
          event = JSON.parse(rawBody) as RazorpayEvent;
        } catch {
          return json({ error: "Invalid JSON" }, 400);
        }
        if (!event.event) return json({ error: "Missing event" }, 400);

        const supabase = createClient<Database>(supabaseUrl, supabaseSecret, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const gatewayPayment = event.payload?.payment?.entity;

        if (
          gatewayPayment &&
          (event.event === "payment.captured" || event.event === "order.paid")
        ) {
          const { data: existing } = await supabase
            .from("payments")
            .select("id, status")
            .eq("razorpay_payment_id", gatewayPayment.id)
            .maybeSingle();
          if (existing) return json({ received: true, duplicate: true });

          if (
            !gatewayPayment.order_id ||
            !gatewayPayment.captured ||
            gatewayPayment.status !== "captured"
          ) {
            return json({ received: true, ignored: true });
          }

          const orderHttp = await fetch(
            `https://api.razorpay.com/v1/orders/${encodeURIComponent(gatewayPayment.order_id)}`,
            {
              headers: {
                Authorization: `Basic ${Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString("base64")}`,
              },
            },
          );
          if (!orderHttp.ok) return json({ error: "Could not verify order" }, 502);
          const order = (await orderHttp.json()) as OrderEntity;
          const bookingId = order.notes?.booking_id;
          if (!bookingId || order.amount !== gatewayPayment.amount || order.currency !== "INR") {
            return json({ received: true, ignored: true });
          }
          const { data: booking } = await supabase
            .from("bookings")
            .select("id, user_id, salon_id, advance_amount")
            .eq("id", bookingId)
            .maybeSingle();
          if (!booking || Math.round(Number(booking.advance_amount ?? 0) * 100) !== order.amount) {
            return json({ received: true, ignored: true });
          }
          const { data: payment, error: insertError } = await supabase
            .from("payments")
            .insert({
              booking_id: booking.id,
              salon_id: booking.salon_id,
              customer_id: booking.user_id,
              amount: order.amount / 100,
              currency: "INR",
              payment_type: "ADVANCE",
              payment_method: gatewayPayment.method?.toUpperCase() ?? "RAZORPAY",
              razorpay_order_id: order.id,
              razorpay_payment_id: gatewayPayment.id,
              status: "SUCCESS",
              processed_at: new Date().toISOString(),
              gateway_response: { verified_webhook: true, event: event.event },
            })
            .select("id")
            .single();
          if (insertError) {
            console.error("[razorpay-webhook] Payment insert failed", insertError.code);
            return json({ error: "Payment persistence failed" }, 500);
          }
          await supabase
            .from("bookings")
            .update({ status: "confirmed", payment_status: "paid" })
            .eq("id", booking.id);
          if (payment) {
            const cashback = Math.round((order.amount / 100) * 0.02 * 100) / 100;
            if (cashback > 0) {
              await supabase.from("rewards_ledger").insert({
                customer_id: booking.user_id,
                payment_id: payment.id,
                reward_type: "CASHBACK",
                amount: cashback,
                percentage: 2,
                status: "EARNED",
                expires_at: new Date(Date.now() + 90 * 86_400_000).toISOString(),
              });
            }
          }
        }

        if (gatewayPayment && event.event === "qr_code.credited") {
          const qr = event.payload?.qr_code?.entity;
          const bookingId = qr?.notes?.booking_id;
          if (!qr || !bookingId || !gatewayPayment.captured || gatewayPayment.currency !== "INR") {
            return json({ received: true, ignored: true });
          }
          const { data: existing } = await supabase
            .from("payments")
            .select("id")
            .eq("razorpay_payment_id", gatewayPayment.id)
            .maybeSingle();
          if (existing) return json({ received: true, duplicate: true });

          const { data: booking, error } = await supabase
            .from("bookings")
            .select("id, user_id, salon_id, price, advance_amount")
            .eq("id", bookingId)
            .maybeSingle();
          if (error || !booking) return json({ received: true, ignored: true });
          const expectedAmount = Math.round(
            Math.max(0, Number(booking.price ?? 0) - Number(booking.advance_amount ?? 0)) * 100,
          );
          if (gatewayPayment.amount !== expectedAmount) {
            console.error("[razorpay-webhook] Remaining amount mismatch", booking.id);
            return json({ received: true, ignored: true });
          }
          await supabase.from("payments").insert({
            booking_id: booking.id,
            salon_id: booking.salon_id,
            customer_id: booking.user_id,
            amount: expectedAmount / 100,
            currency: "INR",
            payment_type: "REMAINING",
            payment_method: gatewayPayment.method?.toUpperCase() ?? "UPI",
            razorpay_payment_id: gatewayPayment.id,
            status: "SUCCESS",
            processed_at: new Date().toISOString(),
            gateway_response: {
              verified_webhook: true,
              event: event.event,
              razorpay_qr_id: qr.id,
            },
          });
        }

        return json({ received: true });
      },
    },
  },
});

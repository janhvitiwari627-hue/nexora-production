/**
 * Booking-specific offline queue setup.
 *
 * Registers runners for booking actions and exposes typed `enqueue*` helpers.
 * Import `initBookingOfflineSync()` once at app bootstrap.
 */
import { createBooking, confirmBookingPayment } from "@/lib/bookings.functions";
import { enqueue, initOfflineQueue, registerRunner } from "./offline-queue";

export const TASK_CREATE_AND_CONFIRM_BOOKING = "booking:create_and_confirm";
export const TASK_SUBMIT_QR_PAYMENT = "booking:qr_payment_submit";

export type CreateAndConfirmPayload = {
  salon_id: string;
  service_name: string;
  price: number;
  booking_date: string; // YYYY-MM-DD
  booking_time: string; // HH:mm
  advance_amount: number; // client estimate; server re-validates
  payment_reference?: string;
};

export type QrPaymentPayload = {
  amount: number;
  txnId: string;
  shopName: string;
  date: string | null;
  time: string | null;
  submittedAt: string;
};

let inited = false;

export function initBookingOfflineSync() {
  if (inited) return;
  inited = true;

  registerRunner<CreateAndConfirmPayload>(TASK_CREATE_AND_CONFIRM_BOOKING, async (p) => {
    const created = (await createBooking({
      data: {
        salon_id: p.salon_id,
        service_name: p.service_name,
        price: p.price,
        booking_date: p.booking_date,
        booking_time: p.booking_time,
      },
    })) as { id: string; advance_amount?: number };

    const advance = Number(created.advance_amount ?? p.advance_amount ?? p.price * 0.25);
    const confirmed = (await confirmBookingPayment({
      data: {
        id: created.id,
        amount_paid: advance,
        payment_reference: p.payment_reference ?? `OFFLINE-SYNC-${Date.now()}`,
      },
    })) as { id: string; booking_reference?: string };
    return {
      booking_id: confirmed.id,
      booking_reference: confirmed.booking_reference ?? null,
    };
  });

  // QR payment submissions are already persisted locally to `nx_pending_payments`
  // for admin review. There is no server endpoint yet, so this runner just
  // marks the local record as "queued_synced" once the network is back.
  registerRunner<QrPaymentPayload>(TASK_SUBMIT_QR_PAYMENT, async (p) => {
    try {
      const key = "nx_pending_payments";
      const list = JSON.parse(localStorage.getItem(key) || "[]") as Array<{
        txnId?: string;
        status?: string;
      }>;
      const idx = list.findIndex((x) => x.txnId === p.txnId);
      if (idx >= 0) {
        list[idx].status = "pending_admin_approval";
        localStorage.setItem(key, JSON.stringify(list));
      }
    } catch {
      // ignore
    }
  });

  initOfflineQueue();
}

export function enqueueCreateAndConfirmBooking(payload: CreateAndConfirmPayload) {
  return enqueue(TASK_CREATE_AND_CONFIRM_BOOKING, payload);
}

export function enqueueQrPaymentSubmission(payload: QrPaymentPayload) {
  return enqueue(TASK_SUBMIT_QR_PAYMENT, payload);
}

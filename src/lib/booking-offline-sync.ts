/**
 * Booking-specific offline queue setup.
 *
 * Registers runners for booking actions and exposes typed `enqueue*` helpers.
 * Import `initBookingOfflineSync()` once at app bootstrap.
 */
import { createBooking } from "@/lib/bookings.functions";
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
  /** Free-form label shown in queued-card UI while syncing. */
  shop_name?: string;
};

export type BookingSyncResult = {
  booking_id: string;
  booking_reference: string | null;
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

    return {
      booking_id: created.id,
      booking_reference: null,
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

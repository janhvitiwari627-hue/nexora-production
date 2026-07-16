/**
 * Local storage of "mock" appointment receipts so template/demo salons
 * (which don't exist in the DB) can still complete the full booking
 * flow — including the confirmation screen — without any server write.
 *
 * The receipts live in sessionStorage under a single key. They are only
 * meaningful in the tab where the appointment was created (matches the
 * "open on the same device" wording on the confirmation screen).
 */

export type MockBookingReceipt = {
  id: string;
  booking_reference: string;
  service_id: string;
  service_name: string;
  salon_slug: string;
  salon_name: string;
  staff_id: string | null;
  staff_name: string | null;
  booking_date: string;
  booking_time: string;
  price: number;
  advance_amount: number;
  remaining: number;
  created_at: string;
};

const KEY = "nexora:mock-bookings";

function readAll(): Record<string, MockBookingReceipt> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, MockBookingReceipt>) : {};
  } catch {
    return {};
  }
}

function writeAll(all: Record<string, MockBookingReceipt>) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // ignore quota / disabled storage
  }
}

function shortRef() {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `MB-${out}`;
}

export function createMockBooking(
  receipt: Omit<MockBookingReceipt, "id" | "booking_reference" | "created_at">,
): MockBookingReceipt {
  const id = `mockbk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const full: MockBookingReceipt = {
    ...receipt,
    id,
    booking_reference: shortRef(),
    created_at: new Date().toISOString(),
  };
  const all = readAll();
  all[id] = full;
  writeAll(all);
  return full;
}

export function getMockBooking(id: string | undefined | null): MockBookingReceipt | null {
  if (!id || !id.startsWith("mockbk_")) return null;
  return readAll()[id] ?? null;
}

export function isMockBookingId(id: string | undefined | null): boolean {
  return typeof id === "string" && id.startsWith("mockbk_");
}

// Centralised business rules for the Salon Owner side.
// Keep server functions and UI in sync by importing from here.

/** Platform commission rate (10%) deducted from gross booking revenue. */
export const PLATFORM_COMMISSION_RATE = 0.1;

/** Salon's share of gross revenue (90%). */
export const SALON_PAYOUT_RATE = 1 - PLATFORM_COMMISSION_RATE;

/** Minimum amount (INR) an owner can request as a withdrawal. */
export const MIN_WITHDRAWAL_AMOUNT = 100;

/** Hours an owner has to accept/reject a booking request before auto-rejection. */
export const BOOKING_RESPONSE_WINDOW_HOURS = 12;

/**
 * Split gross revenue into platform commission and salon payout.
 * Rounds to 2 decimals.
 */
export function splitRevenue(gross: number): {
  gross: number;
  commission: number;
  net: number;
} {
  const safe = Math.max(0, Number(gross) || 0);
  const commission = Math.round(safe * PLATFORM_COMMISSION_RATE * 100) / 100;
  const net = Math.round((safe - commission) * 100) / 100;
  return { gross: safe, commission, net };
}

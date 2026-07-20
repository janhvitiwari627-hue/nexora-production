/**
 * Mock booking-availability toggle.
 *
 * Lets us force the `/site/:slug/book` route into the
 * "Booking not enabled yet" state without touching the database.
 * Handy for demoing template previews and for e2e tests that need a
 * deterministic disabled state on real salon slugs.
 *
 * Precedence (highest first):
 *   1. URL search param `booking=off` / `booking=on`
 *   2. Per-slug localStorage entry `nexora:mock-booking:<slug>`
 *   3. Global localStorage entry `nexora:mock-booking:*`
 *   4. Default: enabled
 *
 * All storage access is guarded so it is safe during SSR.
 */
export type BookingMockState = "on" | "off";

const GLOBAL_KEY = "nexora:mock-booking:*";
const slugKey = (slug: string) => `nexora:mock-booking:${slug}`;

function readStorage(key: string): BookingMockState | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(key);
    return value === "on" || value === "off" ? value : null;
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: BookingMockState | null) {
  if (typeof window === "undefined") return;
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // ignore quota / disabled storage
  }
}

export function resolveBookingAvailability(
  slug: string,
  searchOverride?: BookingMockState,
): BookingMockState {
  if (searchOverride === "on" || searchOverride === "off") return searchOverride;
  return readStorage(slugKey(slug)) ?? readStorage(GLOBAL_KEY) ?? "on";
}

export function isBookingMockDisabled(slug: string, searchOverride?: BookingMockState): boolean {
  return resolveBookingAvailability(slug, searchOverride) === "off";
}

export function setBookingMock(slug: string, value: BookingMockState | null) {
  writeStorage(slugKey(slug), value);
}

export function setGlobalBookingMock(value: BookingMockState | null) {
  writeStorage(GLOBAL_KEY, value);
}

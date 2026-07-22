import { supabase } from "@/integrations/supabase/client";

const LOCATION_STORAGE_KEY = "nx_customer_location_v2";
const GEOCODE_CACHE_PREFIX = "nx_geocode_v1:";
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const GEOCODER_BASE_URL = (
  import.meta.env.VITE_GEOCODING_BASE_URL || "https://nominatim.openstreetmap.org"
).replace(/\/$/, "");

let lastGeocoderRequestAt = 0;

export interface CustomerLocation {
  latitude: number;
  longitude: number;
  label: string;
  displayName: string;
  block: string | null;
  city: string | null;
  district: string | null;
  state: string | null;
  pincode: string | null;
  country: string | null;
  capturedAt: string;
}

interface NominatimAddress {
  neighbourhood?: string;
  suburb?: string;
  quarter?: string;
  hamlet?: string;
  village?: string;
  town?: string;
  city?: string;
  municipality?: string;
  city_district?: string;
  state_district?: string;
  county?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: NominatimAddress;
}

function storageAvailable() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function validCoordinates(latitude: number, longitude: number) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function readCache(key: string): NominatimResult | NominatimResult[] | null {
  if (!storageAvailable()) return null;
  try {
    const value = JSON.parse(localStorage.getItem(`${GEOCODE_CACHE_PREFIX}${key}`) || "null") as {
      expiresAt?: number;
      data?: NominatimResult | NominatimResult[];
    } | null;
    if (!value?.data || !value.expiresAt || value.expiresAt < Date.now()) return null;
    return value.data;
  } catch {
    return null;
  }
}

function writeCache(key: string, data: NominatimResult | NominatimResult[]) {
  if (!storageAvailable()) return;
  try {
    localStorage.setItem(
      `${GEOCODE_CACHE_PREFIX}${key}`,
      JSON.stringify({ expiresAt: Date.now() + CACHE_TTL_MS, data }),
    );
  } catch {
    // Location still works when private browsing blocks local storage.
  }
}

async function respectPublicGeocoderRateLimit() {
  const waitMs = Math.max(0, 1_100 - (Date.now() - lastGeocoderRequestAt));
  if (waitMs > 0) await new Promise((resolve) => window.setTimeout(resolve, waitMs));
  lastGeocoderRequestAt = Date.now();
}

async function requestGeocoder(url: URL) {
  await respectPublicGeocoderRateLimit();
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    referrerPolicy: "strict-origin-when-cross-origin",
  });
  if (!response.ok) throw new Error("The address service is temporarily unavailable.");
  return response;
}

export function customerLocationFromResult(result: NominatimResult): CustomerLocation {
  const latitude = Number(result.lat);
  const longitude = Number(result.lon);
  if (!validCoordinates(latitude, longitude)) throw new Error("Invalid map coordinates.");

  const address = result.address ?? {};
  const block =
    address.neighbourhood ??
    address.suburb ??
    address.quarter ??
    address.city_district ??
    address.village ??
    address.hamlet ??
    null;
  const city = address.city ?? address.town ?? address.village ?? address.municipality ?? null;
  const district = address.state_district ?? address.county ?? null;
  const state = address.state ?? null;
  const labelParts = [block || city, district || state].filter(
    (part, index, parts) => part && parts.indexOf(part) === index,
  );

  return {
    latitude,
    longitude,
    label: labelParts.join(", ") || "Selected location",
    displayName: result.display_name || labelParts.join(", ") || "Selected location",
    block,
    city,
    district,
    state,
    pincode: address.postcode ?? null,
    country: address.country ?? "India",
    capturedAt: new Date().toISOString(),
  };
}

export async function reverseGeocodeLocation(latitude: number, longitude: number) {
  if (!validCoordinates(latitude, longitude)) throw new Error("Invalid map coordinates.");
  const cacheKey = `reverse:${latitude.toFixed(5)},${longitude.toFixed(5)}`;
  const cached = readCache(cacheKey);
  if (cached && !Array.isArray(cached)) return customerLocationFromResult(cached);

  const url = new URL(`${GEOCODER_BASE_URL}/reverse`);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(latitude));
  url.searchParams.set("lon", String(longitude));
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("zoom", "18");
  url.searchParams.set("accept-language", "en,hi");
  const response = await requestGeocoder(url);
  const result = (await response.json()) as NominatimResult;
  writeCache(cacheKey, result);
  return customerLocationFromResult(result);
}

export async function searchCustomerLocations(query: string) {
  const normalized = query.trim().replace(/\s+/g, " ").slice(0, 120);
  if (normalized.length < 3) throw new Error("Enter at least 3 characters.");
  const cacheKey = `search:${normalized.toLocaleLowerCase("en-IN")}`;
  const cached = readCache(cacheKey);
  if (Array.isArray(cached)) return cached.map(customerLocationFromResult);

  const url = new URL(`${GEOCODER_BASE_URL}/search`);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("q", normalized);
  url.searchParams.set("countrycodes", "in");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "5");
  url.searchParams.set("accept-language", "en,hi");
  const response = await requestGeocoder(url);
  const results = (await response.json()) as NominatimResult[];
  writeCache(cacheKey, results);
  return results.map(customerLocationFromResult);
}

export function readStoredCustomerLocation(): CustomerLocation | null {
  if (!storageAvailable()) return null;
  try {
    const location = JSON.parse(
      localStorage.getItem(LOCATION_STORAGE_KEY) || "null",
    ) as CustomerLocation | null;
    if (!location || !validCoordinates(location.latitude, location.longitude)) return null;
    return location;
  } catch {
    return null;
  }
}

export function customerLocationFromProfile(
  profile: {
    latitude?: number | null;
    longitude?: number | null;
    block?: string | null;
    city?: string | null;
    district?: string | null;
    state?: string | null;
    pincode?: string | null;
    country?: string | null;
    location_captured_at?: string | null;
  } | null,
): CustomerLocation | null {
  if (profile?.latitude == null || profile.longitude == null) return null;
  const latitude = Number(profile?.latitude);
  const longitude = Number(profile?.longitude);
  if (!validCoordinates(latitude, longitude)) return null;
  const labelParts = [profile?.block || profile?.city, profile?.district || profile?.state].filter(
    (part, index, parts) => part && parts.indexOf(part) === index,
  );
  return {
    latitude,
    longitude,
    label: labelParts.join(", ") || "Saved location",
    displayName: labelParts.join(", ") || "Saved location",
    block: profile?.block ?? null,
    city: profile?.city ?? null,
    district: profile?.district ?? null,
    state: profile?.state ?? null,
    pincode: profile?.pincode ?? null,
    country: profile?.country ?? "India",
    capturedAt: profile?.location_captured_at ?? new Date().toISOString(),
  };
}

export async function saveCustomerLocation(location: CustomerLocation) {
  if (!validCoordinates(location.latitude, location.longitude)) {
    throw new Error("Invalid map coordinates.");
  }
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Sign in to save your location.");

  const { error } = await supabase
    .from("profiles")
    .update({
      latitude: location.latitude,
      longitude: location.longitude,
      block: location.block,
      city: location.city,
      district: location.district,
      state: location.state,
      pincode: location.pincode,
      country: location.country,
      location_captured_at: location.capturedAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", data.user.id);
  if (error) throw error;

  if (storageAvailable()) localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
  return location;
}

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "user_location_v1";

export type UserLocation = {
  lat: number;
  lng: number;
  source: "gps" | "manual";
  label?: string;
  updatedAt: number;
};

function readStored(): UserLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UserLocation) : null;
  } catch {
    return null;
  }
}

function writeStored(loc: UserLocation | null) {
  if (typeof window === "undefined") return;
  if (loc) localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
  else localStorage.removeItem(STORAGE_KEY);
}

/**
 * Browser geolocation with manual fallback.
 * - GPS permission requested only on user gesture (call `requestGps`).
 * - Last known location cached in localStorage.
 * - `setManual({ lat, lng, label })` for city-picker fallback.
 */
export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "granted" | "denied" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLocation(readStored());
  }, []);

  const requestGps = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setStatus("error");
      setError("Geolocation not supported by this browser.");
      return;
    }
    setStatus("loading");
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next: UserLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          source: "gps",
          updatedAt: Date.now(),
        };
        writeStored(next);
        setLocation(next);
        setStatus("granted");
      },
      (err) => {
        setStatus(err.code === err.PERMISSION_DENIED ? "denied" : "error");
        setError(err.message);
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  }, []);

  const setManual = useCallback((input: { lat: number; lng: number; label?: string }) => {
    const next: UserLocation = { ...input, source: "manual", updatedAt: Date.now() };
    writeStored(next);
    setLocation(next);
    setStatus("granted");
  }, []);

  const clear = useCallback(() => {
    writeStored(null);
    setLocation(null);
    setStatus("idle");
  }, []);

  return { location, status, error, requestGps, setManual, clear };
}

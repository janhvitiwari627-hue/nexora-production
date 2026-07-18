import { useEffect, useState } from "react";

/**
 * Tracks the browser's online/offline connectivity state.
 * Safe for SSR — returns `true` on the server.
 */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState<boolean>(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    // Re-sync on visibility, in case the OS toggled while tab was hidden.
    const vis = () => setOnline(navigator.onLine);
    document.addEventListener("visibilitychange", vis);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
      document.removeEventListener("visibilitychange", vis);
    };
  }, []);

  return online;
}

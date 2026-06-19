/**
 * Detects environments where service workers / PWA installation should NOT run.
 * Mirrors the guard rules from the Lovable PWA skill.
 */
export function isPreviewOrDev(): boolean {
  if (typeof window === "undefined") return true;
  if (window.self !== window.top) return true; // iframe (Lovable preview)
  const h = window.location.hostname;
  if (h === "localhost" || h.startsWith("127.")) return true;
  if (h.startsWith("id-preview--") || h.startsWith("preview--")) return true;
  if (h === "lovableproject.com" || h.endsWith(".lovableproject.com")) return true;
  if (h === "lovableproject-dev.com" || h.endsWith(".lovableproject-dev.com")) return true;
  if (h === "beta.lovable.dev" || h.endsWith(".beta.lovable.dev")) return true;
  const url = new URL(window.location.href);
  if (url.searchParams.get("sw") === "off") return true;
  return false;
}

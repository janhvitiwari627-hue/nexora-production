export const PUBLIC_APP_ORIGIN = "https://nexora-final-last-app.lovable.app";

type AppLocation = Pick<Location, "hostname" | "origin">;

export function resolvePublicAppOrigin(location?: AppLocation): string {
  const current = location ?? (typeof window !== "undefined" ? window.location : undefined);
  if (!current) return PUBLIC_APP_ORIGIN;

  const hostname = current.hostname.toLowerCase();
  if (hostname === "localhost" || hostname.startsWith("127.")) {
    return current.origin;
  }

  const isTemporaryPreview =
    hostname.startsWith("id-preview--") ||
    hostname.startsWith("preview--") ||
    hostname === "lovableproject.com" ||
    hostname.endsWith(".lovableproject.com") ||
    hostname === "lovableproject-dev.com" ||
    hostname.endsWith(".lovableproject-dev.com") ||
    hostname === "beta.lovable.dev" ||
    hostname.endsWith(".beta.lovable.dev");

  return isTemporaryPreview ? PUBLIC_APP_ORIGIN : current.origin;
}

export function buildReferralSignupUrl(code: string, location?: AppLocation): string {
  return `${resolvePublicAppOrigin(location)}/signup?ref=${encodeURIComponent(code.trim())}`;
}

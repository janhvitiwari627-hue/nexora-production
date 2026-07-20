export const PUBLIC_APP_ORIGIN = "https://nexora-production.vercel.app";

type AppLocation = Pick<Location, "hostname" | "origin">;

export function resolvePublicAppOrigin(location?: AppLocation): string {
  const current = location ?? (typeof window !== "undefined" ? window.location : undefined);
  if (!current) return PUBLIC_APP_ORIGIN;

  const hostname = current.hostname.toLowerCase();
  if (hostname === "localhost" || hostname.startsWith("127.")) {
    return current.origin;
  }

  // Referral links are public marketing links. Always send recipients to the
  // canonical custom domain, even when the link is copied from a Lovable
  // preview or the lovable.app deployment.
  return PUBLIC_APP_ORIGIN;
}

export function buildReferralSignupUrl(code: string, location?: AppLocation): string {
  return `${resolvePublicAppOrigin(location)}/signup?ref=${encodeURIComponent(code.trim())}`;
}

export function buildPasswordRecoveryUrl(tokenHash: string): string {
  const url = new URL("/auth/callback", PUBLIC_APP_ORIGIN);
  url.searchParams.set("token_hash", tokenHash);
  url.searchParams.set("type", "recovery");
  url.searchParams.set("next", "/reset-password");
  return url.toString();
}

export function buildPasswordResetRedirectUrl(): string {
  return `${PUBLIC_APP_ORIGIN}/auth/callback?next=/reset-password`;
}

const LOGIN_INTENT_KEY = "nx_referral_welcome_login_intent";
const PENDING_KEY_PREFIX = "nx_referral_welcome_pending_";
const LOGIN_INTENT_TTL_MS = 15 * 60 * 1000;

function canUseSessionStorage() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

export function beginReferralWelcomeAfterAuth() {
  if (!canUseSessionStorage()) return;
  window.sessionStorage.setItem(LOGIN_INTENT_KEY, String(Date.now()));
}

export function cancelReferralWelcomeAfterAuth() {
  if (!canUseSessionStorage()) return;
  window.sessionStorage.removeItem(LOGIN_INTENT_KEY);
}

export function claimReferralWelcomeForUser(userId: string) {
  if (!canUseSessionStorage()) return false;
  const startedAt = Number(window.sessionStorage.getItem(LOGIN_INTENT_KEY));
  window.sessionStorage.removeItem(LOGIN_INTENT_KEY);
  if (!Number.isFinite(startedAt) || Date.now() - startedAt > LOGIN_INTENT_TTL_MS) return false;
  window.sessionStorage.setItem(`${PENDING_KEY_PREFIX}${userId}`, "1");
  return true;
}

export function hasPendingReferralWelcome(userId: string) {
  return (
    canUseSessionStorage() &&
    window.sessionStorage.getItem(`${PENDING_KEY_PREFIX}${userId}`) === "1"
  );
}

export function consumePendingReferralWelcome(userId: string) {
  if (!canUseSessionStorage()) return;
  window.sessionStorage.removeItem(`${PENDING_KEY_PREFIX}${userId}`);
}

export function buildReferralShareMessage({
  displayName,
  referralCode,
  referralLink,
}: {
  displayName: string;
  referralCode: string;
  referralLink: string;
}) {
  return [
    "✨ Welcome to Nexora Salons!",
    "",
    `${displayName} has invited you to discover trusted salons and book services with Nexora.`,
    "",
    "🎁 Your referral benefits:",
    "• Discover salons and book from your phone",
    "• Get up to ₹100 Nexora reward credit after an eligible first booking",
    "",
    `🤝 ${displayName} can also earn ₹100 reward credit when the referral qualifies.`,
    "",
    `Referral code: ${referralCode}`,
    `Join Nexora: ${referralLink}`,
    "",
    "Benefits are subject to Nexora referral eligibility and campaign terms.",
  ].join("\n");
}

export async function buildBrandedReferralShareData({
  displayName,
  referralCode,
  referralLink,
}: {
  displayName: string;
  referralCode: string;
  referralLink: string;
}): Promise<ShareData> {
  const text = buildReferralShareMessage({ displayName, referralCode, referralLink });
  const basicData: ShareData = {
    title: `${displayName} invited you to Nexora Salons`,
    text,
    url: referralLink,
  };

  if (typeof navigator === "undefined" || typeof navigator.canShare !== "function") {
    return basicData;
  }

  try {
    const response = await fetch("/nexora-final-logo.jpg", { cache: "force-cache" });
    if (!response.ok) return basicData;
    const blob = await response.blob();
    const logo = new File([blob], "nexora-salons.jpg", {
      type: blob.type || "image/jpeg",
    });
    if (!navigator.canShare({ files: [logo] })) return basicData;
    return { ...basicData, files: [logo] };
  } catch {
    return basicData;
  }
}

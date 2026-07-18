import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "sonner";
import {
  Copy,
  Check,
  Download,
  Share2,
  Link as LinkIcon,
  Users,
  Trophy,
  Wallet,
  Hourglass,
  MessageCircle,
  Sparkles,
  Gift,
  Send,
  Mail,
  Twitter,
  Facebook,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { MyReferralsSection } from "@/components/referral/MyReferralsSection";
import { useAuthStore } from "@/stores/authStore";
import { buildReferralSignupUrl } from "@/lib/public-app-url";
import {
  mockReferralCode,
  mockReferralLink,
  mockReferralStats,
  mockReferrals,
  type ReferralStatus,
} from "./referral/mockReferral";

const STATUS: Record<ReferralStatus, { label: string; classes: string }> = {
  joined: { label: "Joined", classes: "bg-sky-100 text-sky-700" },
  booked: { label: "Booked", classes: "bg-indigo-100 text-indigo-700" },
  rewarded: { label: "Rewarded", classes: "bg-emerald-100 text-emerald-700" },
  pending: { label: "Pending", classes: "bg-amber-100 text-amber-700" },
};

export function ReferralCenterPage() {
  const profile = useAuthStore((s) => s.profile);
  const referralCode = profile?.referral_code ?? mockReferralCode;
  const referralLink = profile?.referral_code
    ? buildReferralSignupUrl(profile.referral_code)
    : mockReferralLink;
  const qrRef = useRef<HTMLDivElement>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  const shareText = `Join me on Nexora and we both earn 100 points. Use code ${referralCode}: ${referralLink}`;

  const writeToClipboard = async (value: string): Promise<boolean> => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        return true;
      }
      // Legacy fallback for insecure contexts / older browsers
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  };

  const copy = async (value: string, kind: "code" | "link") => {
    const ok = await writeToClipboard(value);
    if (!ok) {
      toast.error("Couldn't copy — please copy manually", { description: value });
      return;
    }
    if (kind === "code") {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1500);
      toast.success("Referral code copied");
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 1500);
      toast.success("Referral link copied");
    }
  };

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) {
      toast.error("QR code not ready yet");
      return;
    }
    try {
      const link = document.createElement("a");
      link.download = `nexora-referral-${referralCode}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("QR code downloaded");
    } catch {
      toast.error("Couldn't download QR code");
    }
  };

  const shareNative = async () => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "Join Nexora", text: shareText, url: referralLink });
        toast.success("Thanks for sharing!");
        return;
      } catch (err) {
        // AbortError = user cancelled — stay silent
        if ((err as DOMException)?.name === "AbortError") return;
      }
    }
    // No native share → open fallback panel + copy the message so users have a shortcut
    setShowFallback(true);
    const copied = await writeToClipboard(shareText);
    toast.message("Sharing not available on this device", {
      description: copied
        ? "We've copied your message — pick an app below to paste it."
        : "Pick an app below to share your referral.",
    });
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent("Join me on Nexora")}&body=${encodeURIComponent(shareText)}`;

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 sm:py-10">
        <header>
          <h1 className="text-2xl font-black sm:text-3xl">Referral Center</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Share Nexora with friends — you both earn ₹100 wallet credit when they book.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          {/* Code + link + share */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,oklch(0.30_0.17_295),oklch(0.22_0.14_265))] p-6 text-white shadow-[var(--shadow-float)] sm:p-8">
              <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-fuchsia-400/30 blur-3xl" />
              <p className="relative inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider opacity-80">
                <Sparkles className="h-3.5 w-3.5" /> Your Referral Code
              </p>
              <div className="relative mt-3 flex flex-wrap items-end gap-4">
                <p className="font-mono text-5xl font-black tracking-[0.18em] sm:text-6xl">
                  {referralCode}
                </p>
                <button
                  type="button"
                  onClick={() => copy(referralCode, "code")}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition",
                    copiedCode
                      ? "bg-emerald-400 text-emerald-950 animate-[scale-in_0.2s_ease-out]"
                      : "bg-white/95 text-indigo-900 hover:bg-white",
                  )}
                >
                  {copiedCode ? (
                    <>
                      <Check className="h-4 w-4" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" /> Copy code
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Link field */}
            <div className="rounded-2xl border bg-card p-4 shadow-sm">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Your referral link
              </label>
              <div className="mt-2 flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-2">
                <LinkIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  readOnly
                  value={referralLink}
                  className="flex-1 truncate bg-transparent text-sm font-semibold outline-none"
                />
                <button
                  type="button"
                  onClick={() => copy(referralLink, "link")}
                  className={cn(
                    "shrink-0 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition",
                    copiedLink
                      ? "bg-emerald-500 text-white"
                      : "bg-primary text-primary-foreground hover:opacity-90",
                  )}
                >
                  {copiedLink ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copiedLink ? "Copied" : "Copy"}
                </button>
              </div>

              {/* Share row */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => copy(referralLink, "link")}
                  className="inline-flex flex-col items-center gap-1 rounded-2xl border px-3 py-3 text-xs font-bold transition hover:border-primary/40 hover:bg-primary/5"
                >
                  <LinkIcon className="h-4 w-4 text-primary" />
                  Copy Link
                </button>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex flex-col items-center gap-1 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-950/40"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
                <button
                  type="button"
                  onClick={shareNative}
                  className="inline-flex flex-col items-center gap-1 rounded-2xl border px-3 py-3 text-xs font-bold transition hover:border-primary/40 hover:bg-primary/5"
                >
                  <Share2 className="h-4 w-4 text-primary" />
                  Share Other
                </button>
              </div>

              {/* Fallback share panel — shown when Web Share API isn't available */}
              {showFallback && (
                <div className="mt-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-primary">Pick where to share</p>
                    <button
                      type="button"
                      onClick={() => setShowFallback(false)}
                      className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                    >
                      Close
                    </button>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <a
                      href={telegramUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-full border bg-background px-3 py-2 text-xs font-bold transition hover:border-primary/40 hover:bg-primary/5"
                    >
                      <Send className="h-3.5 w-3.5 text-sky-600" /> Telegram
                    </a>
                    <a
                      href={twitterUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-full border bg-background px-3 py-2 text-xs font-bold transition hover:border-primary/40 hover:bg-primary/5"
                    >
                      <Twitter className="h-3.5 w-3.5 text-sky-500" /> X / Twitter
                    </a>
                    <a
                      href={facebookUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-full border bg-background px-3 py-2 text-xs font-bold transition hover:border-primary/40 hover:bg-primary/5"
                    >
                      <Facebook className="h-3.5 w-3.5 text-blue-600" /> Facebook
                    </a>
                    <a
                      href={emailUrl}
                      className="inline-flex items-center justify-center gap-1.5 rounded-full border bg-background px-3 py-2 text-xs font-bold transition hover:border-primary/40 hover:bg-primary/5"
                    >
                      <Mail className="h-3.5 w-3.5 text-primary" /> Email
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* QR */}
          <div className="rounded-2xl border bg-card p-5 text-center shadow-sm">
            <h3 className="text-sm font-bold">Share via QR</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Friends scan to join with your code pre-filled.
            </p>
            <div ref={qrRef} className="mx-auto mt-4 w-fit rounded-2xl border bg-white p-4">
              <QRCodeCanvas value={referralLink} size={180} level="H" />
            </div>
            <button
              type="button"
              onClick={downloadQR}
              className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-primary px-3 py-2 text-xs font-bold text-primary transition hover:bg-primary/5"
            >
              <Download className="h-3.5 w-3.5" /> Download QR
            </button>
          </div>
        </div>

        {/* Stats */}
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Invites"
            value={mockReferralStats.totalInvites}
            Icon={Send}
            tint="bg-sky-100 text-sky-700"
          />
          <StatCard
            label="Successful"
            value={mockReferralStats.successful}
            Icon={Users}
            tint="bg-indigo-100 text-indigo-700"
          />
          <StatCard
            label="Rewards Earned"
            value={`₹${mockReferralStats.rewardsEarned}`}
            Icon={Trophy}
            tint="bg-emerald-100 text-emerald-700"
          />
          <StatCard
            label="Pending Rewards"
            value={`₹${mockReferralStats.pending}`}
            Icon={Hourglass}
            tint="bg-amber-100 text-amber-700"
          />
        </section>

        {/* How it works */}
        <section className="rounded-3xl border bg-gradient-to-br from-card to-muted/40 p-6 shadow-sm">
          <h2 className="text-lg font-bold">How it works</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <HowStep
              n={1}
              Icon={Share2}
              title="Share your code"
              body="Send your unique code or link to friends via WhatsApp, SMS or any app."
            />
            <HowStep
              n={2}
              Icon={Gift}
              title="They sign up & book"
              body="Friends get ₹100 off their first booking when they join with your code."
            />
            <HowStep
              n={3}
              Icon={Wallet}
              title="You both earn ₹100"
              body="The moment their first service completes, ₹100 lands in your Nexora wallet."
            />
          </div>
        </section>

        {/* Real referrals attribution */}
        <MyReferralsSection />
      </main>
      <PublicFooter />
    </div>
  );
}

function StatCard({
  label,
  value,
  Icon,
  tint,
}: {
  label: string;
  value: string | number;
  Icon: LucideIcon;
  tint: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className={`grid h-9 w-9 place-items-center rounded-full ${tint}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 text-2xl font-black">{value}</p>
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
    </div>
  );
}

function HowStep({
  n,
  Icon,
  title,
  body,
}: {
  n: number;
  Icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-card p-5 transition hover:shadow-md">
      <div className="absolute top-3 right-4 text-6xl font-black opacity-5">{n}</div>
      <div className="inline-grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-indigo-500 text-white shadow transition group-hover:scale-110">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-base font-bold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

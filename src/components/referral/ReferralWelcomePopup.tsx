import { useEffect, useState } from "react";
import {
  Copy,
  Share2,
  Sparkles,
  Gift,
  Globe,
  HelpCircle,
  Send,
  UserPlus,
  Award,
  Wallet,
  ArrowRight,
  AtSign,
  IdCard,
  ShieldCheck,
} from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { buildReferralSignupUrl } from "@/lib/public-app-url";
import { CUSTOMER_LOCATION_ONBOARDING_KEY } from "@/lib/customer-location";
import {
  buildBrandedReferralShareData,
  buildReferralShareMessage,
  consumePendingReferralWelcome,
  hasPendingReferralWelcome,
} from "@/lib/referral-welcome";

export function ReferralWelcomePopup() {
  const user = useAuthStore((s) => s.user);
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [open, setOpen] = useState(false);
  const [howOpen, setHowOpen] = useState(false);
  const isWebsitePreview =
    pathname.startsWith("/w/") &&
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("preview") === "1";
  const isWorkspaceRoute =
    isWebsitePreview ||
    pathname.startsWith("/owner") ||
    pathname.startsWith("/app/owner") ||
    pathname.startsWith("/admin");
  const authenticated = Boolean(user && session?.user.id === user.id);
  const currentProfile = authenticated && profile?.id === user?.id ? profile : null;
  const needsCustomerLocation =
    pathname.startsWith("/app/customer") &&
    (currentProfile?.latitude == null || currentProfile?.longitude == null);

  const code = currentProfile?.referral_code?.trim() ?? null;
  const link = code ? buildReferralSignupUrl(code) : "";
  const displayName =
    currentProfile?.full_name?.trim() || user?.email?.split("@")[0] || "Nexora member";
  const username = currentProfile?.username?.trim() || user?.email?.split("@")[0] || "member";
  const memberId = currentProfile?.nexora_id?.trim() || user?.id || "";
  const shareText = code
    ? buildReferralShareMessage({ displayName, referralCode: code, referralLink: link })
    : "";

  useEffect(() => {
    if (isWorkspaceRoute || needsCustomerLocation) return;
    if (!isInitialized || !authenticated || !user || !code) return;
    if (!hasPendingReferralWelcome(user.id)) return;
    const key = `nexora_ref_popup_shown_${user.id}`;
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem(CUSTOMER_LOCATION_ONBOARDING_KEY) === "required") return;
    if (window.sessionStorage.getItem(key)) return;
    // small delay so it doesn't collide with login redirects
    const t = setTimeout(() => {
      setOpen(true);
      consumePendingReferralWelcome(user.id);
      window.sessionStorage.setItem(key, "1");
    }, 900);
    return () => clearTimeout(t);
  }, [authenticated, isInitialized, user, code, isWorkspaceRoute, needsCustomerLocation]);

  if (!authenticated || !user || !code || isWorkspaceRoute || needsCustomerLocation) return null;

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Copy failed");
    }
  };

  const share = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        const shareData = await buildBrandedReferralShareData({
          displayName,
          referralCode: code,
          referralLink: link,
        });
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success("Referral message copied");
      }
    } catch {
      /* cancelled */
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[calc(100dvh-1.5rem)] w-[calc(100vw-1.5rem)] max-w-md overflow-x-hidden overflow-y-auto rounded-xl p-0">
        <div className="bg-[linear-gradient(135deg,#080704_0%,#2b1c08_60%,#a16c12_100%)] px-6 py-6 text-white">
          <div className="flex min-w-0 items-center gap-2 pr-5">
            <img
              src="/nexora-final-logo.jpg"
              alt="Nexora Salons"
              className="h-12 w-12 rounded-2xl border border-[#f1cf73]/50 object-cover shadow-lg"
            />
            <div className="min-w-0 flex-1">
              <DialogHeader className="space-y-0.5">
                <DialogTitle className="text-balance text-lg font-bold leading-snug text-white">
                  Welcome, {displayName}!
                </DialogTitle>
                <DialogDescription className="text-white/85 text-xs">
                  Your Nexora account is ready. Save your login securely, then invite friends.
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>
        </div>

        <div className="min-w-0 space-y-4 px-4 pb-5 pt-4 sm:px-6 sm:pb-6">
          <div className="rounded-xl border border-[#d7a93b]/35 bg-[#fffaf0] p-3 text-slate-900">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-black">{displayName}</p>
                <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-600">
                  <AtSign className="h-3.5 w-3.5" /> {username}
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => copy(username, "Username")}>
                <Copy className="mr-1 h-3.5 w-3.5" /> Copy
              </Button>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#d7a93b]/25 pt-3">
              <p className="min-w-0 truncate font-mono text-xs font-bold" title={memberId}>
                <IdCard className="mr-1 inline h-3.5 w-3.5" /> ID: {memberId}
              </p>
              <button
                type="button"
                onClick={() => copy(memberId, "Member ID")}
                className="shrink-0 text-xs font-bold text-[#80570d]"
              >
                Copy ID
              </button>
            </div>
          </div>

          <div className="flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              <strong>Password stays private.</strong> When Chrome or your phone asks, choose Save
              password. Nexora never displays or shares it.
            </p>
          </div>

          <div className="rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 p-3">
            <div className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">
              Your referral code
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="flex-1 font-mono text-xl font-black tracking-wider">{code}</span>
              <Button size="sm" variant="outline" onClick={() => copy(code, "Code")}>
                <Copy className="mr-1 h-3.5 w-3.5" /> Copy
              </Button>
            </div>
          </div>

          <div>
            <div className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">
              Shareable link
            </div>
            <div className="mt-1 flex min-w-0 items-center gap-2 rounded-md border bg-background px-3 py-2">
              <span className="min-w-0 flex-1 truncate font-mono text-xs" title={link}>
                {link}
              </span>
              <button
                onClick={() => copy(link, "Link")}
                aria-label="Copy link"
                className="text-muted-foreground hover:text-foreground"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>

          <ul className="space-y-2 rounded-lg bg-muted/40 p-3 text-sm">
            <li className="flex items-start gap-2">
              <Gift className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                <strong className="font-semibold">You can earn ₹100 reward credit</strong> after
                your friend completes an eligible first booking.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                <strong className="font-semibold">Your friend can get up to ₹100 credit</strong> on
                an eligible first booking.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Globe className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                <strong className="font-semibold">Easy mobile booking</strong> with nearby salons,
                rewards and booking history in one place.
              </span>
            </li>
          </ul>

          <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
            <Button className="w-full min-w-0" onClick={share}>
              <Share2 className="mr-1.5 h-4 w-4" /> Share welcome & benefits
            </Button>
            <Button className="w-full sm:w-auto" variant="outline" onClick={() => setOpen(false)}>
              Later
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setHowOpen(true)}
            className="mx-auto flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            How referrals work
          </button>
        </div>
      </DialogContent>

      <Dialog open={howOpen} onOpenChange={setHowOpen}>
        <DialogContent className="max-h-[calc(100dvh-1.5rem)] w-[calc(100vw-1.5rem)] max-w-md overflow-x-hidden overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              How referrals work
            </DialogTitle>
            <DialogDescription>
              Share your verified link and track each eligible referral from your account.
            </DialogDescription>
          </DialogHeader>

          <ol className="mt-2 space-y-3">
            {[
              {
                icon: Send,
                title: "1. Share your link or code",
                desc: "Send your unique referral link (or code) to friends via WhatsApp, Instagram, SMS — anywhere.",
              },
              {
                icon: UserPlus,
                title: "2. Friend signs up",
                desc: "They open your link and create their Nexora account. The code auto-applies at signup.",
              },
              {
                icon: Award,
                title: "3. Friend completes an eligible booking",
                desc: "The referral qualifies after the first eligible booking is completed.",
              },
              {
                icon: Wallet,
                title: "4. Track & redeem",
                desc: "See pending and converted referrals, then use eligible reward credit on Nexora.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <li key={title} className="flex gap-3 rounded-lg border bg-muted/30 p-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-sm font-semibold">{title}</div>
                  <div className="text-muted-foreground text-xs">{desc}</div>
                </div>
              </li>
            ))}
          </ol>

          <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-xs">
            <div className="font-semibold text-primary">Where points are awarded</div>
            <ul className="text-muted-foreground mt-1 list-disc space-y-0.5 pl-4">
              <li>Referrer: up to ₹100 credit after the eligible first booking</li>
              <li>New user: up to ₹100 eligible welcome booking benefit</li>
              <li>
                Status becomes <strong>Converted</strong> after their first booking
              </li>
            </ul>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setHowOpen(false)}>
              Got it
            </Button>
            <Button
              asChild
              onClick={() => {
                setHowOpen(false);
                setOpen(false);
              }}
            >
              <Link to="/dashboard/referrals">
                Go to Referral Center
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

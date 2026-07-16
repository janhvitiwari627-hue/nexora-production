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
} from "lucide-react";
import { Link } from "@tanstack/react-router";
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

export function ReferralWelcomePopup() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const [open, setOpen] = useState(false);
  const [howOpen, setHowOpen] = useState(false);

  const code = profile?.referral_code ?? null;
  const link = code ? buildReferralSignupUrl(code) : "";
  const shareText = `Join me on Nexora & build your own salon website in minutes! Use my referral code ${code}: ${link}`;

  useEffect(() => {
    if (!isInitialized || !user || !code) return;
    const key = `nexora_ref_popup_shown_${user.id}`;
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem(key)) return;
    // small delay so it doesn't collide with login redirects
    const t = setTimeout(() => {
      setOpen(true);
      window.sessionStorage.setItem(key, "1");
    }, 900);
    return () => clearTimeout(t);
  }, [isInitialized, user, code]);

  if (!code) return null;

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
        await navigator.share({
          title: "Build your own salon website — Nexora",
          text: shareText,
          url: link,
        });
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
        <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 px-6 py-6 text-white">
          <div className="flex min-w-0 items-center gap-2 pr-5">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-white/20 backdrop-blur">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogHeader className="space-y-0.5">
                <DialogTitle className="text-balance text-lg font-bold leading-snug text-white">
                  Refer & Earn 100 points per friend
                </DialogTitle>
                <DialogDescription className="text-white/85 text-xs">
                  Share your link — friends sign up & build their own salon website.
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>
        </div>

        <div className="min-w-0 space-y-4 px-4 pb-5 pt-4 sm:px-6 sm:pb-6">
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
                <strong className="font-semibold">You get 100 points</strong> when your friend signs
                up with your code.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                <strong className="font-semibold">Your friend gets 100 points</strong> as a welcome
                bonus.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Globe className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                <strong className="font-semibold">Free salon website</strong> — they can build one
                in minutes.
              </span>
            </li>
          </ul>

          <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
            <Button className="w-full min-w-0" onClick={share}>
              <Share2 className="mr-1.5 h-4 w-4" /> Share now
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
              Simple 4-step flow — earn 100 points every time a friend joins with your code.
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
                title: "3. You both get 100 points",
                desc: "Points are credited instantly the moment their account is created and verified.",
              },
              {
                icon: Wallet,
                title: "4. Track & redeem",
                desc: "See every referral (pending / converted) in your Referral Center and use points on bookings & services.",
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
              <li>Referrer (you): +100 points on friend's successful signup</li>
              <li>New user (friend): +100 welcome points once they sign up with your code</li>
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

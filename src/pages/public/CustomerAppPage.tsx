import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Smartphone, MapPin, Tag, UserCheck, Zap, MessageCircle, QrCode, Gift, History, Download, ExternalLink, Apple, Play, Share, Plus, MoreVertical, Chrome, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { toast } from "sonner";

const BENEFITS = [
  { icon: MapPin, title: "Nearby salon search", desc: "Verified salons around you, ranked by rating." },
  { icon: Tag, title: "Price comparison", desc: "Transparent, upfront pricing across salons." },
  { icon: UserCheck, title: "Staff selection", desc: "Pick your favourite stylist or therapist." },
  { icon: Zap, title: "60-second booking", desc: "From search to confirmed slot in under a minute." },
  { icon: MessageCircle, title: "WhatsApp confirmation", desc: "Instant booking updates on WhatsApp." },
  { icon: QrCode, title: "Nexora QR rewards", desc: "Scan-and-pay to earn cashback every visit." },
  { icon: Gift, title: "Referral benefits", desc: "Invite friends and unlock bonus rewards." },
  { icon: History, title: "Booking history", desc: "All your visits, receipts and favourites — one tap away." },
];

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Platform = "ios" | "android" | "desktop";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent || "";
  if (/iPad|iPhone|iPod/.test(ua) || (ua.includes("Mac") && "ontouchend" in document)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

function isSafari() {
  const ua = navigator.userAgent || "";
  return /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|Chrome/.test(ua);
}
function isChromium() {
  const ua = navigator.userAgent || "";
  return /Chrome|CriOS|Edg|Brave|OPR/.test(ua);
}

const SESSION_DISMISS_KEY = "nexora_pwa_install_dismissed_session";
const INSTALLED_KEY = "nexora_pwa_installed";

export default function CustomerAppPage() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [platform, setPlatform] = useState<Platform>("desktop");
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    setPlatform(detectPlatform());

    // Persistent install flag from any prior session.
    if (typeof localStorage !== "undefined" && localStorage.getItem(INSTALLED_KEY)) {
      setInstalled(true);
    }
    // Session-scoped dismissal.
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(SESSION_DISMISS_KEY)) {
      setDismissed(true);
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
      try { localStorage.setItem(INSTALLED_KEY, "1"); } catch { /* ignore */ }
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    if (window.matchMedia?.("(display-mode: standalone)").matches) setInstalled(true);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (deferred) {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === "accepted") {
        setInstalled(true);
        try { localStorage.setItem(INSTALLED_KEY, "1"); } catch { /* ignore */ }
      } else {
        // User dismissed the native prompt — respect that for the session.
        setDismissed(true);
        try { sessionStorage.setItem(SESSION_DISMISS_KEY, "1"); } catch { /* ignore */ }
      }
      setDeferred(null);
      return;
    }
    setShowGuide(true);
    // Nudge for wrong-browser cases
    if (platform === "ios" && !isSafari()) {
      toast.message("Open in Safari to install", {
        description: "iOS only allows installing from Safari. Tap the ••• menu → Open in Safari, then follow the steps below.",
      });
    } else if (platform === "android" && !isChromium()) {
      toast.message("Open in Chrome to install", {
        description: "Tap your browser menu → Open in Chrome, then follow the steps below.",
      });
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowGuide(false);
    try { sessionStorage.setItem(SESSION_DISMISS_KEY, "1"); } catch { /* ignore */ }
  };

  const showInstallCTA = !installed && !dismissed;

  const installLabel =
    deferred ? "Install Nexora App" :
    platform === "ios" ? "Show iOS Install Steps" :
    platform === "android" ? "Show Android Install Steps" :
    "Install Nexora App";

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 md:py-20">
        {/* Hero */}
        <section className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1 text-xs font-medium">
              <Smartphone className="h-3.5 w-3.5" /> Customer App
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              Nexora Customer App
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Nearby verified salons, transparent prices, 60-second booking and QR rewards.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {showInstallCTA && (
                <>
                  <Button size="lg" onClick={handleInstall}>
                    <Download className="mr-2 h-4 w-4" />
                    {installLabel}
                  </Button>
                  <Button size="lg" variant="ghost" onClick={handleDismiss} aria-label="Dismiss install">
                    <X className="mr-2 h-4 w-4" /> Not now
                  </Button>
                </>
              )}
              {installed && (
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                  <Download className="h-4 w-4" /> App installed — open Nexora from your home screen
                </div>
              )}
              <Button size="lg" variant="outline" asChild>
                <Link to="/search">
                  Continue in Browser <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {showInstallCTA && !deferred && (
              <p className="mt-3 text-sm text-muted-foreground">
                {platform === "ios" && (<>On iPhone/iPad: open in <b>Safari</b>, tap <Share className="inline h-3.5 w-3.5" /> Share, then <b>Add to Home Screen</b>.</>)}
                {platform === "android" && (<>On Android: open in <b>Chrome</b>, tap <MoreVertical className="inline h-3.5 w-3.5" />, then <b>Install app</b> / <b>Add to Home screen</b>.</>)}
                {platform === "desktop" && (<>On desktop Chrome/Edge: click the <Download className="inline h-3.5 w-3.5" /> install icon in the address bar.</>)}
              </p>
            )}

            {showGuide && showInstallCTA && !deferred && (
              <Alert className="mt-4">
                <Info className="h-4 w-4" />
                <AlertTitle>
                  {platform === "ios" ? "Install on iPhone / iPad (Safari)" :
                   platform === "android" ? "Install on Android (Chrome)" :
                   "Install on Desktop"}
                </AlertTitle>
                <AlertDescription>
                  {platform === "ios" && (
                    <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
                      <li>Open <b>meripahalfasthelp.online/customer-app</b> in <b>Safari</b> (not Chrome).</li>
                      <li>Tap the <Share className="inline h-3.5 w-3.5" /> <b>Share</b> button at the bottom.</li>
                      <li>Scroll and tap <Plus className="inline h-3.5 w-3.5" /> <b>Add to Home Screen</b>.</li>
                      <li>Tap <b>Add</b> in the top-right — Nexora appears on your home screen.</li>
                    </ol>
                  )}
                  {platform === "android" && (
                    <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
                      <li>Open this page in <b>Chrome</b>.</li>
                      <li>Tap the <MoreVertical className="inline h-3.5 w-3.5" /> menu (top-right).</li>
                      <li>Tap <b>Install app</b> (or <b>Add to Home screen</b>).</li>
                      <li>Confirm <b>Install</b> — Nexora is added to your app drawer.</li>
                    </ol>
                  )}
                  {platform === "desktop" && (
                    <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
                      <li>Use <Chrome className="inline h-3.5 w-3.5" /> <b>Chrome</b>, <b>Edge</b> or <b>Brave</b>.</li>
                      <li>Click the <Download className="inline h-3.5 w-3.5" /> install icon on the right of the address bar.</li>
                      <li>Click <b>Install</b> in the popup — Nexora opens in its own window.</li>
                    </ol>
                  )}
                </AlertDescription>
              </Alert>
            )}


            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="secondary" size="lg" disabled className="opacity-70">
                <Play className="mr-2 h-4 w-4" /> Get it on Google Play
                <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px]">Coming Soon</span>
              </Button>
              <Button variant="secondary" size="lg" disabled className="opacity-70">
                <Apple className="mr-2 h-4 w-4" /> Download on the App Store
                <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px]">Coming Soon</span>
              </Button>
            </div>
          </div>

          {/* Mockup */}
          <div className="flex justify-center">
            <div className="relative aspect-[9/19] w-64 rounded-[2.5rem] border-8 border-foreground/90 bg-foreground p-2 shadow-2xl">
              <div className="flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-primary/10 via-background to-background">
                <div className="p-4">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Nexora</div>
                  <div className="mt-1 text-sm font-semibold">Salons near you</div>
                </div>
                <div className="mx-3 rounded-xl bg-background p-3 shadow-sm">
                  <div className="h-16 rounded-md bg-muted" />
                  <div className="mt-2 h-2 w-2/3 rounded bg-muted" />
                  <div className="mt-1 h-2 w-1/3 rounded bg-muted" />
                </div>
                <div className="mx-3 mt-2 rounded-xl bg-background p-3 shadow-sm">
                  <div className="h-16 rounded-md bg-muted" />
                  <div className="mt-2 h-2 w-1/2 rounded bg-muted" />
                </div>
                <div className="mt-auto rounded-b-[1.5rem] bg-primary/95 p-3 text-center text-xs font-medium text-primary-foreground">
                  Book in 60 seconds
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="mt-20">
          <h2 className="text-center text-3xl font-bold">Why customers love Nexora</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b) => (
              <Card key={b.title} className="p-5">
                <b.icon className="h-6 w-6 text-primary" />
                <h3 className="mt-3 font-semibold">{b.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{b.desc}</p>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

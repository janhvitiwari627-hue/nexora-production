import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Smartphone, MapPin, Tag, UserCheck, Zap, MessageCircle, QrCode, Gift, History, Download, ExternalLink, Apple, Play, Share, Plus, MoreVertical, Chrome, Info, X } from "lucide-react";
import {
  initInstallPromptCapture,
  subscribeInstallPrompt,
  clearInstallPrompt,
} from "@/lib/pwa-install";
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

/**
 * Chrome does not fire `beforeinstallprompt` inside iframes and
 * Lovable's editor/preview URLs never serve the PWA install criteria.
 * When the user clicks "Install" from inside one of these contexts we
 * must explain that clearly instead of silently doing nothing.
 */
function isEmbeddedOrPreview() {
  if (typeof window === "undefined") return false;
  const inIframe = window.self !== window.top;
  const host = window.location.hostname;
  const isPreviewHost =
    host.startsWith("id-preview--") ||
    host.startsWith("preview--") ||
    host.endsWith(".lovableproject.com") ||
    host.endsWith(".lovableproject-dev.com") ||
    host === "lovableproject.com" ||
    host === "lovableproject-dev.com";
  return inIframe || isPreviewHost;
}

const SESSION_DISMISS_KEY = "nexora_pwa_install_dismissed_session";
const INSTALLED_KEY = "nexora_pwa_installed";
const LIVE_APP_URL = "https://meripahalfasthelp.online/customer-app";

export default function CustomerAppPage() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [platform, setPlatform] = useState<Platform>("desktop");
  const [showGuide, setShowGuide] = useState(false);
  const [embedded, setEmbedded] = useState(false);
  const guideRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    setPlatform(detectPlatform());
    setEmbedded(isEmbeddedOrPreview());


    // Persistent install flag from any prior session.
    if (typeof localStorage !== "undefined" && localStorage.getItem(INSTALLED_KEY)) {
      setInstalled(true);
    }
    // Session-scoped dismissal.
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(SESSION_DISMISS_KEY)) {
      setDismissed(true);
    }

    // Use the global capture so the deferred prompt survives navigation
    // between routes. Falls back to a local listener as a safety net.
    initInstallPromptCapture();
    const unsubGlobal = subscribeInstallPrompt((evt) => {
      setDeferred((evt as unknown as BeforeInstallPromptEvent) ?? null);
    });

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

    // Sync with display-mode: standalone (persists on reload and updates live).
    const mql = window.matchMedia?.("(display-mode: standalone)");
    if (mql?.matches) {
      setInstalled(true);
      try { localStorage.setItem(INSTALLED_KEY, "1"); } catch { /* ignore */ }
    }
    const onDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setInstalled(true);
        try { localStorage.setItem(INSTALLED_KEY, "1"); } catch { /* ignore */ }
      }
    };
    mql?.addEventListener?.("change", onDisplayModeChange);

    // Cross-tab sync: reflect install/dismiss changes made in other tabs.
    const onStorage = (e: StorageEvent) => {
      if (e.key === INSTALLED_KEY && e.newValue) setInstalled(true);
      if (e.key === INSTALLED_KEY && e.newValue === null) setInstalled(false);
      // sessionStorage doesn't cross tabs, but honor same-tab dismissal broadcasts via localStorage bridge below.
      if (e.key === SESSION_DISMISS_KEY && e.newValue) setDismissed(true);
    };
    window.addEventListener("storage", onStorage);

    // When the page regains focus, re-check flags (covers install completed while backgrounded).
    const onVisibility = () => {
      if (document.visibilityState !== "visible") return;
      try {
        if (localStorage.getItem(INSTALLED_KEY)) setInstalled(true);
        if (sessionStorage.getItem(SESSION_DISMISS_KEY)) setDismissed(true);
      } catch { /* ignore */ }
      if (window.matchMedia?.("(display-mode: standalone)").matches) setInstalled(true);
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      unsubGlobal();
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibility);
      mql?.removeEventListener?.("change", onDisplayModeChange);
    };
  }, []);

  const handleInstall = async () => {
    if (deferred) {
      try {
        await deferred.prompt();
        const { outcome } = await deferred.userChoice;
        if (outcome === "accepted") {
          setInstalled(true);
          try { localStorage.setItem(INSTALLED_KEY, "1"); } catch { /* ignore */ }
          toast.success("Installing Nexora…", { description: "You'll find Nexora on your home screen shortly." });
        } else {
          setDismissed(true);
          try { sessionStorage.setItem(SESSION_DISMISS_KEY, "1"); } catch { /* ignore */ }
        }
      } catch {
        toast.error("Install prompt failed", { description: "Try again from your browser's install icon in the address bar." });
      } finally {
        setDeferred(null);
        clearInstallPrompt();
      }
      return;
    }

    // No native prompt available. Always give the user visible feedback and
    // reveal the platform-specific install guide.
    setShowGuide(true);
    // Scroll the guide into view on the next paint so it's obvious the click did something.
    requestAnimationFrame(() => {
      guideRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    if (isEmbeddedOrPreview()) {
      toast.message("Open the published site to install", {
        description: "Installing to your home screen only works from the live Nexora URL (meripahalfasthelp.online), not the in-editor preview.",
      });
      return;
    }

    if (platform === "ios") {
      toast.message(isSafari() ? "Follow the iOS install steps" : "Open in Safari to install", {
        description: isSafari()
          ? "Tap Share → Add to Home Screen to install Nexora."
          : "iOS only allows installing from Safari. Open this page in Safari and follow the steps below.",
      });
    } else if (platform === "android") {
      toast.message(isChromium() ? "Follow the Android install steps" : "Open in Chrome to install", {
        description: isChromium()
          ? "Tap the ⋮ menu → Install app to add Nexora to your device."
          : "Open this page in Chrome, then tap ⋮ → Install app.",
      });
    } else {
      toast.message("Install from your browser", {
        description: "Click the install icon on the right of the address bar in Chrome, Edge or Brave.",
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

            {installed && (
              <Alert className="mt-5 border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-100">
                <Download className="h-4 w-4" />
                <AlertTitle>Nexora is already installed</AlertTitle>
                <AlertDescription>
                  <p className="mt-1 text-sm">
                    {typeof window !== "undefined" && window.matchMedia?.("(display-mode: standalone)").matches
                      ? "You're running Nexora as an installed app right now — no further action needed."
                      : "This device has Nexora installed. Open it from your home screen or app drawer for the full standalone experience."}
                  </p>
                </AlertDescription>
              </Alert>
            )}

            {embedded && !installed && (
              <Alert className="mt-5 border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
                <Info className="h-4 w-4" />
                <AlertTitle>Install prompt blocked in this preview</AlertTitle>
                <AlertDescription>
                  <p className="mt-1 text-sm">
                    Browsers only fire the PWA <code className="rounded bg-black/5 px-1 py-0.5 text-[11px] dark:bg-white/10">beforeinstallprompt</code> event in a <b>top-level tab</b>. This page is inside the Lovable editor iframe, so the native "Install" button can't appear here. Open the live site in a new tab and install from there:
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      asChild
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      <a href={LIVE_APP_URL} target="_blank" rel="noopener noreferrer">
                        Open live site in new tab
                        <ExternalLink className="ml-2 h-3.5 w-3.5" />
                      </a>
                    </Button>
                    <code className="rounded bg-black/5 px-2 py-1 text-[11px] dark:bg-white/10">
                      {LIVE_APP_URL}
                    </code>
                  </div>
                  <div className="mt-4 text-sm">
                    <div className="font-semibold">
                      {platform === "ios" && <>Next: install on iPhone / iPad (Safari)</>}
                      {platform === "android" && <>Next: install on Android (Chrome)</>}
                      {platform === "desktop" && <>Next: install on desktop (Chrome / Edge / Brave)</>}
                    </div>
                    {platform === "ios" && (
                      <ol className="mt-2 list-decimal space-y-1 pl-5">
                        <li>Open the new tab in <b>Safari</b> (Chrome on iOS can't install PWAs).</li>
                        <li>Tap <Share className="inline h-3.5 w-3.5" /> <b>Share</b> in the bottom bar.</li>
                        <li>Scroll and tap <Plus className="inline h-3.5 w-3.5" /> <b>Add to Home Screen</b>.</li>
                        <li>Tap <b>Add</b> — Nexora appears on your home screen.</li>
                      </ol>
                    )}
                    {platform === "android" && (
                      <ol className="mt-2 list-decimal space-y-1 pl-5">
                        <li>Open the new tab in <b>Chrome</b>.</li>
                        <li>Wait 2–3 seconds — an <b>Install app</b> banner may appear at the bottom.</li>
                        <li>Otherwise tap <MoreVertical className="inline h-3.5 w-3.5" /> menu → <b>Install app</b> / <b>Add to Home screen</b>.</li>
                        <li>Confirm <b>Install</b> — Nexora is added to your app drawer.</li>
                      </ol>
                    )}
                    {platform === "desktop" && (
                      <ol className="mt-2 list-decimal space-y-1 pl-5">
                        <li>Open the new tab in <Chrome className="inline h-3.5 w-3.5" /> <b>Chrome</b>, <b>Edge</b> or <b>Brave</b>.</li>
                        <li>Look for the <Download className="inline h-3.5 w-3.5" /> install icon at the right end of the address bar.</li>
                        <li>Click it, then click <b>Install</b> in the popup — Nexora opens in its own window.</li>
                      </ol>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

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
              <div ref={guideRef}>
              {/* Preview-blocked notice is shown as the top status banner instead. */}

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
              </div>
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

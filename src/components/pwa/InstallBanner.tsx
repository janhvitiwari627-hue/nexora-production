import { useEffect, useState } from "react";
import { Download, X, Copy, ExternalLink, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  initInstallPromptCapture,
  subscribeInstallPrompt,
  clearInstallPrompt,
  isAppInstalled,
  type BeforeInstallPromptEvent,
} from "@/lib/pwa-install";
import { toast } from "sonner";

const DISMISS_KEY = "nexora_install_banner_dismissed_at";
const DISMISS_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const INSTALLED_KEY = "nexora_pwa_installed";
const LIVE_APP_URL = "https://meripahalfasthelp.online/customer-app";

function isDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = parseInt(raw, 10);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts < DISMISS_MS;
  } catch {
    return false;
  }
}

export function InstallBanner() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    initInstallPromptCapture();

    setDismissed(isDismissed());

    // Reliable installed detection: standalone display-mode (Chromium/Android/desktop),
    // iOS Safari's non-standard navigator.standalone, our persisted flag, and the
    // pwa-install module's cached appinstalled signal.
    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)").matches === true ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    try {
      if (localStorage.getItem(INSTALLED_KEY)) setInstalled(true);
    } catch { /* ignore */ }
    if (isAppInstalled() || isStandalone) {
      setInstalled(true);
      try { localStorage.setItem(INSTALLED_KEY, "1"); } catch { /* ignore */ }
    }

    const unsub = subscribeInstallPrompt((evt) => setDeferred(evt));

    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
      try { localStorage.setItem(INSTALLED_KEY, "1"); } catch { /* ignore */ }
      toast.success("Nexora App installed successfully");
    };
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      unsub();
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferred) return;
    try {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === "accepted") {
        setInstalled(true);
        try { localStorage.setItem(INSTALLED_KEY, "1"); } catch { /* ignore */ }
        toast.success("Installing Nexora…");
      }
    } catch {
      toast.error("Install prompt failed");
    } finally {
      setDeferred(null);
      clearInstallPrompt();
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch { /* ignore */ }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(LIVE_APP_URL);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };

  // A. Already installed
  if (installed) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300">
        <CheckCircle2 className="h-4 w-4" />
        Nexora App is installed
      </div>
    );
  }

  // D. Dismissed
  if (dismissed) return null;

  // B. Install prompt available
  if (deferred) {
    return (
      <Card className="relative p-5">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Download className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Install Nexora App</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Faster booking, rewards and reminders.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" onClick={handleInstall}>
                <Download className="mr-2 h-4 w-4" /> Install
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDismiss}>
                Not now
              </Button>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </Card>
    );
  }

  // C. Not installed and no native prompt
  return (
    <Card className="relative p-5">
      <div className="flex items-start gap-4">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <Download className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">Install Nexora App</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Install is available on the published live site in Chrome, Edge or Brave.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" asChild>
              <a href={LIVE_APP_URL} target="_blank" rel="noopener noreferrer">
                Continue in Browser <ExternalLink className="ml-2 h-3.5 w-3.5" />
              </a>
            </Button>
            <Button size="sm" variant="outline" onClick={handleCopyLink}>
              <Copy className="mr-2 h-3.5 w-3.5" /> Copy App Link
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDismiss}>
              Not now
            </Button>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}

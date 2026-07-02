import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Share, X } from "lucide-react";
import { isPreviewOrDev } from "@/lib/pwa-guards";
import { useAuthStore } from "@/stores/authStore";

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Session-only dismissal — do not annoy the user again this session.
const SESSION_DISMISS_KEY = "nexora_pwa_install_dismissed_session";
// Persistent flag set only after a successful install.
const INSTALLED_KEY = "nexora_pwa_installed";

export function PWAInstallPrompt() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [show, setShow] = useState(false);
  const [iOS, setIOS] = useState(false);
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  useEffect(() => {
    if (typeof window === "undefined" || isPreviewOrDev()) return;
    if (sessionStorage.getItem(SESSION_DISMISS_KEY)) return;
    if (localStorage.getItem(INSTALLED_KEY)) return;

    // Already installed / running standalone → skip.
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as { standalone?: boolean }).standalone === true;
    if (standalone) return;

    // Only show to signed-in customers.
    if (!isInitialized) return;
    if (!user) return;
    if (role && role !== "customer") return;

    // Detect iOS (no beforeinstallprompt support).
    const ua = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);

    let shown = false;
    const reveal = () => {
      if (shown) return;
      shown = true;
      setShow(true);
    };

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      // Small delay after login so it doesn't jump-scare the user.
      setTimeout(reveal, 2000);
    };
    window.addEventListener("beforeinstallprompt", handler);

    let iosTimer: ReturnType<typeof setTimeout> | undefined;
    if (isIOS) {
      setIOS(true);
      iosTimer = setTimeout(reveal, 2500);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, [user, role, isInitialized]);

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    setShow(false);
    if (outcome === "accepted") {
      localStorage.setItem(INSTALLED_KEY, "1");
    } else {
      sessionStorage.setItem(SESSION_DISMISS_KEY, "1");
    }
  };

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem(SESSION_DISMISS_KEY, "1");
  };

  if (!show) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md rounded-2xl border bg-white p-4 shadow-2xl md:left-auto md:right-4">
      <button onClick={dismiss} aria-label="Dismiss" className="text-muted-foreground hover:text-foreground absolute right-2 top-2"><X className="h-4 w-4" /></button>
      <div className="flex items-start gap-3 pr-6">
        <div className="bg-gradient-to-br from-primary to-accent grid h-12 w-12 shrink-0 place-items-center rounded-xl text-white">
          <Download className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold">Install Nexora</div>
          {iOS ? (
            <p className="text-muted-foreground mt-1 text-sm">
              Tap <Share className="inline h-3.5 w-3.5" /> Share, then <strong>Add to Home Screen</strong>.
            </p>
          ) : (
            <>
              <p className="text-muted-foreground mt-1 text-sm">Get faster access and a native app feel.</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={install}>Add to Home Screen</Button>
                <Button size="sm" variant="ghost" onClick={dismiss}>Not now</Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

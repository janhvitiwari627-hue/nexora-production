import { useEffect, useState } from "react";
import { CheckCircle2, Download, ExternalLink, HelpCircle, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { activateRoleManifest, type NexoraAppKind } from "@/lib/role-pwa";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type InstallState = "checking" | "available" | "installed" | "ios" | "unsupported" | "cancelled";

let deferredPrompt: InstallPromptEvent | null = null;
let currentState: InstallState = "checking";
let listenersReady = false;
const subscribers = new Set<(state: InstallState) => void>();

function publish(state: InstallState) {
  currentState = state;
  subscribers.forEach((subscriber) => subscriber(state));
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function initializeInstallLifecycle() {
  if (listenersReady) return;
  listenersReady = true;

  if (isStandalone()) publish("installed");
  else if (isIos()) publish("ios");
  else publish("unsupported");

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event as InstallPromptEvent;
    publish("available");
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    publish("installed");
  });
  window.matchMedia("(display-mode: standalone)").addEventListener?.("change", (event) => {
    if (event.matches) publish("installed");
  });
}

const APP_NAMES: Record<NexoraAppKind, string> = {
  master: "Nexora App",
  customer: "Customer App",
  owner: "Owner App",
  partner: "Growth Partner App",
  distributor: "Distributor App",
  jobs: "Jobs App",
};

export function InstallAppButton({
  kind,
  fallbackHref,
  className,
}: {
  kind: NexoraAppKind;
  fallbackHref: string;
  className?: string;
}) {
  const [state, setState] = useState<InstallState>(currentState);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    activateRoleManifest(kind);
    initializeInstallLifecycle();
    const subscribe = (next: InstallState) => setState(next);
    subscribers.add(subscribe);
    setState(currentState);
    return () => {
      subscribers.delete(subscribe);
    };
  }, [kind]);

  const install = async () => {
    if (state === "installed") {
      window.location.assign(fallbackHref);
      return;
    }
    if (state === "ios" || state === "unsupported" || state === "cancelled") {
      setHelpOpen(true);
      return;
    }
    if (!deferredPrompt) {
      setHelpOpen(true);
      return;
    }

    const prompt = deferredPrompt;
    deferredPrompt = null;
    await prompt.prompt();
    const choice = await prompt.userChoice;
    publish(choice.outcome === "accepted" ? "checking" : "cancelled");
  };

  const appName = APP_NAMES[kind];
  const installed = state === "installed";
  const available = state === "available";
  const label = installed
    ? `Open ${appName}`
    : available
      ? `Install ${appName}`
      : `How to install ${appName}`;

  return (
    <>
      <button
        type="button"
        onClick={install}
        className={
          className ??
          "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-6 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800"
        }
        aria-label={label}
      >
        {installed ? (
          <ExternalLink className="h-4 w-4" />
        ) : available ? (
          <Download className="h-4 w-4" />
        ) : (
          <HelpCircle className="h-4 w-4" />
        )}
        {label}
      </button>

      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-md overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {state === "ios" ? `Install ${appName} on iPhone or iPad` : `Install ${appName}`}
            </DialogTitle>
            <DialogDescription>
              {state === "cancelled"
                ? "Installation was cancelled. Reload this page when you want to try again."
                : state === "ios"
                  ? "Safari installs this app from its Share menu."
                  : "The automatic install prompt is not available in this browser yet."}
            </DialogDescription>
          </DialogHeader>
          {state === "ios" ? (
            <ol className="space-y-3 text-sm text-slate-700">
              <li className="flex gap-3">
                <Share className="mt-0.5 h-5 w-5 shrink-0 text-violet-700" />
                <span>
                  <strong>1.</strong> Tap the Share icon in Safari.
                </span>
              </li>
              <li>
                <strong>2.</strong> Select “Add to Home Screen”.
              </li>
              <li>
                <strong>3.</strong> Tap “Add”.
              </li>
            </ol>
          ) : (
            <div className="space-y-3 text-sm text-slate-700">
              <p>
                Open this page in the latest Chrome or Edge on Android/desktop, or Safari on
                iPhone/iPad.
              </p>
              <p>
                The browser will offer installation after the app meets its install requirements. No
                APK is downloaded.
              </p>
            </div>
          )}
          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setHelpOpen(false)}>
              Close
            </Button>
            <Button onClick={() => window.location.assign(fallbackHref)}>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Continue in browser
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

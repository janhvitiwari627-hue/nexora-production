import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Loader2,
  Share,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { activateRoleManifest, type NexoraAppKind } from "@/lib/role-pwa";
import {
  getPwaInstallState,
  isAndroidDevice,
  isInAppBrowser,
  showPwaInstallPrompt,
  subscribeToPwaInstall,
  type InstallState,
} from "@/lib/pwa-install";

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
  const [state, setState] = useState<InstallState>(getPwaInstallState());
  const [helpOpen, setHelpOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    activateRoleManifest(kind);
    return subscribeToPwaInstall(setState);
  }, [kind]);

  const install = async () => {
    if (state === "installed") {
      window.location.assign(fallbackHref);
      return;
    }
    if (state === "installing" || state === "checking") return;
    if (state === "ios" || state === "unsupported" || state === "cancelled") {
      setHelpOpen(true);
      return;
    }
    if (!(await showPwaInstallPrompt())) {
      setHelpOpen(true);
    }
  };

  const customerInstallUrl = "https://www.meripahalfasthelp.online/customer-app?install=1";
  const android = typeof window !== "undefined" && isAndroidDevice();
  const embeddedBrowser = typeof window !== "undefined" && isInAppBrowser();
  const openInChrome = () => {
    const fallback = encodeURIComponent(customerInstallUrl);
    window.location.href = `intent://www.meripahalfasthelp.online/customer-app?install=1#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${fallback};end`;
  };
  const copyInstallLink = async () => {
    await navigator.clipboard.writeText(customerInstallUrl);
    setCopied(true);
  };

  const appName = APP_NAMES[kind];
  const installed = state === "installed";
  const installing = state === "installing";
  const available = state === "available";
  const label = installed
    ? `Open ${appName}`
    : installing
      ? `Installing ${appName}...`
      : available
        ? `Install ${appName}`
        : `How to install ${appName}`;

  return (
    <>
      <button
        type="button"
        onClick={install}
        disabled={installing || state === "checking"}
        className={
          className ??
          "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-6 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800"
        }
        aria-label={label}
      >
        {installed ? (
          <ExternalLink className="h-4 w-4" />
        ) : installing || state === "checking" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : available ? (
          <Download className="h-4 w-4" />
        ) : (
          <Smartphone className="h-4 w-4" />
        )}
        {label}
      </button>

      {installing ? (
        <div
          className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2 font-bold">
            <Loader2 className="h-4 w-4 animate-spin" /> Installing Nexora…
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-amber-200">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-amber-600" />
          </div>
          <p className="mt-2 text-xs leading-5">
            Please wait. Android will confirm when the app has been added to your home screen.
          </p>
        </div>
      ) : installed ? (
        <p
          className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-800"
          role="status"
          aria-live="polite"
        >
          <CheckCircle2 className="h-4 w-4" /> App installed successfully. Nexora is on your home
          screen.
        </p>
      ) : null}

      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-md overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {state === "ios"
                ? `Install ${appName} on iPhone or iPad`
                : embeddedBrowser
                  ? `Open Chrome to install ${appName}`
                  : `Install ${appName}`}
            </DialogTitle>
            <DialogDescription>
              {state === "cancelled"
                ? "Installation was cancelled. Reload this page when you want to try again."
                : state === "ios"
                  ? "Safari installs this app from its Share menu."
                  : embeddedBrowser
                    ? "This app was opened inside another app. Android installs it from Chrome."
                    : "Use your browser's Install app or Add to Home screen option."}
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
          ) : embeddedBrowser && android ? (
            <div className="space-y-3 text-sm text-slate-700">
              <p>Tap below to open the official Nexora install page directly in Chrome.</p>
              <p>In Chrome, stay on the page briefly, then tap Install Customer App.</p>
            </div>
          ) : (
            <div className="space-y-3 text-sm text-slate-700">
              <p>
                On Android or desktop, open the browser menu and choose Install app. If Chrome has
                just opened the page, tap once and wait briefly for the install option to appear.
              </p>
              <p>No APK is downloaded. Nexora installs securely from this website.</p>
            </div>
          )}
          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
            {embeddedBrowser && android ? (
              <>
                <Button variant="outline" onClick={copyInstallLink}>
                  <Copy className="mr-2 h-4 w-4" /> {copied ? "Link copied" : "Copy link"}
                </Button>
                <Button onClick={openInChrome}>
                  <ExternalLink className="mr-2 h-4 w-4" /> Open in Chrome
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setHelpOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => window.location.assign(fallbackHref)}>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Continue in browser
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

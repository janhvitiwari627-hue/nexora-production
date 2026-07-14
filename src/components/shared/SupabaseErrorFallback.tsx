import { AlertTriangle, RefreshCw, Home, Database, KeyRound, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";

export type SupabaseErrorKind = "missing-env" | "auth" | "network" | "unknown";

export function detectSupabaseErrorKind(error: unknown): SupabaseErrorKind | null {
  const msg = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  if (!msg) return null;
  const m = msg.toLowerCase();
  if (m.includes("missing supabase environment") || m.includes("supabase_url") && m.includes("missing")) {
    return "missing-env";
  }
  if (m.includes("connect supabase in lovable cloud")) return "missing-env";
  if (m.includes("jwt") || m.includes("unauthorized") || m.includes("invalid api key") || m.includes("not authenticated")) {
    return "auth";
  }
  if (m.includes("failed to fetch") || m.includes("network") || m.includes("networkerror")) {
    return "network";
  }
  if (m.includes("supabase")) return "unknown";
  return null;
}

const COPY: Record<SupabaseErrorKind, { icon: any; title: string; body: string; steps: string[] }> = {
  "missing-env": {
    icon: Database,
    title: "Backend isn't connected",
    body: "The app can't reach the database because the Lovable Cloud connection isn't configured.",
    steps: [
      "Open the Backend panel from the top of the editor.",
      "Verify Lovable Cloud is enabled for this project.",
      "Wait a few seconds after reconnecting, then reload this page.",
    ],
  },
  auth: {
    icon: KeyRound,
    title: "Your session has expired",
    body: "We couldn't verify who you are. Signing in again should fix this in a moment.",
    steps: [
      "Sign out and sign back in to refresh your session.",
      "If you just changed accounts, clear browser storage for this site.",
      "Still stuck? Reload the page and try once more.",
    ],
  },
  network: {
    icon: Wifi,
    title: "Can't reach the server",
    body: "Your device is online but the backend didn't respond. This is usually temporary.",
    steps: [
      "Check your internet connection.",
      "Disable any VPN or ad-blocker that might be filtering requests.",
      "Retry in a few seconds — the service may be briefly unavailable.",
    ],
  },
  unknown: {
    icon: AlertTriangle,
    title: "Something went wrong",
    body: "We hit an unexpected backend error. Trying again usually resolves it.",
    steps: [
      "Reload the page.",
      "If it keeps happening, sign out and back in.",
      "Contact support if the problem persists.",
    ],
  },
};

export function SupabaseErrorFallback({
  kind,
  error,
  onRetry,
}: {
  kind: SupabaseErrorKind;
  error?: Error;
  onRetry?: () => void;
}) {
  const { icon: Icon, title, body, steps } = COPY[kind];
  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 text-center shadow-sm">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
          <Icon className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-semibold text-heading">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{body}</p>

        <ol className="mt-5 space-y-2 text-left text-sm">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-2 rounded-lg bg-muted/60 px-3 py-2">
              <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                {i + 1}
              </span>
              <span className="text-body">{s}</span>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button
            onClick={() => {
              onRetry?.();
              if (typeof window !== "undefined") window.location.reload();
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
          <Button variant="outline" asChild>
            <a href="/">
              <Home className="mr-2 h-4 w-4" />
              Go home
            </a>
          </Button>
        </div>

        {error?.message && (
          <details className="mt-4 text-left text-xs text-muted-foreground">
            <summary className="cursor-pointer select-none">Technical details</summary>
            <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-muted/60 p-2">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

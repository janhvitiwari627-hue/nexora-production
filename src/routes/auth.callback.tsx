import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import { resolvePostLoginRedirect } from "@/lib/auth-redirect";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackPage,
});

function sanitizeNext(next: string | null): string | null {
  if (!next) return null;
  // only allow same-origin relative paths
  if (!next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}

const RECOVERY_ERROR_MESSAGE =
  "Reset link expired or already used. Please request a new password reset link.";

type CallbackResult =
  | { ok: true; redirectTo: string }
  | { ok: false; message: string };

type AuthCallbackWindow = Window & {
  __nxAuthCallbackPromise?: Promise<CallbackResult>;
  __nxAuthCallbackKey?: string;
};

function getHashParams(url: URL) {
  return new URLSearchParams(url.hash.replace(/^#/, ""));
}

function isRecoveryCallback(url: URL, next: string | null, hash: URLSearchParams) {
  return (
    next === "/reset-password" ||
    url.searchParams.get("type") === "recovery" ||
    hash.get("type") === "recovery"
  );
}

function hasCallbackPayload(url: URL, hash: URLSearchParams) {
  return Boolean(
    url.searchParams.get("code") ||
      url.searchParams.get("token_hash") ||
      url.searchParams.get("error") ||
      url.searchParams.get("error_description") ||
      hash.get("access_token") ||
      hash.get("error") ||
      hash.get("error_description"),
  );
}

function callbackKey(url: URL) {
  return `${url.pathname}${url.search}${url.hash}`;
}

function friendlyFailure(recovery: boolean, message?: string): CallbackResult {
  const lower = (message ?? "").toLowerCase();
  if (
    recovery ||
    lower.includes("refresh token") ||
    lower.includes("token") ||
    lower.includes("expired") ||
    lower.includes("invalid")
  ) {
    return { ok: false, message: RECOVERY_ERROR_MESSAGE };
  }
  return { ok: false, message: "Authentication failed. Please try again." };
}

function cleanCallbackUrl(next: string | null) {
  const clean = new URL(window.location.href);
  clean.searchParams.delete("code");
  clean.searchParams.delete("token_hash");
  clean.searchParams.delete("type");
  clean.searchParams.delete("error");
  clean.searchParams.delete("error_code");
  clean.searchParams.delete("error_description");
  if (next) clean.searchParams.set("next", next);
  clean.hash = "";
  window.history.replaceState({}, document.title, `${clean.pathname}${clean.search}`);
}

async function waitForSession(): Promise<Session | null> {
  for (let i = 0; i < 8; i++) {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) return data.session;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return null;
}

async function resolveCallbackResult(): Promise<CallbackResult> {
  const url = new URL(window.location.href);
  const next = sanitizeNext(url.searchParams.get("next"));
  const hash = getHashParams(url);
  const recovery = isRecoveryCallback(url, next, hash);

  const urlError = url.searchParams.get("error_description") || hash.get("error_description");
  if (urlError || url.searchParams.get("error") || hash.get("error")) {
    cleanCallbackUrl(next);
    return friendlyFailure(recovery, urlError ?? undefined);
  }

  const code = url.searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return friendlyFailure(recovery, error.message);
    cleanCallbackUrl(next);

    const session = await waitForSession();
    if (!session) return friendlyFailure(recovery);

    if (next) return { ok: true, redirectTo: next };
    return { ok: true, redirectTo: await resolvePostLoginRedirect(session.user.id) };
  }

  const tokenHash = url.searchParams.get("token_hash");
  const otpType = url.searchParams.get("type");
  if (tokenHash && otpType) {
    cleanCallbackUrl(next);
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: otpType as any,
    });
    if (error) return friendlyFailure(recovery, error.message);

    const session = await waitForSession();
    if (!session) return friendlyFailure(recovery);

    if (next) return { ok: true, redirectTo: next };
    return { ok: true, redirectTo: await resolvePostLoginRedirect(session.user.id) };
  }

  if (hash.get("access_token")) {
    const session = await waitForSession();
    if (!session) return friendlyFailure(recovery);
    cleanCallbackUrl(next);
    if (next) return { ok: true, redirectTo: next };
    return { ok: true, redirectTo: await resolvePostLoginRedirect(session.user.id) };
  }

  const session = await waitForSession();
  if (session?.user) {
    if (next) return { ok: true, redirectTo: next };
    return { ok: true, redirectTo: await resolvePostLoginRedirect(session.user.id) };
  }

  return friendlyFailure(recovery);
}

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const win = window as AuthCallbackWindow;
        const url = new URL(window.location.href);
        const hash = getHashParams(url);
        const key = callbackKey(url);
        if (!win.__nxAuthCallbackPromise || (hasCallbackPayload(url, hash) && win.__nxAuthCallbackKey !== key)) {
          win.__nxAuthCallbackKey = key;
          win.__nxAuthCallbackPromise = resolveCallbackResult();
        }
        const result = await win.__nxAuthCallbackPromise;
        if (result.ok) {
          navigate({ to: result.redirectTo });
          return;
        }
        setErrorMessage(result.message);
        setStatus("error");
      } catch (err) {
        setErrorMessage(RECOVERY_ERROR_MESSAGE);
        setStatus("error");
      }
    };
    run();
  }, [navigate]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Completing sign in...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center py-12 space-y-4 text-center">
          <p className="text-destructive font-medium">Reset link expired</p>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate({ to: "/login" })}>
              Back to login
            </Button>
            <Button onClick={() => navigate({ to: "/forgot-password" })}>
              Request new link
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

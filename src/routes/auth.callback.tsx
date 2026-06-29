import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const url = new URL(window.location.href);
        const next = sanitizeNext(url.searchParams.get("next"));

        // Surface explicit errors from Supabase (query OR hash)
        const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
        const errDesc =
          url.searchParams.get("error_description") || hash.get("error_description");
        if (errDesc) {
          setErrorMessage(errDesc);
          setStatus("error");
          return;
        }

        // PKCE flow: ?code=...
        const code = url.searchParams.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            setErrorMessage(error.message);
            setStatus("error");
            return;
          }
        }

        // Email link OTP flow: ?token_hash=...&type=recovery|signup|magiclink|...
        const tokenHash = url.searchParams.get("token_hash");
        const otpType = url.searchParams.get("type");
        if (tokenHash && otpType) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            type: otpType as any,
          });
          if (error) {
            setErrorMessage(error.message);
            setStatus("error");
            return;
          }
        }

        // Implicit flow (#access_token=...&type=recovery) — supabase-js picks it up automatically.
        // Just wait briefly for session to materialize.
        const { data } = await supabase.auth.getSession();
        if (!data.session?.user) {
          // Try one short retry — implicit hash parse is async.
          await new Promise((r) => setTimeout(r, 300));
        }

        const { data: data2 } = await supabase.auth.getSession();
        if (!data2.session?.user) {
          setErrorMessage("Authentication failed. No session found.");
          setStatus("error");
          return;
        }

        if (next) {
          navigate({ to: next });
          return;
        }
        const redirectTo = await resolvePostLoginRedirect(data2.session.user.id);
        navigate({ to: redirectTo });
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : "Authentication failed");
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
          <p className="text-destructive font-medium">Sign in failed</p>
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

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

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log("[Auth Callback] Processing OAuth callback...");
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("[Auth Callback] Error getting session:", error);
          setErrorMessage(error.message);
          setStatus("error");
          return;
        }

        if (!data.session?.user) {
          console.error("[Auth Callback] No session found after OAuth callback");
          setErrorMessage("Authentication failed. No session found.");
          setStatus("error");
          return;
        }

        console.log("[Auth Callback] Session established for user:", data.session.user.id);

        const redirectTo = await resolvePostLoginRedirect(data.session.user.id);
        setStatus("success");
        navigate({ to: redirectTo });
      } catch (err) {
        console.error("[Auth Callback] Unexpected error:", err);
        setErrorMessage(err instanceof Error ? err.message : "Authentication failed");
        setStatus("error");
      }
    };

    handleCallback();
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

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12 space-y-4 text-center">
            <p className="text-destructive font-medium">Sign in failed</p>
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
            <Button variant="outline" onClick={() => navigate({ to: "/login" })}>
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2 } from "lucide-react";
import { PublicPageHeader } from "@/components/shared/PublicPageHeader";

function scorePassword(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ["Too short", "Weak", "Fair", "Good", "Strong", "Excellent"];
  const colors = [
    "bg-destructive",
    "bg-destructive",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-green-500",
    "bg-emerald-600",
  ];
  return { score, label: labels[score], color: colors[score] };
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [hasRecovery, setHasRecovery] = useState<boolean | null>(null);

  // A valid recovery session can arrive via:
  //  - PASSWORD_RECOVERY auth event (implicit hash flow)
  //  - an existing session after /auth/callback exchanged the code
  //  - hash containing type=recovery
  useEffect(() => {
    let cancelled = false;
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setHasRecovery(true);
      }
    });

    const check = async () => {
      if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) {
        if (!cancelled) setHasRecovery(true);
        return;
      }
      // Allow a brief moment for implicit/PKCE session to land
      for (let i = 0; i < 6; i++) {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          if (!cancelled) setHasRecovery(true);
          return;
        }
        await new Promise((r) => setTimeout(r, 250));
      }
      if (!cancelled) setHasRecovery(false);
    };
    check();

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const strength = useMemo(() => scorePassword(password), [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setSubmitting(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) {
        setError(err.message);
        return;
      }
      setDone(true);
      setTimeout(() => navigate({ to: "/login" }), 1500);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <PublicPageHeader />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Set a new password</CardTitle>
          <CardDescription>Choose a strong password you haven't used before.</CardDescription>
        </CardHeader>
        <CardContent>
          {hasRecovery === false ? (
            <Alert variant="destructive">
              <AlertDescription>
                This password reset link is invalid or has expired. Please request a new one.
              </AlertDescription>
            </Alert>
          ) : done ? (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>Password updated. Redirecting to sign in…</AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-1">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                {password && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded ${
                            i < strength.score ? strength.color : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">{strength.label}</p>
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update password
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

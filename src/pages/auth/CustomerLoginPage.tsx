import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { BackButton } from "@/components/shared/BackButton";
import { resolvePostLoginRedirect } from "@/lib/auth-redirect";
import { useAuthStore } from "@/stores/authStore";

const normalizeEmail = (value: string) => value.trim().toLowerCase();
const RESET_REDIRECT_TO = "https://meripahalfasthelp.online/auth/callback?next=/reset-password";

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255),
  password: z.string().min(1, "Password is required").max(72),
});

export default function CustomerLoginPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const [form, setForm] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loginFailedForEmail, setLoginFailedForEmail] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isInitialized || !user) return;
    let cancelled = false;
    void resolvePostLoginRedirect(user.id).then((redirectTo) => {
      if (!cancelled) navigate({ to: redirectTo, replace: true });
    });
    return () => {
      cancelled = true;
    };
  }, [isInitialized, navigate, user]);

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    // Clear server error and field error when user starts typing
    if (serverError) setServerError(null);
    if (key === "email") {
      setLoginFailedForEmail(null);
      setResetSent(false);
    }
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const sendResetLink = async () => {
    const email = normalizeEmail(loginFailedForEmail || form.email);
    const parsed = loginSchema.shape.email.safeParse(email);
    if (!parsed.success) {
      setServerError("Please enter the registered email address first.");
      return;
    }

    setResetSubmitting(true);
    setServerError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: RESET_REDIRECT_TO,
      });
      if (error) {
        setResetSent(true);
        return;
      }
      setResetSent(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Could not send reset link. Please try again.");
    } finally {
      setResetSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setErrors({});

    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) {
      const flat: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const k = String(issue.path[0]);
        if (!flat[k]) flat[k] = issue.message;
      }
      setErrors(flat);
      return;
    }

    // Additional validation for empty fields
    if (!parsed.data.email.trim() || !parsed.data.password) {
      setServerError("Please enter both email and password");
      return;
    }

    const email = normalizeEmail(parsed.data.email);

    setSubmitting(true);
    console.log("[Login] Attempting sign in with email:", email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: parsed.data.password,
      });

      console.log("[Login] Supabase response:", { data: !!data.user, error: error?.message });

      if (error) {
        // Provide specific error messages based on Supabase error codes
        let errorMessage = "Invalid email or password";
        if (error.message.includes("Email not confirmed")) {
          errorMessage = "Please verify your email before signing in. Check your inbox for the confirmation link.";
        } else if (error.message.includes("Invalid login credentials") || error.message.includes("Invalid email or password")) {
          errorMessage = "Email/password match nahi ho raha. Registered email exactly use karein (jaise forcallertune11@gmail.com), ya password reset karein.";
          setLoginFailedForEmail(email);
          setResetSent(false);
        } else if (error.message.includes("User not found") || error.message.includes("signup")) {
          errorMessage = "No account found with this email. Please sign up first.";
        } else if (error.message.includes("network") || error.message.includes("fetch") || error.message.includes("connection")) {
          errorMessage = "Network error. Please check your connection and try again.";
        }
        console.error("[Login] Auth error:", error.message);
        setServerError(errorMessage);
        return;
      }

      if (!data.user) {
        console.error("[Login] No user returned from Supabase");
        setServerError("Sign in failed. Please try again.");
        return;
      }

      console.log("[Login] Successfully signed in user:", data.user.id);
      if (data.session) {
        useAuthStore.getState().setSession(data.session);
      }

      // Profile is useful for personalization, but it must not invalidate a valid auth session.
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError) {
        console.error("[Login] Profile fetch error:", profileError.message);
      } else if (!profile) {
        console.error("[Login] Profile not found for user:", data.user.id);
      }
      await useAuthStore.getState().refreshProfile();

      // "Remember Me" off → clear persisted session on tab close.
      if (!rememberMe && typeof window !== "undefined") {
        const keys = Object.keys(localStorage).filter((k) => k.startsWith("sb-"));
        for (const k of keys) {
          const value = localStorage.getItem(k);
          if (value) sessionStorage.setItem(k, value);
          localStorage.removeItem(k);
        }
      }

      const redirectTo = await resolvePostLoginRedirect(data.user.id);
      navigate({ to: redirectTo });
    } catch (err) {
      console.error("[Login] Unexpected error:", err);
      setServerError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setServerError(null);
    setGoogleSubmitting(true);
    try {
      console.log("[Login] Initiating Google OAuth...");
      const { lovable } = await import("@/integrations/lovable/index");
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });

      if (result.error) {
        console.error("[Login] Google OAuth error:", result.error.message ?? result.error);
        setServerError("Google sign-in failed. Please try again.");
        return;
      }

      if (result.redirected) {
        console.log("[Login] Google OAuth initiated, redirecting...");
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        useAuthStore.getState().setSession(data.session);
        await useAuthStore.getState().refreshProfile();
        const redirectTo = await resolvePostLoginRedirect(data.session.user.id);
        navigate({ to: redirectTo, replace: true });
      } else {
        navigate({ to: "/", replace: true });
      }

    } catch (err) {
      console.error("[Login] Google OAuth unexpected error:", err);
      setServerError(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setGoogleSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <BackButton className="mb-3" />
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in to manage bookings, rewards and more.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogle}
            disabled={googleSubmitting || submitting}
          >
            {googleSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or with email</span>
            </div>
          </div>

          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={update("email")}
                autoComplete="email"
                required
                disabled={submitting}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">Password <span className="text-xs text-muted-foreground">(minimum 8 characters)</span></Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={update("password")}
                  autoComplete="current-password"
                  required
                  minLength={8}
                  className="pr-10"
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                  disabled={submitting}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={rememberMe}
                  onCheckedChange={(v) => setRememberMe(Boolean(v))}
                  disabled={submitting}
                />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>

            {loginFailedForEmail && (
              <Alert className="border-primary/20 bg-primary/5">
                <AlertDescription className="space-y-2 text-sm">
                  <p>
                    Ye email/password match nahi ho raha. Account list me jo exact email hai wahi enter karein, phir bhi issue ho to reset link bhejein.
                  </p>
                  {resetSent ? (
                    <p className="font-medium text-primary">Reset link sent. Inbox/spam check karke new password set karein.</p>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={sendResetLink}
                      disabled={resetSubmitting || submitting}
                    >
                      {resetSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Send password reset link
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </form>

          <p className="text-center text-sm text-muted-foreground">
            New to Nexora?{" "}
            <Link to="/signup" className="text-primary underline-offset-4 hover:underline">
              Create an account
            </Link>
          </p>
          <p className="text-center text-sm text-muted-foreground">
            Salon or shop owner?{" "}
            <Link to="/owner-signup" className="text-primary underline-offset-4 hover:underline">
              Register your business
            </Link>
          </p>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
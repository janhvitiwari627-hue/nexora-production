import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { PasswordStrengthIndicator, scorePassword } from "@/components/auth/PasswordStrengthIndicator";
import { useAuthStore } from "@/stores/authStore";
import { resolvePostLoginRedirect } from "@/lib/auth-redirect";

const schema = z
  .object({
    full_name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().trim().email("Invalid email address").max(255),
    mobile: z
      .string()
      .trim()
      .regex(/^[+]?[0-9]{10,15}$/, "Enter a valid mobile number"),
    password: z.string().min(8, "Password must be at least 8 characters").max(72),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match",
  });

function parseErr(error: unknown): string {
  if (!error) return "Something went wrong. Please try again.";
  if (typeof error === "string") return error;
  if (typeof error === "object") {
    const e = error as { message?: string; error_description?: string };
    return e.message || e.error_description || "Something went wrong. Please try again.";
  }
  return "Something went wrong. Please try again.";
}

export default function SignupPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    mobile: "",
    password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<null | "verify" | "signed_in">(null);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const pwStrength = useMemo(() => scorePassword(form.password), [form.password]);

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
    const v = e.target.value;
    setForm((f) => ({ ...f, [key]: v }));
    if (serverError) setServerError(null);
    if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setErrors({});

    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const flat: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const k = String(issue.path[0]);
        if (!flat[k]) flat[k] = issue.message;
      }
      setErrors(flat);
      return;
    }
    if (pwStrength.score < 2) {
      setErrors((e) => ({ ...e, password: "Password is too weak" }));
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: parsed.data.email.trim(),
        password: parsed.data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: parsed.data.full_name,
            mobile: parsed.data.mobile,
            // Force customer role — trigger ignores unknown/disallowed roles
            role: "customer",
          },
        },
      });

      if (error) {
        const raw = parseErr(error);
        let msg = raw;
        if (/already registered|already exists/i.test(raw)) {
          msg = "Email already registered. Please sign in instead.";
        } else if (/weak password|pwned|breach/i.test(raw)) {
          msg = "Password is too weak or commonly used. Choose a stronger one.";
        } else if (/rate limit|too many/i.test(raw)) {
          msg = "Too many attempts. Please try again shortly.";
        }
        setServerError(msg);
        return;
      }

      // Email confirmation required → no session returned
      if (!data.session && data.user) {
        setSuccess("verify");
        return;
      }

      // Auto-confirm enabled → signed in
      if (data.session) {
        useAuthStore.getState().setSession(data.session);
        await useAuthStore.getState().refreshProfile();
        setSuccess("signed_in");
        const redirectTo = await resolvePostLoginRedirect(data.session.user.id);
        setTimeout(() => navigate({ to: redirectTo, replace: true }), 800);
      }
    } catch (err) {
      setServerError(parseErr(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (success === "verify") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We've sent a confirmation link to <strong>{form.email}</strong>. Click the link to verify your
              account, then sign in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate({ to: "/login" })}>
              Go to Sign in
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success === "signed_in") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Welcome to Nexora!</CardTitle>
            <CardDescription>Your account has been created. Redirecting…</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>Sign up as a customer to discover and book salons.</CardDescription>
        </CardHeader>
        <CardContent>
          {serverError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Full name</Label>
              <Input
                id="full_name"
                autoComplete="name"
                value={form.full_name}
                onChange={update("full_name")}
                disabled={submitting}
              />
              {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={update("email")}
                disabled={submitting}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mobile">Phone</Label>
              <Input
                id="mobile"
                type="tel"
                autoComplete="tel"
                placeholder="+91 9876543210"
                value={form.mobile}
                onChange={update("mobile")}
                disabled={submitting}
              />
              {errors.mobile && <p className="text-xs text-destructive">{errors.mobile}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={update("password")}
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.password && <PasswordStrengthIndicator password={form.password} />}
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm_password">Confirm password</Label>
              <div className="relative">
                <Input
                  id="confirm_password"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.confirm_password}
                  onChange={update("confirm_password")}
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirm_password && (
                <p className="text-xs text-destructive">{errors.confirm_password}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create account
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Are you a salon owner?{" "}
            <Link to="/owner-signup" className="text-primary hover:underline">
              Register your business
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

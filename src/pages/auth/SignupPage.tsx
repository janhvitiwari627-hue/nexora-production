import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { getEmailRole, roleConflictMessage } from "@/lib/auth-check.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, CheckCircle2, AlertTriangle } from "lucide-react";
import {
  PasswordStrengthIndicator,
  scorePassword,
} from "@/components/auth/PasswordStrengthIndicator";
import { BackButton } from "@/components/shared/BackButton";
import { useAuthStore } from "@/stores/authStore";
import { resolvePostLoginRedirect } from "@/lib/auth-redirect";
import { requestPasswordReset } from "@/lib/password-reset";
import { validateReferralCode } from "@/lib/owner.functions";

const normalizeEmail = (value: string) => value.trim().toLowerCase();

const emailOnlySchema = z.string().trim().email("Invalid email address").max(255);

const schema = z
  .object({
    full_name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().trim().email("Invalid email address").max(255),
    mobile: z
      .string()
      .trim()
      .min(1, "Mobile number is required")
      .transform((v) => v.replace(/[\s-]/g, ""))
      .pipe(z.string().regex(/^(\+91)?[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")),
    password: z.string().min(8, "Password must be at least 8 characters").max(72),
    confirm_password: z.string(),
    gender: z.enum(["male", "female"], {
      message: "Please select Male or Female",
    }),
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
  const search = useSearch({ strict: false }) as { ref?: string };
  const user = useAuthStore((s) => s.user);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    mobile: "",
    password: "",
    confirm_password: "",
    gender: "" as "" | "male" | "female",
  });
  const urlRef = (search?.ref ?? "").trim().slice(0, 20);
  const referredBy = useMemo(() => {
    if (typeof window === "undefined") return urlRef;
    const KEY = "nexora_pending_ref";
    if (urlRef) {
      try {
        window.sessionStorage.setItem(KEY, urlRef);
      } catch {
        /* ignore */
      }
      return urlRef;
    }
    try {
      return (window.sessionStorage.getItem(KEY) ?? "").slice(0, 20);
    } catch {
      return "";
    }
  }, [urlRef]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [alreadyRegisteredEmail, setAlreadyRegisteredEmail] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [success, setSuccess] = useState<null | "verify" | "signed_in">(null);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const pwStrength = useMemo(() => scorePassword(form.password), [form.password]);
  const checkEmailRoleFn = useServerFn(getEmailRole);
  const validateRefFn = useServerFn(validateReferralCode);
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const [refInvalid, setRefInvalid] = useState(false);
  const [refChecking, setRefChecking] = useState(false);
  const [refCheckFailed, setRefCheckFailed] = useState(false);

  useEffect(() => {
    if (!referredBy) {
      setReferrerName(null);
      setRefInvalid(false);
      setRefChecking(false);
      setRefCheckFailed(false);
      return;
    }
    let cancelled = false;
    setRefChecking(true);
    setRefCheckFailed(false);
    setRefInvalid(false);
    setReferrerName(null);
    void validateRefFn({ data: { code: referredBy } })
      .then((res) => {
        if (cancelled) return;
        if (res.valid) {
          setReferrerName(res.referrerName ?? null);
          setRefInvalid(false);
        } else {
          setReferrerName(null);
          setRefInvalid(true);
          try {
            window.sessionStorage.removeItem("nexora_pending_ref");
          } catch {
            /* ignore */
          }
        }
      })
      .catch(() => {
        if (cancelled) return;
        // Fail-closed: if we can't verify, do NOT credit anyone.
        setReferrerName(null);
        setRefInvalid(true);
        setRefCheckFailed(true);
      })
      .finally(() => {
        if (!cancelled) setRefChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [referredBy, validateRefFn]);

  // Only send referral to backend when we have CONFIRMED it's valid (name resolved).
  const referralConfirmed = Boolean(
    referredBy && !refInvalid && !refChecking && referrerName,
  );


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
    if (key === "email") {
      setAlreadyRegisteredEmail(null);
      setResetSent(false);
    }
    if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
    if ((key === "password" || key === "confirm_password") && errors.confirm_password) {
      setErrors((p) => ({ ...p, confirm_password: "" }));
    }
  };

  const sendResetLink = async () => {
    const email = normalizeEmail(alreadyRegisteredEmail || form.email);
    const parsed = emailOnlySchema.safeParse(email);
    if (!parsed.success) {
      setServerError("Please enter the registered email address first.");
      return;
    }

    setResetSubmitting(true);
    setServerError(null);
    try {
      await requestPasswordReset(email);
      setResetSent(true);
    } catch (err) {
      setServerError(parseErr(err));
    } finally {
      setResetSubmitting(false);
    }
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
      const email = normalizeEmail(parsed.data.email);

      // Enforce one-email-one-role before creating the auth user
      try {
        const check = await checkEmailRoleFn({ data: { email } });
        if (check.exists) {
          setAlreadyRegisteredEmail(email);
          setServerError(roleConflictMessage(check.roleLabel, "Customer"));
          return;
        }
      } catch {
        // Non-fatal: if check fails, Supabase signUp will still block dupes
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password: parsed.data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: parsed.data.full_name,
            mobile: parsed.data.mobile,
            referred_by: referralConfirmed ? referredBy : null,
            gender: parsed.data.gender,
            // Force customer role — trigger ignores unknown/disallowed roles
            role: "customer",
          },
        },
      });

      if (error) {
        const raw = parseErr(error);
        let msg = raw;
        if (/already registered|already exists/i.test(raw)) {
          msg =
            "Email already registered hai. Please sign in karein, ya password bhool gaye hain to reset link bhejein.";
          setAlreadyRegisteredEmail(email);
          setResetSent(false);
        } else if (/weak password|pwned|breach/i.test(raw)) {
          msg = "Password is too weak or commonly used. Choose a stronger one.";
        } else if (/rate limit|too many/i.test(raw)) {
          msg = "Too many attempts. Please try again shortly.";
        }
        setServerError(msg);
        return;
      }

      // Auto-confirm enabled — ensure a session even if signUp didn't return one
      let session = data.session;
      if (!session && data.user) {
        const { data: signInData } = await supabase.auth.signInWithPassword({
          email,
          password: parsed.data.password,
        });
        session = signInData.session ?? null;
      }

      if (session) {
        useAuthStore.getState().setSession(session);
        await useAuthStore.getState().refreshProfile();
        try {
          window.sessionStorage.removeItem("nexora_pending_ref");
        } catch {
          /* ignore */
        }
        setSuccess("signed_in");
        const redirectTo = await resolvePostLoginRedirect(session.user.id);
        setTimeout(() => navigate({ to: redirectTo, replace: true }), 1500);
      }
    } catch (err) {
      setServerError(parseErr(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (success === "signed_in") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-md">
          <BackButton className="mb-3" />
          <Card className="w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Welcome to Nexora!</CardTitle>
              <CardDescription>Your account has been created. Redirecting…</CardDescription>
            </CardHeader>
            {referralConfirmed ? (
              <CardContent>
                <div className="border-primary/20 bg-primary/5 rounded-xl border p-4 text-center">
                  <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                    Referral confirmed
                  </p>
                  <p className="text-heading mt-1 text-base font-bold">{referrerName}</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Referrer code{" "}
                    <strong className="text-foreground font-mono tracking-wider">{referredBy}</strong>
                  </p>
                </div>
              </CardContent>
            ) : null}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <BackButton className="mb-3" />
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Create your account</CardTitle>
            <CardDescription>Sign up as a customer to discover and book salons.</CardDescription>
          </CardHeader>
          <CardContent>
            {typeof serverError === "string" && serverError.trim().length > 0 && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{serverError.trim()}</AlertDescription>
              </Alert>
            )}

            {alreadyRegisteredEmail && (
              <Alert className="mb-4 border-primary/20 bg-primary/5">
                <AlertDescription className="space-y-2 text-sm">
                  <p>
                    <strong>{alreadyRegisteredEmail}</strong> already registered hai. Same account
                    use karne ke liye login karein.
                  </p>
                  {resetSent ? (
                    <p className="font-medium text-primary">
                      Reset link sent. Inbox/spam check karke new password set karein.
                    </p>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Button type="button" variant="outline" size="sm" asChild>
                        <Link to="/login">Go to login</Link>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={sendResetLink}
                        disabled={resetSubmitting || submitting}
                      >
                        {resetSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Reset password
                      </Button>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {referredBy && refChecking && (
              <Alert className="mb-4">
                <AlertDescription className="text-sm flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying referral code{" "}
                  <strong className="font-mono">{referredBy}</strong>…
                </AlertDescription>
              </Alert>
            )}

            {referralConfirmed && (
              <Alert className="mb-4 border-primary/20 bg-primary/5">
                <AlertDescription className="text-sm">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>
                      Invited by <strong>{referrerName}</strong> · code{" "}
                      <strong className="font-mono">{referredBy}</strong>
                    </span>
                  </span>
                  <span className="block text-xs text-muted-foreground mt-1">
                    Credit will go to this referrer only.
                  </span>
                </AlertDescription>
              </Alert>
            )}

            {referredBy && refInvalid && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong className="block mb-1">
                    {refCheckFailed
                      ? "Referral code could not be verified"
                      : "Invalid or expired referral code"}
                  </strong>
                  <span className="block">
                    Code <strong className="font-mono">{referredBy}</strong>{" "}
                    {refCheckFailed
                      ? "couldn't be checked right now. To protect the wrong account from getting credit, we won't apply any referral."
                      : "doesn't match any active referrer. No referral credit will be applied."}
                    {" "}You can continue signing up without a referral, or double-check the link with the person who shared it.
                  </span>
                </AlertDescription>
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
                <Label>Gender</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setForm((current) => ({
                          ...current,
                          gender: option.value as "male" | "female",
                        }));
                        setErrors((current) => ({ ...current, gender: "" }));
                      }}
                      disabled={submitting}
                      className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
                        form.gender === option.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "bg-background text-foreground hover:border-primary/40"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  This helps us show relevant salons and services.
                </p>
                {errors.gender && <p className="text-xs text-destructive">{errors.gender}</p>}
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
    </div>
  );
}

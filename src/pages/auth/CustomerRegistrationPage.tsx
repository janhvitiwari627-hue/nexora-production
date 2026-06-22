import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Mail, CheckCircle2, User, Building2, BadgeCheck, XCircle, Crown } from "lucide-react";
import { PasswordStrengthIndicator, scorePassword } from "@/components/auth/PasswordStrengthIndicator";
import { validateReferralCode, registerMySalon } from "@/lib/owner.functions";
import { registerDistrictPartner } from "@/lib/districtPartner.functions";

type AccountType = "customer" | "owner" | "district_partner";

const baseSchema = z.object({
  full_name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  mobile: z
    .string()
    .trim()
    .regex(/^[+]?[0-9]{10,15}$/, "Enter a valid mobile number"),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
  referred_by: z.string().trim().max(20).optional().or(z.literal("")),
});
const ownerSchema = baseSchema.extend({
  business_name: z.string().trim().min(2, "Business name is required").max(120),
  business_city: z.string().trim().max(80).optional().or(z.literal("")),
});
const dbpSchema = baseSchema.extend({
  district: z.string().trim().min(2, "District is required").max(80),
  state: z.string().trim().max(80).optional().or(z.literal("")),
});

export default function CustomerRegistrationPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { ref?: string; role?: AccountType };
  const initialRole: AccountType =
    search?.role === "owner" || search?.role === "district_partner" ? search.role : "customer";
  const [accountType, setAccountType] = useState<AccountType>(initialRole);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    mobile: "",
    password: "",
    referred_by: "",
    business_name: "",
    business_city: "",
    district: "",
    state: "",
  });

  useEffect(() => {
    if (search?.ref) setForm((f) => (f.referred_by ? f : { ...f, referred_by: search.ref! }));
  }, [search?.ref]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);

  // Referral code live validation
  const [refStatus, setRefStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [refName, setRefName] = useState<string | null>(null);
  const validateRef = useServerFn(validateReferralCode);
  useEffect(() => {
    const code = form.referred_by.trim();
    if (!code) { setRefStatus("idle"); setRefName(null); return; }
    if (code.length < 3) { setRefStatus("idle"); return; }
    setRefStatus("checking");
    const t = setTimeout(async () => {
      try {
        const r = await validateRef({ data: { code } });
        setRefStatus(r.valid ? "valid" : "invalid");
        setRefName(r.referrerName);
      } catch {
        setRefStatus("invalid");
      }
    }, 400);
    return () => clearTimeout(t);
  }, [form.referred_by, validateRef]);

  const registerSalonFn = useServerFn(registerMySalon);
  const registerDbpFn = useServerFn(registerDistrictPartner);
  const pwStrength = useMemo(() => scorePassword(form.password), [form.password]);

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setErrors({});

    const schema =
      accountType === "owner" ? ownerSchema : accountType === "district_partner" ? dbpSchema : baseSchema;
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
    if (form.referred_by && refStatus === "invalid") {
      setErrors((e) => ({ ...e, referred_by: "Referral code not found" }));
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: parsed.data.full_name,
            mobile: parsed.data.mobile,
            referred_by: parsed.data.referred_by || null,
            role: accountType,
          },
        },
      });

      if (error) {
        setServerError(error.message?.trim() || "Sign up failed. Please try again.");
        return;
      }

      // If owner: register their salon (pending approval) once we have a session.
      if (accountType === "owner" && data.session) {
        try {
          await registerSalonFn({
            data: {
              name: form.business_name,
              phone: form.mobile,
              city: form.business_city || undefined,
            },
          });
        } catch (err) {
          console.error("Salon registration failed:", err);
        }
      }

      // If district partner: create DBP application after session.
      if (accountType === "district_partner" && data.session) {
        try {
          await registerDbpFn({
            data: {
              full_name: form.full_name,
              mobile: form.mobile,
              email: form.email,
              district: form.district,
              state: form.state || undefined,
            },
          });
        } catch (err) {
          console.error("DBP registration failed:", err);
        }
      }

      // No session yet → email confirmation required.
      if (!data.session) {
        setVerificationSent(true);
        return;
      }

      navigate({
        to:
          accountType === "owner"
            ? "/owner/pending"
            : accountType === "district_partner"
              ? "/partner/district"
              : "/",
      });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setServerError(null);
    setGoogleSubmitting(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        setServerError("Google sign-in failed. Please try again.");
        return;
      }
      if (result.redirected) return;
      navigate({ to: "/" });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setGoogleSubmitting(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We sent a verification link to <strong>{form.email}</strong>. Click it to activate your account.
              {accountType === "owner" && (
                <span className="mt-2 block text-xs">
                  After verifying, you'll wait for admin approval before accessing the owner dashboard.
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => setVerificationSent(false)}>
              Use a different email
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>Choose how you want to use Nexora.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={accountType} onValueChange={(v) => setAccountType(v as AccountType)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="customer" className="gap-1.5 text-xs sm:text-sm"><User className="h-3.5 w-3.5" />Customer</TabsTrigger>
              <TabsTrigger value="owner" className="gap-1.5 text-xs sm:text-sm"><Building2 className="h-3.5 w-3.5" />Salon Owner</TabsTrigger>
              <TabsTrigger value="district_partner" className="gap-1.5 text-xs sm:text-sm"><Crown className="h-3.5 w-3.5" />District Partner</TabsTrigger>
            </TabsList>
          </Tabs>

          {accountType === "district_partner" && (
            <Alert>
              <AlertDescription className="text-xs">
                District Business Partner application. After signup your application goes for verification — no joining fee, no investment, performance-based rewards.
              </AlertDescription>
            </Alert>
          )}

          {accountType === "customer" && (
            <Button
              type="button" variant="outline" className="w-full"
              onClick={handleGoogle} disabled={googleSubmitting}
            >
              {googleSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              Continue with Google
            </Button>
          )}

          {accountType === "customer" && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or with email</span>
              </div>
            </div>
          )}

          {serverError && <Alert variant="destructive"><AlertDescription>{serverError}</AlertDescription></Alert>}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" value={form.full_name} onChange={update("full_name")} autoComplete="name" required />
              {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={update("email")} autoComplete="email" required />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="mobile">Mobile {accountType === "customer" && <span className="text-xs text-muted-foreground">(optional)</span>}</Label>
              <Input
                id="mobile" type="tel" value={form.mobile} onChange={update("mobile")}
                autoComplete="tel" placeholder="+91 9876543210"
                required={accountType !== "customer"}
              />
              {errors.mobile && <p className="text-xs text-destructive">{errors.mobile}</p>}
            </div>

            {accountType === "owner" && (
              <>
                <div className="space-y-1">
                  <Label htmlFor="business_name">Business name</Label>
                  <Input id="business_name" value={form.business_name} onChange={update("business_name")} required placeholder="e.g. Luxe Hair & Spa" />
                  {errors.business_name && <p className="text-xs text-destructive">{errors.business_name}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="business_city">City <span className="text-xs text-muted-foreground">(optional)</span></Label>
                  <Input id="business_city" value={form.business_city} onChange={update("business_city")} placeholder="Mumbai" />
                </div>
              </>
            )}

            {accountType === "district_partner" && (
              <>
                <div className="space-y-1">
                  <Label htmlFor="district">District</Label>
                  <Input id="district" value={form.district} onChange={update("district")} required placeholder="e.g. Jaipur" />
                  {errors.district && <p className="text-xs text-destructive">{errors.district}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="state">State <span className="text-xs text-muted-foreground">(optional)</span></Label>
                  <Input id="state" value={form.state} onChange={update("state")} placeholder="Rajasthan" />
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={form.password} onChange={update("password")} autoComplete="new-password" required />
              <PasswordStrengthIndicator password={form.password} />
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="referred_by">Referral code <span className="text-xs text-muted-foreground">(optional)</span></Label>
              <div className="relative">
                <Input
                  id="referred_by" value={form.referred_by}
                  onChange={(e) => setForm((f) => ({ ...f, referred_by: e.target.value.toUpperCase() }))}
                  autoComplete="off" placeholder="e.g. ABC123" className="pr-9"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  {refStatus === "checking" && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  {refStatus === "valid" && <BadgeCheck className="h-4 w-4 text-success" />}
                  {refStatus === "invalid" && <XCircle className="h-4 w-4 text-destructive" />}
                </div>
              </div>
              {refStatus === "valid" && refName && <p className="text-xs text-success">Referred by {refName}</p>}
              {refStatus === "invalid" && form.referred_by && <p className="text-xs text-destructive">Referral code not found</p>}
              {errors.referred_by && <p className="text-xs text-destructive">{errors.referred_by}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
              {accountType === "owner" ? "Register business" : "Create account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary underline-offset-4 hover:underline">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

import { useMemo, useState } from "react";
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
import { Loader2, Eye, EyeOff, CheckCircle2, Building2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PasswordStrengthIndicator, scorePassword } from "@/components/auth/PasswordStrengthIndicator";
import { BackButton } from "@/components/shared/BackButton";

const CATEGORIES = [
  "Salon",
  "Spa",
  "Barber Shop",
  "Beauty Parlour",
  "Nail Studio",
  "Tattoo Studio",
  "Massage Center",
  "Wellness Clinic",
  "Other",
];

const schema = z.object({
  full_name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  mobile: z
    .string()
    .trim()
    .min(1, "Mobile number is required")
    .transform((v) => v.replace(/[\s-]/g, ""))
    .pipe(z.string().regex(/^(\+91)?[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
  confirm_password: z.string().min(1, "Confirm your password"),
  business_name: z.string().trim().min(2, "Business name is required").max(120),
  business_category: z.string().min(1, "Select a category"),
  city: z.string().trim().min(2, "City is required").max(80),
  area: z.string().trim().min(2, "Area is required").max(120),
  whatsapp: z
    .string()
    .trim()
    .min(1, "WhatsApp number is required")
    .transform((v) => v.replace(/[\s-]/g, ""))
    .pipe(z.string().regex(/^(\+91)?[6-9]\d{9}$/, "Enter a valid 10-digit WhatsApp number")),
}).refine((d) => d.password === d.confirm_password, {
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

export default function OwnerSignupPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { ref?: string };
  const referredBy = (search?.ref ?? "").trim().slice(0, 20);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    mobile: "",
    password: "",
    confirm_password: "",
    business_name: "",
    business_category: "",
    city: "",
    area: "",
    whatsapp: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const pwStrength = useMemo(() => scorePassword(form.password), [form.password]);
  const checkEmailRoleFn = useServerFn(getEmailRole);

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setForm((f) => ({ ...f, [key]: v }));
    if (serverError) setServerError(null);
    if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
    if ((key === "password" || key === "confirm_password") && errors.confirm_password) {
      setErrors((p) => ({ ...p, confirm_password: "" }));
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
      const email = parsed.data.email.trim().toLowerCase();

      // Enforce one-email-one-role before creating the auth user
      try {
        const check = await checkEmailRoleFn({ data: { email } });
        if (check.exists) {
          setServerError(roleConflictMessage(check.roleLabel, "Salon Owner"));
          return;
        }
      } catch {
        // Non-fatal — Supabase signUp will still reject duplicates
      }

      // Create a Supabase auth user and lock the role to salon owner.
      const { data, error } = await supabase.auth.signUp({
        email,
        password: parsed.data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: parsed.data.full_name,
            mobile: parsed.data.mobile,
            referred_by: referredBy || null,
            role: "owner",
            owner_request: {
              business_name: parsed.data.business_name,
              business_category: parsed.data.business_category,
              city: parsed.data.city,
              area: parsed.data.area,
              whatsapp: parsed.data.whatsapp,
            },
          },
        },
      });


      if (error) {
        const raw = parseErr(error);
        let msg = raw;
        if (/already registered|already exists/i.test(raw)) {
          msg = "Email already registered. Please sign in and contact support to request owner access.";
        } else if (/weak password|pwned|breach/i.test(raw)) {
          msg = "Password is too weak or commonly used. Choose a stronger one.";
        } else if (/rate limit|too many/i.test(raw)) {
          msg = "Too many attempts. Please try again shortly.";
        }
        setServerError(msg);
        return;
      }

      // Safely try to persist owner request if a table exists (graceful no-op otherwise).
      const userId = data.user?.id ?? null;
      try {
        const payload = {
          user_id: userId,
          full_name: parsed.data.full_name,
          email: parsed.data.email,
          mobile: parsed.data.mobile,
          business_name: parsed.data.business_name,
          business_category: parsed.data.business_category,
          city: parsed.data.city,
          area: parsed.data.area,
          whatsapp: parsed.data.whatsapp,
          status: "pending",
        };
        // Use generic call to avoid TS errors if the table isn't in generated types.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sb: any = supabase;
        const res = await sb.from("owner_requests").insert(payload);
        if (res?.error) {
          // Table likely missing — log and continue with frontend-only flow.
          console.warn("[OwnerSignup] owner_requests not available:", res.error.message);
        }
      } catch (err) {
        console.warn("[OwnerSignup] Skipping owner_requests insert:", parseErr(err));
      }

      // Ensure session, then redirect to owner onboarding / create-website
      let session = data.session;
      if (!session && data.user) {
        const { data: signIn } = await supabase.auth.signInWithPassword({
          email,
          password: parsed.data.password,
        });
        session = signIn.session ?? null;
      }
      setSuccess(true);
      setTimeout(() => {
        let dest = "/owner/templates";
        if (typeof window !== "undefined") {
          const pending = sessionStorage.getItem("nexora:postLoginRedirect");
          if (pending) {
            sessionStorage.removeItem("nexora:postLoginRedirect");
            dest = pending;
          }
        }
        navigate({ to: dest, replace: true });
      }, 500);
    } catch (err) {
      setServerError(parseErr(err));
    } finally {
      setSubmitting(false);
    }
  };


  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-md">
          <BackButton className="mb-3" />
          <Card className="w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Welcome, Shop Owner!</CardTitle>
              <CardDescription className="mt-2">
                Your owner account is created. Redirecting to your website setup…
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" onClick={() => navigate({ to: "/" })}>
                Back to home
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate({ to: "/login" })}>
                Go to Sign in
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-xl">
        <BackButton className="mb-3" />
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle className="text-2xl">Become a Shop Owner</CardTitle>
            </div>
            <CardDescription>
              Fill in your details. Our team will verify your shop and activate owner access.
            </CardDescription>
          </CardHeader>
          <CardContent>
          {typeof serverError === "string" && serverError.trim().length > 0 && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{serverError.trim()}</AlertDescription>
            </Alert>
          )}

          {referredBy && (
            <Alert className="mb-4 border-primary/20 bg-primary/5">
              <AlertDescription className="text-sm">
                Joining with referral code <strong className="font-mono">{referredBy}</strong>.
                <span className="block text-xs text-muted-foreground mt-0.5">Referral rewards will be activated soon.</span>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="full_name">Owner full name</Label>
              <Input id="full_name" value={form.full_name} onChange={update("full_name")} disabled={submitting} />
              {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" value={form.email} onChange={update("email")} disabled={submitting} />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mobile">Phone</Label>
              <Input id="mobile" type="tel" autoComplete="tel" placeholder="+91 9876543210" value={form.mobile} onChange={update("mobile")} disabled={submitting} />
              {errors.mobile && <p className="text-xs text-destructive">{errors.mobile}</p>}
            </div>

            <div className="space-y-1.5 sm:col-span-2">
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

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="confirm_password">Confirm password</Label>
              <Input
                id="confirm_password"
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                value={form.confirm_password}
                onChange={update("confirm_password")}
                disabled={submitting}
              />
              {errors.confirm_password && <p className="text-xs text-destructive">{errors.confirm_password}</p>}
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="business_name">Business name</Label>
              <Input id="business_name" value={form.business_name} onChange={update("business_name")} disabled={submitting} />
              {errors.business_name && <p className="text-xs text-destructive">{errors.business_name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="business_category">Business category</Label>
              <Select
                value={form.business_category}
                onValueChange={(v) => {
                  setForm((f) => ({ ...f, business_category: v }));
                  if (errors.business_category) setErrors((p) => ({ ...p, business_category: "" }));
                }}
                disabled={submitting}
              >
                <SelectTrigger id="business_category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.business_category && <p className="text-xs text-destructive">{errors.business_category}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="whatsapp">WhatsApp number</Label>
              <Input id="whatsapp" type="tel" placeholder="+91 9876543210" value={form.whatsapp} onChange={update("whatsapp")} disabled={submitting} />
              {errors.whatsapp && <p className="text-xs text-destructive">{errors.whatsapp}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={form.city} onChange={update("city")} disabled={submitting} />
              {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="area">Area / Locality</Label>
              <Input id="area" value={form.area} onChange={update("area")} disabled={submitting} />
              {errors.area && <p className="text-xs text-destructive">{errors.area}</p>}
            </div>

            <div className="sm:col-span-2">
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit owner request
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Owner access activates only after admin verification. Until then your account works as a customer.
              </p>
              <p className="mt-3 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

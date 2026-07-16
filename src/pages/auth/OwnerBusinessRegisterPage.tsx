import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, Building2, CheckCircle2 } from "lucide-react";

const CATEGORIES = [
  "Barber Shop",
  "Salon",
  "Beauty Parlour",
  "Spa",
  "Tattoo Studio",
  "Massage Center",
  "Nail Art Studio",
  "Unisex",
];
import { BackButton } from "@/components/shared/BackButton";

const mobileRe = /^(\+91)?[6-9]\d{9}$/;

const schema = z.object({
  owner_name: z.string().trim().min(2, "Enter your full name").max(100),
  mobile: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s-]/g, ""))
    .pipe(z.string().regex(mobileRe, "Enter a valid 10-digit mobile")),
  whatsapp: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s-]/g, ""))
    .refine((v) => v === "" || mobileRe.test(v), "Enter a valid 10-digit WhatsApp number")
    .optional()
    .or(z.literal("")),
  district: z.string().trim().min(2, "District is required").max(80),
  shop_name: z.string().trim().min(2, "Shop name is required").max(120),
  category: z.string().trim().min(1, "Select a category").max(80),
  address: z.string().trim().max(500).optional().or(z.literal("")),
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(8, "Min 8 characters").max(72),
});

type FormState = {
  owner_name: string;
  mobile: string;
  whatsapp: string;
  district: string;
  shop_name: string;
  category: string;
  address: string;
  email: string;
  password: string;
};

const GENERIC_ERROR = "Registration failed. Please try again.";

function parseErr(error: unknown): string {
  if (!error) return GENERIC_ERROR;
  if (typeof error === "string") return error.trim() || GENERIC_ERROR;
  if (error instanceof Error) return error.message.trim() || GENERIC_ERROR;
  if (typeof error === "object") {
    const e = error as {
      message?: unknown;
      error_description?: unknown;
      msg?: unknown;
      statusText?: unknown;
      code?: unknown;
      data?: { message?: unknown } | string;
    };

    const candidates = [e.message, e.error_description, e.msg, e.statusText];
    if (typeof e.data === "string") candidates.unshift(e.data);
    if (typeof e.data === "object" && e.data) candidates.unshift(e.data.message);

    for (const candidate of candidates) {
      if (typeof candidate !== "string") continue;
      const trimmed = candidate.trim();
      if (!trimmed || trimmed === "{}") continue;
      try {
        const parsed = JSON.parse(trimmed) as { message?: unknown; msg?: unknown };
        const nested = parsed.message ?? parsed.msg;
        if (typeof nested === "string" && nested.trim()) return nested.trim();
      } catch {
        return trimmed;
      }
    }

    if (e.code === "weak_password") return "Please choose a stronger password.";
    if (e.code === "user_already_exists")
      return "This email is already registered. Please sign in instead.";
  }
  return GENERIC_ERROR;
}

function friendlyAuthError(error: unknown): string {
  const raw = parseErr(error);
  if (/already registered|already exists|user_already_exists/i.test(raw)) {
    return "This email is already registered. Please sign in instead.";
  }
  if (/weak|pwned|easy to guess|password/i.test(raw) && /weak|pwned|easy to guess/i.test(raw)) {
    return "This password is too common. Please choose a stronger password.";
  }
  if (/database error saving new user/i.test(raw)) {
    return "We could not create your account due to a backend validation issue. Please try again.";
  }
  return raw;
}

export default function OwnerBusinessRegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({
    owner_name: "",
    mobile: "",
    district: "",
    shop_name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [success, setSuccess] = useState(false);

  const update = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: "" }));
    if (serverError) setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
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

    setSubmitting(true);
    try {
      const payload = {
        ...parsed.data,
        owner_name: parsed.data.owner_name.trim(),
        mobile: parsed.data.mobile.trim(),
        district: parsed.data.district.trim(),
        shop_name: parsed.data.shop_name.trim(),
        email: parsed.data.email.trim().toLowerCase(),
      };
      const email = payload.email;

      // 1. Create auth user with shop_owner role
      const signUp = await supabase.auth.signUp({
        email,
        password: parsed.data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: payload.owner_name,
            mobile: payload.mobile,
            role: "shop_owner",
          },
        },
      });

      if (signUp.error) {
        setServerError(friendlyAuthError(signUp.error));
        return;
      }

      // 2. Ensure session
      let session = signUp.data.session;
      if (!session) {
        const signIn = await supabase.auth.signInWithPassword({
          email,
          password: payload.password,
        });
        session = signIn.data.session ?? null;
        if (signIn.error) {
          setServerError(friendlyAuthError(signIn.error));
          return;
        }
      }

      if (!session) {
        setServerError("Account created. Please sign in to continue.");
        setTimeout(() => navigate({ to: "/login" }), 800);
        return;
      }

      // 3. Atomically create the shop (RPC sets owner_id = auth.uid())
      const { error: rpcError } = await supabase.rpc("register_owner_business", {
        _shop_name: payload.shop_name,
        _district: payload.district,
        _owner_name: payload.owner_name,
        _mobile: payload.mobile,
        _email: email,
      });

      if (rpcError) {
        setServerError(parseErr(rpcError));
        return;
      }

      setSuccess(true);
      setTimeout(() => navigate({ to: "/owner/setup-wizard", replace: true }), 600);
    } catch (err) {
      setServerError(parseErr(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Your shop is ready!</CardTitle>
            <CardDescription className="mt-2">
              Your website was generated automatically. Taking you to the simple salon setup…
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-xl">
        <BackButton className="mb-3" />
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle className="text-2xl">Register your business</CardTitle>
            </div>
            <CardDescription>
              Add the basics now. We will generate a clean booking website automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {serverError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="shop_name">Shop name *</Label>
                <Input
                  id="shop_name"
                  value={form.shop_name}
                  onChange={update("shop_name")}
                  disabled={submitting}
                />
                {errors.shop_name && <p className="text-xs text-destructive">{errors.shop_name}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="owner_name">Shop owner name *</Label>
                <Input
                  id="owner_name"
                  value={form.owner_name}
                  onChange={update("owner_name")}
                  disabled={submitting}
                />
                {errors.owner_name && (
                  <p className="text-xs text-destructive">{errors.owner_name}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="district">District *</Label>
                <Input
                  id="district"
                  value={form.district}
                  onChange={update("district")}
                  disabled={submitting}
                />
                {errors.district && <p className="text-xs text-destructive">{errors.district}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mobile">Mobile *</Label>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="+91 9876543210"
                  value={form.mobile}
                  onChange={update("mobile")}
                  disabled={submitting}
                />
                {errors.mobile && <p className="text-xs text-destructive">{errors.mobile}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email *</Label>
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

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="password">Password *</Label>
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
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>

              <div className="sm:col-span-2">
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create my shop
                </Button>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  No monthly fee. Nexora charges 10% only on successfully completed bookings.
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

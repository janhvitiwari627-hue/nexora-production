import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Mail, User, Building2, BadgeCheck, XCircle, Crown, Eye, EyeOff, ChevronDown, ChevronUp, Check, Info, AlertCircle } from "lucide-react";
import { PasswordStrengthIndicator, scorePassword } from "@/components/auth/PasswordStrengthIndicator";
import { validateReferralCode, registerMySalon } from "@/lib/owner.functions";
import { registerDistrictPartner } from "@/lib/districtPartner.functions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showEligibility, setShowEligibility] = useState(false);

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
    const value = e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    // Clear server error and field error when user starts typing
    if (serverError) setServerError(null);
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
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
    console.log("[Register] Attempting sign up with email:", parsed.data.email, "accountType:", accountType);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: parsed.data.email.trim(),
        password: parsed.data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: parsed.data.full_name,
            mobile: parsed.data.mobile,
            referred_by: parsed.data.referred_by || null,
            role: accountType,
          },
        },
      });

      console.log("[Register] Supabase response:", { user: !!data.user, session: !!data.session, error: error?.message });

      if (error) {
        let errorMessage = "Sign up failed. Please try again.";
        if (error.message.includes("User already registered") || error.message.includes("already exists")) {
          errorMessage = "An account with this email already exists. Please sign in instead.";
        } else if (error.message.includes("invalid email")) {
          errorMessage = "Invalid email address.";
        } else if (error.message.includes("weak password")) {
          errorMessage = "Password is too weak. Please choose a stronger password.";
        } else if (error.message.includes("network") || error.message.includes("fetch") || error.message.includes("connection")) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else {
          errorMessage = error.message?.trim() || errorMessage;
        }
        console.error("[Register] Auth error:", error.message);
        setServerError(errorMessage);
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

      // Handle email confirmation flow
      if (!data.session && data.user) {
        // Email confirmation required - show message to user
        console.log("[Register] Email confirmation required for user:", data.user.id);
        setServerError("Please verify your email before signing in. Check your inbox for the confirmation link.");
        setSubmitting(false);
        return;
      }

      // Session exists - user is signed in
      if (data.session) {
        console.log("[Register] Successfully signed up and signed in user:", data.session.user.id);
        
        if (accountType === "owner") {
          navigate({ to: "/owner/pending" });
        } else if (accountType === "district_partner") {
          navigate({ to: "/partner/district" });
        } else {
          // For customers, redirect based on role
          const { resolvePostLoginRedirect } = await import("@/lib/auth-redirect");
          const redirectTo = await resolvePostLoginRedirect(data.session.user.id);
          navigate({ to: redirectTo });
        }
      }
    } catch (err) {
      console.error("[Register] Unexpected error:", err);
      setServerError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setServerError(null);
    setGoogleSubmitting(true);
    try {
      console.log("[Register] Initiating Google OAuth...");
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("[Register] Google OAuth error:", error.message);
        setServerError("Google sign-up failed. Please try again.");
        return;
      }

      console.log("[Register] Google OAuth initiated, redirecting...");
      // Supabase will redirect to the OAuth provider, then to /auth/callback
    } catch (err) {
      console.error("[Register] Google OAuth unexpected error:", err);
      setServerError(err instanceof Error ? err.message : "Google sign-up failed");
    } finally {
      setGoogleSubmitting(false);
    }
  };

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
            <div className="space-y-4">
              <Alert>
                <AlertDescription className="text-xs">
                  District Business Partner application. After signup your application goes for verification — no joining fee, no investment, performance-based rewards.
                </AlertDescription>
              </Alert>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full justify-start text-left p-2"
                onClick={() => setShowEligibility(!showEligibility)}
              >
                <Info className="mr-2 h-4 w-4" />
                <span className="font-medium">Who can become a Nexora Business Partner?</span>
                {showEligibility ? <ChevronUp className="ml-auto h-4 w-4" /> : <ChevronDown className="ml-auto h-4 w-4" />}
              </Button>

              {showEligibility && (
                <Card className="bg-muted/50 border-primary/20">
                  <CardContent className="pt-0">
                    <ScrollArea className="max-h-96 pr-2">
                      <div className="space-y-6 text-sm">
                        <div>
                          <h3 className="font-semibold text-foreground mb-3">WHO IS THIS PROGRAM FOR?</h3>
                          <p className="text-muted-foreground mb-3">
                            This opportunity is designed for professionals who already work in or have strong connections with the beauty industry.
                          </p>
                          <p className="font-medium mb-2">Eligible categories include:</p>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            <li>Beauty Product Sales Executives</li>
                            <li>Cosmetics Sales Representatives</li>
                            <li>Salon Product Representatives</li>
                            <li>Beauty Equipment Sales Professionals</li>
                            <li>Spa Product Representatives</li>
                            <li>Tattoo Industry Sales Representatives</li>
                            <li>Nail Art Product Representatives</li>
                            <li>Beauty Product Distributor Staff</li>
                            <li>Beauty Wholesalers</li>
                            <li>Freelance Beauty Industry Sales Professionals</li>
                            <li>Individuals with an existing network of salon owners</li>
                          </ul>
                        </div>

                        <Separator />

                        <div>
                          <h3 className="font-semibold text-foreground mb-3">BASIC ELIGIBILITY</h3>
                          
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-1">Minimum Age</h4>
                              <p className="text-muted-foreground">18 Years or Above</p>
                            </div>

                            <div>
                              <h4 className="font-medium mb-1">Education</h4>
                              <p className="text-muted-foreground">
                                No Minimum Degree Required. Experience, communication skills, professionalism, and industry relationships 
                                are valued more than formal education.
                              </p>
                            </div>

                            <div>
                              <h4 className="font-medium mb-1">Experience</h4>
                              <p className="text-muted-foreground">
                                <strong className="text-foreground">Preferred:</strong> Minimum 1 Year of Beauty Industry Experience
                              </p>
                              <p className="text-muted-foreground mt-1">
                                OR Existing Relationships with Salon Owners, Beauty Parlours, Spas, Tattoo Studios, 
                                Nail Art Studios, Beauty Product Distributors, or Related Businesses.
                              </p>
                              <p className="text-muted-foreground mt-1 text-xs">
                                Exceptional candidates with strong local networks may also be considered.
                              </p>
                            </div>

                            <div>
                              <h4 className="font-medium mb-1">Location</h4>
                              <p className="text-muted-foreground">
                                Currently accepting applications from launch and expansion cities where Nexora is operating.
                                Applicants should be willing to work within their assigned local area or district.
                              </p>
                            </div>

                            <div>
                              <h4 className="font-medium mb-1">Identity Verification (KYC)</h4>
                              <p className="text-muted-foreground mb-2">Applicants must complete identity verification before activation.</p>
                              <p className="text-muted-foreground mb-1">Required documents may include:</p>
                              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                <li>Aadhaar Card</li>
                                <li>PAN Card</li>
                                <li>Recent Passport-size Photograph</li>
                                <li>Bank Account Details (for payouts)</li>
                              </ul>
                              <p className="text-muted-foreground text-xs mt-2">Activation is subject to successful verification.</p>
                            </div>

                            <div>
                              <h4 className="font-medium mb-1">Smartphone Requirement</h4>
                              <p className="text-muted-foreground mb-1">
                                A personal Android or iPhone with internet access is required to:
                              </p>
                              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                <li>Use the Partner Dashboard</li>
                                <li>Track salon onboarding</li>
                                <li>Manage leads</li>
                                <li>Receive notifications</li>
                                <li>Monitor earnings</li>
                                <li>Access training materials</li>
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-medium mb-1">Travel Requirement</h4>
                              <p className="text-muted-foreground">
                                Since the role involves meeting salon owners and supporting onboarding, applicants should be comfortable 
                                traveling within their assigned city or district. Having a two-wheeler or other reliable local transportation 
                                is recommended but not mandatory unless specified for a particular region.
                              </p>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h3 className="font-semibold text-foreground mb-3">IDEAL BUSINESS PARTNER PROFILE</h3>
                          <p className="text-muted-foreground mb-2">The best Nexora Business Partners are people who:</p>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            <li>Already know local salon owners.</li>
                            <li>Enjoy building professional relationships.</li>
                            <li>Can explain products and services confidently.</li>
                            <li>Want to create long-term recurring income.</li>
                            <li>Believe in helping the beauty industry become more digital.</li>
                            <li>Are self-motivated and growth-oriented.</li>
                          </ul>
                        </div>

                        <Separator />

                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                          <h3 className="font-semibold text-destructive mb-3 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" /> WHO THIS PROGRAM IS NOT FOR
                          </h3>
                          <p className="text-muted-foreground mb-2">This program may not be suitable for individuals who:</p>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            <li>Are looking only for a fixed salary job.</li>
                            <li>Do not enjoy meeting business owners.</li>
                            <li>Are unwilling to travel locally.</li>
                            <li>Cannot use a smartphone for daily work.</li>
                            <li>Are unwilling to complete identity verification.</li>
                          </ul>
                        </div>

                        <Separator />

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h3 className="font-semibold text-green-800 mb-3">ELIGIBILITY SUMMARY</h3>
                          <ul className="space-y-1 text-green-800">
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 flex-shrink-0" /> Minimum Age: 18+</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 flex-shrink-0" /> No Mandatory Degree</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 flex-shrink-0" /> Beauty Industry Experience Preferred</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 flex-shrink-0" /> Existing Salon Network Preferred</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 flex-shrink-0" /> KYC Verification Required</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 flex-shrink-0" /> Smartphone Required</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 flex-shrink-0" /> Local Travel Preferred</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 flex-shrink-0" /> Professional Communication Skills</li>
                          </ul>
                        </div>

                        <Separator />

                        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                          <h3 className="font-semibold text-primary mb-2">FINAL MESSAGE</h3>
                          <p className="text-muted-foreground">
                            If you already know salon owners, beauty professionals, or distributors, you already have the most valuable 
                            asset needed to become a Nexora Business Partner.
                          </p>
                          <p className="text-muted-foreground mt-2">
                            Your existing relationships can become the foundation of a long-term digital business with Nexora SalonOS.
                          </p>
                        </div>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {accountType === "customer" && (
            <Button
              type="button" variant="outline" className="w-full"
              onClick={handleGoogle} disabled={googleSubmitting || submitting}
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
              <Input id="full_name" value={form.full_name} onChange={update("full_name")} autoComplete="name" required disabled={submitting} />
              {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={update("email")} autoComplete="email" required disabled={submitting} />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="mobile">Mobile</Label>
              <Input
                id="mobile" type="tel" value={form.mobile} onChange={update("mobile")}
                autoComplete="tel" placeholder="+91 9876543210"
                required
                disabled={submitting}
              />
              {errors.mobile && <p className="text-xs text-destructive">{errors.mobile}</p>}
            </div>

            {accountType === "owner" && (
              <>
                <div className="space-y-1">
                  <Label htmlFor="business_name">Business name</Label>
                  <Input id="business_name" value={form.business_name} onChange={update("business_name")} required placeholder="e.g. Luxe Hair & Spa" disabled={submitting} />
                  {errors.business_name && <p className="text-xs text-destructive">{errors.business_name}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="business_city">City <span className="text-xs text-muted-foreground">(optional)</span></Label>
                  <Input id="business_city" value={form.business_city} onChange={update("business_city")} placeholder="Mumbai" disabled={submitting} />
                </div>
              </>
            )}

            {accountType === "district_partner" && (
              <>
                <div className="space-y-1">
                  <Label htmlFor="district">District</Label>
                  <Input id="district" value={form.district} onChange={update("district")} required placeholder="e.g. Jaipur" disabled={submitting} />
                  {errors.district && <p className="text-xs text-destructive">{errors.district}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="state">State <span className="text-xs text-muted-foreground">(optional)</span></Label>
                  <Input id="state" value={form.state} onChange={update("state")} placeholder="Rajasthan" disabled={submitting} />
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="password">Password <span className="text-xs text-muted-foreground">(minimum 8 characters)</span></Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={update("password")}
                  autoComplete="new-password"
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
                  disabled={submitting}
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
              {accountType === "owner"
                ? "Register business"
                : accountType === "district_partner"
                  ? "Apply as District Partner"
                  : "Create account"}
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
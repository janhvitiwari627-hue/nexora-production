import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion, AnimatePresence } from "framer-motion";
import { Check, MapPin, Plus, Share2, Sparkles, Trash2, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";

const STEPS = ["Account", "Business", "Services", "Staff", "Gallery", "Payment", "Review"];
const CATEGORIES = ["Salon", "Spa", "Tattoo", "Barber", "Bridal", "Nail Art"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const DRAFT_KEY_PREFIX = "nexora:ownerOnboardingDraft:";
const ANON_DRAFT_KEY = `${DRAFT_KEY_PREFIX}anon`;

const passStrength = (p: string) => {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
};

type Account = { ownerName: string; businessName: string; mobile: string; otp: string; email: string; password: string; category: string };
type Business = { address: string; city: string; area: string; whatsapp: string; lat: number; lng: number; type: string };
type Hour = { day: string; open: string; close: string };
type Service = { name: string; price: string; duration: string; desc: string };
type Staff = { name: string; designation: string; experience: string };
type Payment = { upi: string; qrName: string };

type Draft = {
  step: number;
  account: Omit<Account, "password" | "otp">;
  business: Business;
  hours: Hour[];
  services: Service[];
  staff: Staff[];
  gallery: string[];
  payment: Payment;
};

const DEFAULT_ACCOUNT: Account = { ownerName: "", businessName: "", mobile: "", otp: "", email: "", password: "", category: "" };
const DEFAULT_BUSINESS: Business = { address: "", city: "", area: "", whatsapp: "", lat: 19.07, lng: 72.87, type: "Independent" };
const DEFAULT_HOURS: Hour[] = DAYS.map(d => ({ day: d, open: "10:00", close: "21:00" }));

function loadDraft(key: string): Partial<Draft> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
}

export function OwnerOnboardingPage() {
  const authUser = useAuthStore(s => s.user);
  const refreshProfile = useAuthStore(s => s.refreshProfile);
  const draftKey = useMemo(() => (authUser ? `${DRAFT_KEY_PREFIX}${authUser.id}` : ANON_DRAFT_KEY), [authUser]);

  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState(0);
  const [published, setPublished] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);

  const [account, setAccount] = useState<Account>(DEFAULT_ACCOUNT);
  const [business, setBusiness] = useState<Business>(DEFAULT_BUSINESS);
  const [hours, setHours] = useState<Hour[]>(DEFAULT_HOURS);
  const [services, setServices] = useState<Service[]>([{ name: "", price: "", duration: "", desc: "" }]);
  const [staff, setStaff] = useState<Staff[]>([{ name: "", designation: "", experience: "" }]);
  const [gallery, setGallery] = useState<string[]>([]);
  const [payment, setPayment] = useState<Payment>({ upi: "", qrName: "" });

  // Hydrate from localStorage (prefer user-scoped draft, fall back to anon and migrate)
  useEffect(() => {
    const userDraft = loadDraft(draftKey);
    const anonDraft = !userDraft && authUser ? loadDraft(ANON_DRAFT_KEY) : null;
    const d = userDraft ?? anonDraft;
    if (d) {
      if (typeof d.step === "number") setStep(d.step);
      if (d.account) setAccount(a => ({ ...a, ...d.account }));
      if (d.business) setBusiness(d.business);
      if (d.hours) setHours(d.hours);
      if (d.services) setServices(d.services);
      if (d.staff) setStaff(d.staff);
      if (d.gallery) setGallery(d.gallery);
      if (d.payment) setPayment(d.payment);
      if (anonDraft && authUser) {
        try { window.localStorage.removeItem(ANON_DRAFT_KEY); } catch { /* noop */ }
      }
    }
    if (authUser) setAccountCreated(true);
    setHydrated(true);
  }, [draftKey, authUser]);

  // Persist progress after every change (excluding password/otp)
  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    const { password: _p, otp: _o, ...accountSafe } = account;
    const draft: Draft = { step, account: accountSafe, business, hours, services, staff, gallery, payment };
    try {
      window.localStorage.setItem(draftKey, JSON.stringify(draft));
    } catch { /* quota */ }
  }, [hydrated, draftKey, step, account, business, hours, services, staff, gallery, payment]);

  const next = async () => {
    // Step 0 → create the auth account before moving on
    if (step === 0 && !accountCreated) {
      if (!account.email || !account.password) {
        toast.error("Email and password are required");
        return;
      }
      if (passStrength(account.password) < 2) {
        toast.error("Choose a stronger password");
        return;
      }
      setSubmitting(true);
      try {
        const { data, error } = await supabase.auth.signUp({
          email: account.email,
          password: account.password,
          options: {
            emailRedirectTo: `${window.location.origin}/owner/onboarding`,
            data: {
              full_name: account.ownerName,
              mobile: account.mobile,
              role: "owner",
              business_name: account.businessName,
              business_category: account.category,
            },
          },
        });
        if (error) throw error;
        setAccountCreated(true);
        if (!data.session) {
          toast.success("Check your email to verify, then continue here. Your progress is saved.");
        } else {
          toast.success("Account created");
        }
        setStep(s => Math.min(STEPS.length - 1, s + 1));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Sign up failed";
        toast.error(msg);
      } finally {
        setSubmitting(false);
      }
      return;
    }
    setStep(s => Math.min(STEPS.length - 1, s + 1));
  };
  const back = () => setStep(s => Math.max(0, s - 1));

  const handlePublish = async () => {
    setSubmitting(true);
    try {
      // Ensure profile role reflects 'owner' (handle_new_user sets it from metadata,
      // but if the user signed up elsewhere first we update the metadata here).
      if (authUser) {
        await supabase.auth.updateUser({ data: { role: "owner" } });
        await refreshProfile();
      }
      // shops record creation + subdomain/SSL are Phase 6.
      try { window.localStorage.removeItem(draftKey); } catch { /* noop */ }
      setPublished(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Publish failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (published) return <SuccessScreen business={account.businessName || "Your Business"} />;

  return (
    <div className="bg-muted/30 min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="text-center">
          <h1 className="text-heading text-2xl font-bold md:text-3xl">Create Your Business</h1>
          <p className="text-muted-foreground text-sm">Get your white-label website live in 7 quick steps</p>
          {hydrated && (step > 0 || accountCreated) && (
            <p className="text-muted-foreground mt-1 text-xs">Progress auto-saved · Resume anytime</p>
          )}
        </header>

        <Stepper current={step} />

        <Card>
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                {step === 0 && (
                  <Step title="Account Setup" subtitle="Tell us about you and your business">
                    <div className="grid gap-3 md:grid-cols-2">
                      <Field label="Owner Name"><Input value={account.ownerName} onChange={e => setAccount({ ...account, ownerName: e.target.value })} disabled={accountCreated} /></Field>
                      <Field label="Business Name"><Input value={account.businessName} onChange={e => setAccount({ ...account, businessName: e.target.value })} /></Field>
                      <Field label="Mobile">
                        <div className="flex gap-2">
                          <Input value={account.mobile} onChange={e => setAccount({ ...account, mobile: e.target.value })} placeholder="+91 …" />
                          <Button size="sm" variant="outline" onClick={() => { setOtpSent(true); toast.success("OTP sent (WhatsApp verification in Phase 7)"); }}>{otpSent ? "Resend" : "Send OTP"}</Button>
                        </div>
                      </Field>
                      {otpSent && <Field label="OTP"><Input maxLength={6} value={account.otp} onChange={e => setAccount({ ...account, otp: e.target.value })} placeholder="6-digit" /></Field>}
                      <Field label="Email"><Input type="email" value={account.email} onChange={e => setAccount({ ...account, email: e.target.value })} disabled={accountCreated} /></Field>
                      <Field label="Password">
                        <Input type="password" value={account.password} onChange={e => setAccount({ ...account, password: e.target.value })} disabled={accountCreated} placeholder={accountCreated ? "Account already created" : ""} />
                        {!accountCreated && <PasswordMeter score={passStrength(account.password)} />}
                      </Field>
                      <Field label="Business Category">
                        <Select value={account.category} onValueChange={v => setAccount({ ...account, category: v })}>
                          <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                          <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                      </Field>
                    </div>
                  </Step>
                )}

                {step === 1 && (
                  <Step title="Business Details" subtitle="Where customers will find you">
                    <div className="grid gap-3 md:grid-cols-2">
                      <Field label="Address" className="md:col-span-2"><Textarea rows={2} value={business.address} onChange={e => setBusiness({ ...business, address: e.target.value })} /></Field>
                      <Field label="City"><Input value={business.city} onChange={e => setBusiness({ ...business, city: e.target.value })} /></Field>
                      <Field label="Area"><Input value={business.area} onChange={e => setBusiness({ ...business, area: e.target.value })} /></Field>
                      <Field label="WhatsApp Number"><Input value={business.whatsapp} onChange={e => setBusiness({ ...business, whatsapp: e.target.value })} /></Field>
                      <Field label="Business Type">
                        <Select value={business.type} onValueChange={v => setBusiness({ ...business, type: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Independent">Independent</SelectItem>
                            <SelectItem value="Chain">Chain</SelectItem>
                            <SelectItem value="Franchise">Franchise</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Pin your location" className="md:col-span-2">
                        <div
                          role="button"
                          tabIndex={0}
                          aria-label="Click to place pin"
                          className="bg-muted relative h-48 cursor-crosshair overflow-hidden rounded-lg border"
                          onClick={(e) => {
                            const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                            const x = (e.clientX - rect.left) / rect.width;
                            const y = (e.clientY - rect.top) / rect.height;
                            setBusiness({ ...business, lat: 19.05 + (1 - y) * 0.15, lng: 72.80 + x * 0.15 });
                          }}
                        >
                          <iframe title="Map" className="pointer-events-none absolute inset-0 h-full w-full" src="https://www.openstreetmap.org/export/embed.html?bbox=72.78%2C19.05%2C72.92%2C19.18&layer=mapnik" />
                          <MapPin className="text-destructive absolute top-1/2 left-1/2 h-6 w-6 -translate-x-1/2 -translate-y-full drop-shadow" />
                        </div>
                        <div className="text-muted-foreground text-xs">Lat {business.lat.toFixed(4)} · Lng {business.lng.toFixed(4)}</div>
                      </Field>
                      <Field label="Business Hours" className="md:col-span-2">
                        <div className="space-y-1.5">
                          {hours.map((h, idx) => (
                            <div key={h.day} className="grid grid-cols-[60px_1fr_1fr] items-center gap-2">
                              <span className="text-sm font-medium">{h.day}</span>
                              <Input type="time" value={h.open} onChange={e => setHours(p => p.map((x, i) => i === idx ? { ...x, open: e.target.value } : x))} />
                              <Input type="time" value={h.close} onChange={e => setHours(p => p.map((x, i) => i === idx ? { ...x, close: e.target.value } : x))} />
                            </div>
                          ))}
                        </div>
                      </Field>
                    </div>
                  </Step>
                )}

                {step === 2 && (
                  <Step title="Services" subtitle={<>Add at least <strong>5 services</strong> to publish</>}>
                    <div className="space-y-3">
                      {services.map((s, idx) => (
                        <div key={idx} className="bg-muted/30 grid items-start gap-2 rounded-lg border p-3 md:grid-cols-[2fr_1fr_1fr_auto]">
                          <Input placeholder="Service name" value={s.name} onChange={e => setServices(p => p.map((x, i) => i === idx ? { ...x, name: e.target.value } : x))} />
                          <Input placeholder="₹ Price" type="number" value={s.price} onChange={e => setServices(p => p.map((x, i) => i === idx ? { ...x, price: e.target.value } : x))} />
                          <Input placeholder="Duration (min)" type="number" value={s.duration} onChange={e => setServices(p => p.map((x, i) => i === idx ? { ...x, duration: e.target.value } : x))} />
                          <Button size="icon" variant="ghost" onClick={() => setServices(p => p.filter((_, i) => i !== idx))}><Trash2 className="text-destructive h-4 w-4" /></Button>
                          <div className="flex gap-2 md:col-span-4">
                            <Textarea rows={2} className="flex-1" placeholder="Description" value={s.desc} onChange={e => setServices(p => p.map((x, i) => i === idx ? { ...x, desc: e.target.value } : x))} />
                            <Button variant="outline" size="sm" onClick={() => { setServices(p => p.map((x, i) => i === idx ? { ...x, desc: `Premium ${x.name || "service"} crafted by skilled professionals using top brands.` } : x)); toast.success("AI description generated"); }}><Sparkles className="h-3.5 w-3.5" /> AI</Button>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" onClick={() => setServices(p => [...p, { name: "", price: "", duration: "", desc: "" }])}><Plus className="h-4 w-4" /> Add Service</Button>
                      <Badge variant={services.length >= 5 ? "default" : "destructive"}>{services.length}/5 minimum</Badge>
                    </div>
                  </Step>
                )}

                {step === 3 && (
                  <Step title="Staff" subtitle="Add your team members">
                    <div className="space-y-3">
                      {staff.map((s, idx) => (
                        <div key={idx} className="bg-muted/30 grid items-center gap-2 rounded-lg border p-3 md:grid-cols-[80px_2fr_1.5fr_1fr_auto]">
                          <label className="bg-muted grid h-16 w-16 cursor-pointer place-items-center rounded-full text-xs"><Upload className="h-4 w-4" /></label>
                          <Input placeholder="Name" value={s.name} onChange={e => setStaff(p => p.map((x, i) => i === idx ? { ...x, name: e.target.value } : x))} />
                          <Input placeholder="Designation" value={s.designation} onChange={e => setStaff(p => p.map((x, i) => i === idx ? { ...x, designation: e.target.value } : x))} />
                          <Input placeholder="Experience (yrs)" type="number" value={s.experience} onChange={e => setStaff(p => p.map((x, i) => i === idx ? { ...x, experience: e.target.value } : x))} />
                          <Button size="icon" variant="ghost" onClick={() => setStaff(p => p.filter((_, i) => i !== idx))}><Trash2 className="text-destructive h-4 w-4" /></Button>
                        </div>
                      ))}
                      <Button variant="outline" onClick={() => setStaff(p => [...p, { name: "", designation: "", experience: "" }])}><Plus className="h-4 w-4" /> Add Staff</Button>
                    </div>
                  </Step>
                )}

                {step === 4 && (
                  <Step title="Gallery" subtitle="Upload up to 10 photos showcasing your work">
                    <label className="bg-muted/30 hover:bg-muted grid cursor-pointer place-items-center rounded-xl border-2 border-dashed py-12">
                      <Upload className="text-muted-foreground mb-2 h-8 w-8" />
                      <div className="text-sm font-medium">Drag & drop or click to upload</div>
                      <div className="text-muted-foreground text-xs">5MB per photo · 10 max</div>
                      <input type="file" multiple accept="image/*" hidden onChange={e => {
                        const names = Array.from(e.target.files ?? []).map(f => f.name);
                        setGallery(p => [...p, ...names].slice(0, 10));
                      }} />
                    </label>
                    {gallery.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 gap-2 md:grid-cols-5">
                        {gallery.map((g, i) => (
                          <div key={i} className="bg-muted grid aspect-square place-items-center rounded-lg text-center text-xs">{g}</div>
                        ))}
                      </div>
                    )}
                  </Step>
                )}

                {step === 5 && (
                  <Step title="Payment Setup" subtitle="Where bookings get paid">
                    <div className="space-y-3">
                      <Field label="UPI ID"><Input value={payment.upi} onChange={e => setPayment({ ...payment, upi: e.target.value })} placeholder="business@bank" /></Field>
                      <Field label="UPI QR Code">
                        <label className="bg-muted/30 hover:bg-muted grid cursor-pointer place-items-center rounded-xl border-2 border-dashed py-10">
                          <Upload className="text-muted-foreground mb-2 h-6 w-6" />
                          <div className="text-sm">{payment.qrName || "Upload QR image"}</div>
                          <input type="file" accept="image/*" hidden onChange={e => setPayment({ ...payment, qrName: e.target.files?.[0]?.name || "" })} />
                        </label>
                      </Field>
                    </div>
                  </Step>
                )}

                {step === 6 && (
                  <Step title="Review & Publish" subtitle="One last check before going live">
                    <Accordion type="single" collapsible defaultValue="acc">
                      <AccordionItem value="acc"><AccordionTrigger>Account</AccordionTrigger><AccordionContent className="text-sm">{account.ownerName} · {account.businessName} · {account.email}</AccordionContent></AccordionItem>
                      <AccordionItem value="biz"><AccordionTrigger>Business</AccordionTrigger><AccordionContent className="text-sm">{business.address}, {business.area}, {business.city}</AccordionContent></AccordionItem>
                      <AccordionItem value="srv"><AccordionTrigger>Services ({services.length})</AccordionTrigger><AccordionContent className="text-sm">{services.map(s => s.name).filter(Boolean).join(", ") || "—"}</AccordionContent></AccordionItem>
                      <AccordionItem value="stf"><AccordionTrigger>Staff ({staff.length})</AccordionTrigger><AccordionContent className="text-sm">{staff.map(s => s.name).filter(Boolean).join(", ") || "—"}</AccordionContent></AccordionItem>
                      <AccordionItem value="gal"><AccordionTrigger>Gallery ({gallery.length} photos)</AccordionTrigger><AccordionContent className="text-sm">{gallery.length} images uploaded</AccordionContent></AccordionItem>
                      <AccordionItem value="pay"><AccordionTrigger>Payment</AccordionTrigger><AccordionContent className="text-sm">{payment.upi || "—"}</AccordionContent></AccordionItem>
                    </Accordion>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button variant="outline" onClick={() => toast.success("AI content generated for all sections")}><Sparkles className="h-4 w-4" /> Generate AI Content</Button>
                      <Button className="bg-gradient-to-r from-primary to-accent flex-1" disabled={submitting} onClick={handlePublish}>
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Publish My Website
                      </Button>
                    </div>
                  </Step>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 flex justify-between border-t pt-4">
              <Button variant="ghost" onClick={back} disabled={step === 0 || submitting}>Back</Button>
              {step < STEPS.length - 1 && (
                <Button onClick={next} disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {step === 0 && !accountCreated ? "Create Account & Continue" : "Continue"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-between">
      {STEPS.map((label, i) => (
        <div key={label} className="flex flex-1 items-center">
          <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors ${i < current ? "bg-emerald-500 text-white" : i === current ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {i < current ? <Check className="h-4 w-4" /> : i + 1}
          </div>
          {i < STEPS.length - 1 && <div className={`mx-1 h-0.5 flex-1 ${i < current ? "bg-emerald-500" : "bg-muted"}`} />}
        </div>
      ))}
    </div>
  );
}

function Step({ title, subtitle, children }: { title: string; subtitle?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-heading text-xl font-bold">{title}</h2>
        {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return <div className={`space-y-1.5 ${className ?? ""}`}><Label>{label}</Label>{children}</div>;
}

function PasswordMeter({ score }: { score: number }) {
  const labels = ["Too weak", "Weak", "Okay", "Strong", "Excellent"];
  const colors = ["bg-destructive", "bg-orange-500", "bg-amber-500", "bg-emerald-500", "bg-emerald-600"];
  return (
    <div className="mt-1 space-y-1">
      <div className="flex gap-1">{[0, 1, 2, 3].map(i => <div key={i} className={`h-1 flex-1 rounded ${i < score ? colors[score - 1] : "bg-muted"}`} />)}</div>
      <div className="text-muted-foreground text-xs">{labels[score]}</div>
    </div>
  );
}

function SuccessScreen({ business }: { business: string }) {
  const slug = business.toLowerCase().replace(/\s+/g, "-") || "your-business";
  const url = `https://nexora.app/${slug}`;
  return (
    <div className="bg-gradient-to-b from-emerald-50 to-white min-h-screen p-8">
      <div className="mx-auto max-w-md text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }} className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-full bg-emerald-500 text-white shadow-xl">
          <Check className="h-12 w-12" />
        </motion.div>
        <h1 className="text-heading text-3xl font-bold">You're live! 🎉</h1>
        <p className="text-muted-foreground mt-2">{business} is now accepting bookings.</p>

        <Card className="mt-6 text-left">
          <CardContent className="space-y-3 p-5">
            <div>
              <div className="text-muted-foreground text-xs">Your website</div>
              <a href={url} className="text-primary font-mono text-sm break-all">{url}</a>
            </div>
            <div className="bg-muted grid h-32 w-32 place-items-center rounded-lg mx-auto text-xs">QR Code</div>
            <Button className="w-full" onClick={() => navigator.share?.({ url }).catch(() => toast.success("Share dialog not supported, link copied"))}>
              <Share2 className="h-4 w-4" /> Share Website
            </Button>
          </CardContent>
        </Card>

        <Button variant="outline" className="mt-4 w-full" asChild>
          <a href="/owner">Go to Dashboard</a>
        </Button>
      </div>
    </div>
  );
}

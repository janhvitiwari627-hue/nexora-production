import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { toast } from "sonner";
import { CheckCircle2, Clock, XCircle, ShieldAlert, Loader2, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";

const ROLES = [
  "Hair Product Salesman",
  "Cosmetic Sales Executive",
  "Distributor",
  "Brand Representative",
  "Spa Supplier",
  "Tattoo Supplier",
  "Beauty Consultant",
  "Nail Product Distributor",
  "Freelance Beauty Professional",
  "Other",
];

type DbpStatus = "pending" | "verified" | "rejected" | "suspended";

type ExistingApp = {
  id: string;
  status: DbpStatus;
  district: string;
  full_name: string;
  rejection_reason: string | null;
  created_at: string;
} | null;

type Props = { trigger: React.ReactNode };

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

export function JoinPartnerDialog({ trigger }: Props) {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [existing, setExisting] = useState<ExistingApp>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    district: "",
    state: "",
    pincode: "",
    role: "",
    tagline: "",
    story: "",
  });

  // Prime form when profile loads / dialog opens
  useEffect(() => {
    if (!open) return;
    setForm((f) => ({
      ...f,
      name: f.name || profile?.full_name || "",
      phone: f.phone || profile?.mobile || "",
      email: f.email || profile?.email || user?.email || "",
      district: f.district || profile?.city || "",
    }));
  }, [open, profile, user]);

  // Check existing application when dialog opens (signed-in)
  useEffect(() => {
    if (!open || !user) return;
    let cancelled = false;
    setChecking(true);
    supabase
      .from("district_business_partners")
      .select("id,status,district,full_name,rejection_reason,created_at")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error && error.code !== "PGRST116") {
          console.error("[JoinPartnerDialog] fetch existing failed", error);
        }
        setExisting((data as ExistingApp) ?? null);
        setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, user]);

  const goToLogin = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("nexora:postLoginRedirect", "/growth-partner");
    }
    setOpen(false);
    navigate({ to: "/login" });
  };

  const submit = async () => {
    if (!user) {
      goToLogin();
      return;
    }

    // Guard: if we already know an application exists, block immediately.
    if (existing) {
      toast.error("You already have an application on file.");
      return;
    }

    const name = form.name.trim();
    const phone = form.phone.trim();
    const email = form.email.trim();
    const district = form.district.trim();
    const state = form.state.trim();
    const pincode = form.pincode.trim();
    const role = form.role.trim();
    const tagline = form.tagline.trim();
    const story = form.story.trim();

    if (name.length < 2) return toast.error("Please enter your full name");
    if (!/^[0-9+\-\s()]{6,20}$/.test(phone))
      return toast.error("Please enter a valid mobile number");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return toast.error("Please enter a valid email");
    if (district.length < 2) return toast.error("Please enter your district");
    if (!role) return toast.error("Please select your role");
    if (story.length < 20)
      return toast.error("Please tell us why you want to join (at least 20 characters)");

    setLoading(true);

    // Server-side pre-check: even if this races, the UNIQUE(user_id) DB
    // constraint on district_business_partners guarantees only one row.
    const { data: preCheck } = await supabase
      .from("district_business_partners")
      .select("id,status,district,full_name,rejection_reason,created_at")
      .eq("user_id", user.id)
      .maybeSingle();
    if (preCheck) {
      setExisting(preCheck as ExistingApp);
      setLoading(false);
      toast.error("You already have an application on file.");
      return;
    }
    const baseSlug = slugify(`${name}-${district}`) || slugify(user.id);
    const slug = `${baseSlug}-${user.id.slice(0, 6)}`;

    const { error } = await supabase.from("district_business_partners").insert({
      user_id: user.id,
      slug,
      full_name: name,
      mobile: phone,
      email: email || null,
      district,
      state: state || null,
      pincode: pincode || null,
      tagline: tagline || null,
      success_story: story,
      status: "pending",
      tier: "welcome",
      metadata: { role, source: "growth_partner_page" },
    });

    if (error) {
      setLoading(false);
      if (error.code === "23505") {
        toast.error("You already have an application on file.");
        // refresh existing
        const { data } = await supabase
          .from("district_business_partners")
          .select("id,status,district,full_name,rejection_reason,created_at")
          .eq("user_id", user.id)
          .maybeSingle();
        setExisting((data as ExistingApp) ?? null);
        return;
      }
      toast.error(error.message);
      return;
    }

    setLoading(false);
    toast.success("Application submitted! Our team will review within 24 hours.");
    // Reload existing to switch UI to status view
    const { data } = await supabase
      .from("district_business_partners")
      .select("id,status,district,full_name,rejection_reason,created_at")
      .eq("user_id", user.id)
      .maybeSingle();
    setExisting((data as ExistingApp) ?? null);
  };

  const renderStatusCard = (app: NonNullable<ExistingApp>) => {
    const map: Record<
      DbpStatus,
      { icon: typeof CheckCircle2; tone: string; label: string; desc: string }
    > = {
      pending: {
        icon: Clock,
        tone: "text-amber-600 bg-amber-50 border-amber-200",
        label: "Under Review",
        desc: "Our team will contact you within 24 hours.",
      },
      verified: {
        icon: CheckCircle2,
        tone: "text-emerald-700 bg-emerald-50 border-emerald-200",
        label: "Approved",
        desc: "Welcome to the Nexora Growth Partner program!",
      },
      rejected: {
        icon: XCircle,
        tone: "text-red-700 bg-red-50 border-red-200",
        label: "Not Approved",
        desc: app.rejection_reason || "Please contact support for more details.",
      },
      suspended: {
        icon: ShieldAlert,
        tone: "text-slate-700 bg-slate-100 border-slate-200",
        label: "Suspended",
        desc: "Your partner access is temporarily suspended.",
      },
    };
    const s = map[app.status];
    const Icon = s.icon;
    return (
      <div className={`rounded-xl border p-4 ${s.tone}`}>
        <div className="flex items-center gap-2 font-semibold">
          <Icon className="h-5 w-5" />
          {s.label}
        </div>
        <p className="mt-2 text-sm">{s.desc}</p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div>
            <div className="opacity-60">Applicant</div>
            <div className="font-medium">{app.full_name}</div>
          </div>
          <div>
            <div className="opacity-60">District</div>
            <div className="font-medium">{app.district}</div>
          </div>
          <div className="col-span-2">
            <div className="opacity-60">Applied on</div>
            <div className="font-medium">
              {new Date(app.created_at).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>
        </div>
        {app.status === "verified" && (
          <Button
            className="mt-4 w-full"
            onClick={() => {
              setOpen(false);
              navigate({ to: "/app/partner" });
            }}
          >
            Open Partner Dashboard
          </Button>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply as Growth Partner</DialogTitle>
          <DialogDescription>
            {user
              ? "Fill in your details. Our team will review and reach out within 24 hours."
              : "Sign in first, then complete your partner application in 2 minutes."}
          </DialogDescription>
        </DialogHeader>

        {!user ? (
          <div className="py-4 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              A Nexora account is required to apply. Sign in or create a free account to continue —
              it takes less than a minute.
            </div>
            <Button onClick={goToLogin} className="w-full bg-gradient-cta text-primary-foreground">
              <LogIn className="mr-2 h-4 w-4" /> Sign in to continue
            </Button>
          </div>
        ) : checking ? (
          <div className="flex items-center justify-center py-8 text-sm text-slate-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading your application…
          </div>
        ) : existing ? (
          <div className="py-2">{renderStatusCard(existing)}</div>
        ) : (
          <>
            <div className="grid gap-4 py-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="jp-name">Full name *</Label>
                  <Input
                    id="jp-name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    autoComplete="name"
                  />
                </div>
                <div>
                  <Label htmlFor="jp-phone">Mobile *</Label>
                  <Input
                    id="jp-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 98xxxxxxxx"
                    autoComplete="tel"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="jp-email">Email</Label>
                <Input
                  id="jp-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-1">
                  <Label htmlFor="jp-district">District *</Label>
                  <Input
                    id="jp-district"
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                    placeholder="e.g. Jaipur"
                  />
                </div>
                <div>
                  <Label htmlFor="jp-state">State</Label>
                  <Input
                    id="jp-state"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    placeholder="e.g. Rajasthan"
                  />
                </div>
                <div>
                  <Label htmlFor="jp-pincode">Pincode</Label>
                  <Input
                    id="jp-pincode"
                    inputMode="numeric"
                    value={form.pincode}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                    placeholder="302001"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="jp-role">Your role *</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                  <SelectTrigger id="jp-role">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="jp-tagline">One-line tagline</Label>
                <Input
                  id="jp-tagline"
                  value={form.tagline}
                  onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                  placeholder="e.g. Beauty industry veteran, 8 years in Jaipur"
                  maxLength={120}
                />
              </div>
              <div>
                <Label htmlFor="jp-story">
                  Why do you want to join? *{" "}
                  <span className="text-xs font-normal text-slate-500">
                    ({form.story.length}/500)
                  </span>
                </Label>
                <Textarea
                  id="jp-story"
                  value={form.story}
                  onChange={(e) => setForm({ ...form, story: e.target.value.slice(0, 500) })}
                  placeholder="Tell us about your network, experience, and how you plan to onboard salons in your district."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={submit}
                disabled={loading}
                className="bg-gradient-cta text-primary-foreground"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…
                  </>
                ) : (
                  "Submit application"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

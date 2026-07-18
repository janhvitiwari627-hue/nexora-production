import { motion } from "framer-motion";
import {
  Bell,
  CheckCircle2,
  FileCheck2,
  Globe,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Settings as SettingsIcon,
  ShieldAlert,
  ShieldCheck,
  UserRound,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PartnerPageShell } from "./PartnerAppLayout";
import {
  getPartnerProfile,
  updatePartnerProfile,
  updatePartnerMetadata,
  type PartnerProfile,
  type PartnerMetadata,
  type PartnerNotificationPref,
} from "@/lib/partner.functions";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type NotifKey =
  | "notif_new_lead"
  | "notif_payout"
  | "notif_shop_activation"
  | "notif_milestone"
  | "notif_training";

const NOTIF_ROWS: { key: NotifKey; label: string }[] = [
  { key: "notif_new_lead", label: "New lead assigned" },
  { key: "notif_payout", label: "Weekly payout processed" },
  { key: "notif_shop_activation", label: "Shop activation reached" },
  { key: "notif_milestone", label: "Milestone unlocked" },
  { key: "notif_training", label: "Training reminders" },
];

const DEFAULT_PREF: PartnerNotificationPref = { email: true, whatsapp: true, push: true };

const LANGS: { code: "en" | "hi" | "hinglish"; label: string }[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "hinglish", label: "Hinglish" },
];

export function PartnerSettingsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchProfile = useServerFn(getPartnerProfile);
  const saveProfile = useServerFn(updatePartnerProfile);
  const saveMetadata = useServerFn(updatePartnerMetadata);

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["partner", "profile"],
    queryFn: () => fetchProfile({}),
    staleTime: 30_000,
  });

  const meta = (profile?.metadata ?? {}) as PartnerMetadata;
  const kyc = meta.kyc_review;
  const language = meta.language ?? "en";

  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({
    mobile: "",
    email: "",
    state: "",
    pincode: "",
    tagline: "",
    success_story: "",
  });

  useEffect(() => {
    if (!profile) return;
    setForm({
      mobile: profile.mobile ?? "",
      email: profile.email ?? "",
      state: profile.state ?? "",
      pincode: profile.pincode ?? "",
      tagline: profile.tagline ?? "",
      success_story: profile.success_story ?? "",
    });
  }, [profile]);

  const profileMutation = useMutation({
    mutationFn: (data: typeof form) => saveProfile({ data }),
    onSuccess: () => {
      toast.success("Profile updated");
      qc.invalidateQueries({ queryKey: ["partner", "profile"] });
      setEditOpen(false);
    },
    onError: (e: Error) => toast.error(e.message || "Update failed"),
  });

  const metaMutation = useMutation({
    mutationFn: (data: Parameters<typeof saveMetadata>[0]["data"]) => saveMetadata({ data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["partner", "profile"] });
    },
    onError: (e: Error) => toast.error(e.message || "Could not save"),
  });

  const [signingOut, setSigningOut] = useState(false);
  const handleLogout = async () => {
    setSigningOut(true);
    try {
      await supabase.auth.signOut();
      toast.success("Signed out");
      navigate({ to: "/auth" });
    } catch (e) {
      toast.error("Sign out failed");
      setSigningOut(false);
    }
  };

  const profileFields = useMemo(
    () => [
      { label: "Full Name", value: profile?.full_name ?? "—", icon: UserRound },
      { label: "Mobile", value: profile?.mobile ?? "—", icon: Phone, verified: !!profile?.mobile },
      { label: "Email", value: profile?.email ?? "—", icon: Mail, verified: !!profile?.email },
      {
        label: "District",
        value: [profile?.district, profile?.state].filter(Boolean).join(", ") || "—",
        icon: MapPin,
      },
    ],
    [profile],
  );

  return (
    <PartnerPageShell
      title="Profile & Settings"
      subtitle="Aapka partner profile, KYC status aur preferences."
      icon={SettingsIcon}
    >
      {isLoading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-16">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : error || !profile ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
          Partner profile nahi mila. Pehle Growth Partner application submit karo, phir yahan wapas aao.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Status banner */}
          <StatusBanner status={profile.status} verifiedAt={profile.verified_at} />

          {/* Profile */}
          <Section title="Profile" icon={UserRound}>
            <div className="grid gap-3 md:grid-cols-2">
              {profileFields.map((f) => (
                <FieldRow key={f.label} field={f} />
              ))}
            </div>
            {(profile.tagline || profile.success_story) && (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {profile.tagline && (
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Tagline
                    </div>
                    <div className="text-sm text-slate-800">{profile.tagline}</div>
                  </div>
                )}
                {profile.success_story && (
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Success story
                    </div>
                    <div className="whitespace-pre-wrap text-sm text-slate-800">
                      {profile.success_story}
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="mt-4">
              <Button
                onClick={() => setEditOpen(true)}
                className="rounded-lg bg-[#0B1330] text-xs font-bold text-white hover:bg-[#0B1330]/90"
                size="sm"
              >
                Edit profile
              </Button>
            </div>
          </Section>

          {/* KYC */}
          <Section title="KYC Verification" icon={FileCheck2}>
            <KycCard kyc={kyc} docUrl={meta.kyc_document_url} />
          </Section>

          {/* Agreement */}
          <Section title="Growth Partner Agreement" icon={ShieldCheck}>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-5">
              <div>
                <div className="text-sm font-bold text-[#0B1330]">
                  {meta.agreement_signed_at ? "Agreement signed" : "Agreement pending"}
                </div>
                <div className="text-xs text-slate-500">
                  {meta.agreement_signed_at
                    ? `Signed on ${fmtDate(meta.agreement_signed_at)}${
                        meta.agreement_version ? ` · v${meta.agreement_version}` : ""
                      }`
                    : "Approval ke baad e-sign link email par bhej denge."}
                </div>
              </div>
              <a
                href="/growth-partner#agreement"
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                View terms
              </a>
            </div>
          </Section>

          {/* Notifications */}
          <Section title="Notification Preferences" icon={Bell}>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Event</th>
                    <th className="px-4 py-3 text-center">Email</th>
                    <th className="px-4 py-3 text-center">WhatsApp</th>
                    <th className="px-4 py-3 text-center">Push</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {NOTIF_ROWS.map((row) => {
                    const pref: PartnerNotificationPref = { ...DEFAULT_PREF, ...(meta[row.key] ?? {}) };
                    const set = (channel: keyof PartnerNotificationPref) =>
                      metaMutation.mutate({
                        [row.key]: { ...pref, [channel]: !pref[channel] },
                      } as Parameters<typeof saveMetadata>[0]["data"]);
                    return (
                      <tr key={row.key}>
                        <td className="px-4 py-3 text-slate-700">{row.label}</td>
                        {(["email", "whatsapp", "push"] as const).map((c) => (
                          <td key={c} className="px-4 py-3 text-center">
                            <Toggle
                              on={!!pref[c]}
                              onClick={() => set(c)}
                              disabled={metaMutation.isPending}
                            />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Section>

          {/* Language */}
          <Section title="Language" icon={Globe}>
            <div className="flex flex-wrap gap-2">
              {LANGS.map((l) => {
                const active = language === l.code;
                return (
                  <button
                    key={l.code}
                    disabled={metaMutation.isPending || active}
                    onClick={() => metaMutation.mutate({ language: l.code })}
                    className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                      active
                        ? "bg-[#0B1330] text-white"
                        : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                    } disabled:opacity-70`}
                  >
                    {l.label}
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Logout */}
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-red-900">Logout</h3>
                <p className="text-sm text-red-700/80">
                  Aap partner dashboard se sign out ho jayenge.
                </p>
              </div>
              <Button
                onClick={handleLogout}
                disabled={signingOut}
                variant="destructive"
                className="rounded-xl font-bold"
              >
                {signingOut ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing out…
                  </>
                ) : (
                  <>
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit profile dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="p-mobile">Mobile</Label>
              <Input
                id="p-mobile"
                value={form.mobile}
                onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))}
                placeholder="+91 98765 43210"
                maxLength={20}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="p-email">Email</Label>
              <Input
                id="p-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                maxLength={255}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="p-state">State</Label>
                <Input
                  id="p-state"
                  value={form.state}
                  onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                  maxLength={80}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="p-pin">Pincode</Label>
                <Input
                  id="p-pin"
                  value={form.pincode}
                  onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))}
                  inputMode="numeric"
                  maxLength={10}
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="p-tag">Tagline</Label>
              <Input
                id="p-tag"
                value={form.tagline}
                onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
                placeholder="Jaipur ke top salon partner"
                maxLength={140}
              />
              <span className="text-[11px] text-slate-500">{form.tagline.length}/140</span>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="p-story">Success story</Label>
              <Textarea
                id="p-story"
                value={form.success_story}
                onChange={(e) => setForm((f) => ({ ...f, success_story: e.target.value }))}
                rows={4}
                maxLength={2000}
                placeholder="Kya kaha aapke shops ne? Kaise partners bane?"
              />
              <span className="text-[11px] text-slate-500">{form.success_story.length}/2000</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditOpen(false)} disabled={profileMutation.isPending}>
              Cancel
            </Button>
            <Button
              onClick={() => profileMutation.mutate(form)}
              disabled={profileMutation.isPending}
              className="bg-[#0B1330] text-white hover:bg-[#0B1330]/90"
            >
              {profileMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PartnerPageShell>
  );
}

function StatusBanner({ status, verifiedAt }: { status: string; verifiedAt: string | null }) {
  if (status === "approved") {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-emerald-900">Partner approved</div>
            <div className="text-xs text-emerald-700/80">
              {verifiedAt ? `Verified ${fmtDate(verifiedAt)}` : "Aap ab leads generate kar sakte ho."}
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (status === "rejected") {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
        <div className="flex items-center gap-2 font-bold">
          <ShieldAlert className="h-4 w-4" /> Application rejected
        </div>
        <p className="mt-1 text-red-700/90">
          Support se sampark karein — aapki application dobara review ki ja sakti hai.
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
      <div className="flex items-center gap-2 font-bold">
        <Sparkles className="h-4 w-4" /> Application under review
      </div>
      <p className="mt-1 text-amber-800/90">
        Aapki application submit ho gayi hai. Approval ke baad KYC aur agreement steps unlock honge.
      </p>
    </div>
  );
}

function KycCard({ kyc, docUrl }: { kyc?: PartnerMetadata["kyc_review"]; docUrl?: string }) {
  const status = kyc?.status ?? "pending";
  const tone =
    status === "approved"
      ? { bg: "bg-emerald-50", border: "border-emerald-200", chip: "bg-emerald-100 text-emerald-700", label: "Verified" }
      : status === "rejected"
      ? { bg: "bg-red-50", border: "border-red-200", chip: "bg-red-100 text-red-700", label: "Rejected" }
      : { bg: "bg-amber-50", border: "border-amber-200", chip: "bg-amber-100 text-amber-800", label: "Under review" };

  return (
    <div className={`space-y-3 rounded-xl border ${tone.border} ${tone.bg} p-5`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-700 shadow-sm">
            <FileCheck2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-[#0B1330]">KYC document</div>
            <div className="text-xs text-slate-600">
              {kyc?.reviewed_at ? `Reviewed ${fmtDate(kyc.reviewed_at)}` : "Awaiting reviewer"}
            </div>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${tone.chip}`}>
          <CheckCircle2 className="h-3 w-3" /> {tone.label}
        </span>
      </div>
      {kyc?.notes && (
        <div className="rounded-lg bg-white/80 p-3 text-xs text-slate-700">
          <div className="mb-0.5 font-bold text-slate-500">Reviewer notes</div>
          {kyc.notes}
        </div>
      )}
      {docUrl && (
        <a
          href={docUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex text-xs font-bold text-[#4F46E5] hover:underline"
        >
          View uploaded document →
        </a>
      )}
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-200 bg-white p-6"
    >
      <div className="mb-5 flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#EEF2FF] text-[#4F46E5]">
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="text-base font-bold text-[#0B1330]">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

type FieldRowProps = {
  field: {
    label: string;
    value: string;
    icon: ComponentType<{ className?: string }>;
    verified?: boolean;
  };
};

function FieldRow({ field }: FieldRowProps) {
  const Icon = field.icon;
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-600">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {field.label}
          </div>
          <div className="truncate text-sm font-bold text-[#0B1330]">{field.value}</div>
        </div>
      </div>
      {field.verified && (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#16A34A]">
          <CheckCircle2 className="h-3 w-3" /> Verified
        </span>
      )}
    </div>
  );
}

function Toggle({
  on,
  onClick,
  disabled,
}: {
  on: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={on}
      className={`inline-flex h-5 w-9 items-center rounded-full p-0.5 transition-colors disabled:opacity-60 ${
        on ? "bg-[#4F46E5]" : "bg-slate-200"
      }`}
    >
      <span
        className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${
          on ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function fmtDate(s: string) {
  try {
    return new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return s;
  }
}

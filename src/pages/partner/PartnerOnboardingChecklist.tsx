import { useMemo, useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, ClipboardList, Image as ImageIcon, MapPin, Phone, Sparkles, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { getPartnerProfile, updatePartnerProfile, type PartnerProfile } from "@/lib/partner.functions";
import { uploadToCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";

type ChecklistItem = {
  key: "logo" | "contact" | "location" | "tagline" | "story";
  label: string;
  hint: string;
  icon: typeof ImageIcon;
  done: boolean;
};

function computeItems(p: PartnerProfile | null | undefined): ChecklistItem[] {
  return [
    {
      key: "logo",
      label: "Logo / Photo",
      hint: "Upload karo taaki shop owners aapko pehchan sakein",
      icon: ImageIcon,
      done: !!p?.photo_url,
    },
    {
      key: "contact",
      label: "Contact details",
      hint: "Mobile aur email verify karo",
      icon: Phone,
      done: !!(p?.mobile && p?.email),
    },
    {
      key: "location",
      label: "Location",
      hint: "District, state aur pincode",
      icon: MapPin,
      done: !!(p?.district && p?.state && p?.pincode),
    },
    {
      key: "tagline",
      label: "Tagline",
      hint: "Ek line jo aapko describe kare",
      icon: Sparkles,
      done: !!(p?.tagline && p.tagline.trim().length >= 6),
    },
    {
      key: "story",
      label: "Success story",
      hint: "Aapki journey — shops ko motivate karegi",
      icon: ClipboardList,
      done: !!(p?.success_story && p.success_story.trim().length >= 20),
    },
  ];
}

export function PartnerOnboardingChecklist() {
  const fetchProfile = useServerFn(getPartnerProfile);
  const saveProfile = useServerFn(updatePartnerProfile);
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["partner", "profile"],
    queryFn: () => fetchProfile({}),
    staleTime: 30_000,
  });

  const items = useMemo(() => computeItems(profile), [profile]);
  const doneCount = items.filter((i) => i.done).length;
  const pct = Math.round((doneCount / items.length) * 100);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    photo_url: "",
    mobile: "",
    email: "",
    state: "",
    pincode: "",
    tagline: "",
    success_story: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const cloudinaryReady = isCloudinaryConfigured();

  const onPickLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (e.target) e.target.value = "";
    if (!file) return;
    if (!cloudinaryReady) {
      toast.error("Cloudinary is not configured");
      return;
    }
    setUploading(true);
    try {
      const res = await uploadToCloudinary(file, { folder: "partner-logos" });
      setForm((f) => ({ ...f, photo_url: res.secure_url }));
      toast.success("Logo uploaded — save karke pakka karo");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (!profile) return;
    setForm({
      photo_url: profile.photo_url ?? "",
      mobile: profile.mobile ?? "",
      email: profile.email ?? "",
      state: profile.state ?? "",
      pincode: profile.pincode ?? "",
      tagline: profile.tagline ?? "",
      success_story: profile.success_story ?? "",
    });
  }, [profile]);

  const mutation = useMutation({
    mutationFn: (data: typeof form) => saveProfile({ data }),
    onSuccess: () => {
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: ["partner", "profile"] });
      setOpen(false);
    },
    onError: (err: Error) => toast.error(err.message || "Update failed"),
  });

  if (isLoading || !profile) return null;
  const allDone = doneCount === items.length;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mb-6 overflow-hidden rounded-2xl border p-6 ${
          allDone
            ? "border-[#16A34A]/30 bg-gradient-to-br from-[#DCFCE7] to-white"
            : "border-[#4F46E5]/20 bg-gradient-to-br from-[#EEF2FF] to-white"
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`grid h-10 w-10 place-items-center rounded-xl ${allDone ? "bg-[#16A34A] text-white" : "bg-[#4F46E5] text-white"}`}>
              {allDone ? <CheckCircle2 className="h-5 w-5" /> : <ClipboardList className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0B1330]">
                {allDone ? "Onboarding complete 🎉" : "Complete your onboarding"}
              </h3>
              <p className="text-xs text-slate-500">
                {allDone
                  ? "Aapka partner profile fully setup hai."
                  : `${doneCount} of ${items.length} steps done — profile 100% karo aur trust badhao.`}
              </p>
            </div>
          </div>
          {!allDone && (
            <Button size="sm" onClick={() => setOpen(true)} className="bg-[#0B1330] hover:bg-[#0B1330]/90">
              Complete now
            </Button>
          )}
        </div>

        <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className={`h-full rounded-full ${allDone ? "bg-[#16A34A]" : "bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6]"}`}
          />
        </div>
        <div className="mt-1 text-right text-[11px] font-bold text-slate-500">{pct}%</div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <button
                key={it.key}
                onClick={() => setOpen(true)}
                className={`text-left rounded-xl border p-3 transition ${
                  it.done
                    ? "border-[#16A34A]/30 bg-white/80"
                    : "border-slate-200 bg-white hover:border-[#4F46E5]/40 hover:bg-[#EEF2FF]/40"
                }`}
              >
                <div className="flex items-center gap-2">
                  {it.done ? (
                    <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
                  ) : (
                    <Circle className="h-4 w-4 text-slate-400" />
                  )}
                  <Icon className={`h-3.5 w-3.5 ${it.done ? "text-[#16A34A]" : "text-[#4F46E5]"}`} />
                  <span className="text-xs font-bold text-[#0B1330]">{it.label}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-[11px] text-slate-500">{it.hint}</p>
              </button>
            );
          })}
        </div>
      </motion.div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete partner profile</DialogTitle>
            <DialogDescription>Ye details shop owners aur admin ko dikhengi.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Field label="Logo / Photo" hint={cloudinaryReady ? "Upload karo ya URL paste karo" : "Cloudinary configure nahi hai — URL paste karein"}>
              <div className="flex items-start gap-3">
                {form.photo_url ? (
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    <img src={form.photo_url} alt="Logo preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, photo_url: "" })}
                      className="absolute right-0 top-0 grid h-5 w-5 place-items-center rounded-bl bg-black/60 text-white"
                      aria-label="Remove logo"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="grid h-20 w-20 shrink-0 place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || !cloudinaryReady}
                  >
                    {uploading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Upload className="mr-1 h-4 w-4" />}
                    {form.photo_url ? "Replace logo" : "Upload logo"}
                  </Button>
                  <Input
                    placeholder="https://..."
                    value={form.photo_url}
                    onChange={(e) => setForm({ ...form, photo_url: e.target.value })}
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onPickLogo}
                  />
                </div>
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Mobile">
                <Input
                  placeholder="+91 98765 43210"
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="State">
                <Input
                  placeholder="Rajasthan"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                />
              </Field>
              <Field label="Pincode">
                <Input
                  placeholder="302001"
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Tagline" hint="Max 140 characters">
              <Input
                maxLength={140}
                placeholder="Helping salons grow in my district"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              />
            </Field>
            <Field label="Success story" hint="Aapki journey (min 20 characters)">
              <Textarea
                rows={4}
                maxLength={2000}
                placeholder="Maine apne district me..."
                value={form.success_story}
                onChange={(e) => setForm({ ...form, success_story: e.target.value })}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button
              onClick={() => mutation.mutate(form)}
              disabled={mutation.isPending}
              className="bg-[#0B1330] hover:bg-[#0B1330]/90"
            >
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-bold text-[#0B1330]">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}

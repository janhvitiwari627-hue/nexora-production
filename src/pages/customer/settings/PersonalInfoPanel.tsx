import { useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PROFILE } from "./mockSettings";
import { INDIAN_STATES, getDistricts, getBlocks } from "./indiaGeo";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/integrations/supabase/client";
import { ProfileImageUpload } from "@/components/shared/ProfileImageUpload";

function slugifyUsername(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9.\s_-]/g, "")
    .replace(/\s+/g, ".")
    .replace(/\.+/g, ".")
    .slice(0, 30);
}

export function PersonalInfoPanel() {
  const { user, profile, refreshProfile } = useAuthStore();
  const [avatar, setAvatar] = useState<string>(profile?.avatar_url || "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [usernameTouched, setUsernameTouched] = useState(false);

  const [form, setForm] = useState({
    fullName: profile?.full_name || "",
    username: profile?.username || "",
    gender: (profile?.gender || "prefer_not") as string,
    dob: profile?.date_of_birth || "",
    state: profile?.state || "",
    district: profile?.district || "",
    block: profile?.block || "",
    pincode: profile?.pincode || "",
  });
  const [pincodeError, setPincodeError] = useState<string | null>(null);

  // Hydrate when profile arrives
  useEffect(() => {
    if (!profile) return;
    setForm({
      fullName: profile.full_name || "",
      username: profile.username || "",
      gender: (profile.gender || "prefer_not") as string,
      dob: profile.date_of_birth || "",
      state: profile.state || "",
      district: profile.district || "",
      block: profile.block || "",
      pincode: profile.pincode || "",
    });
    setAvatar(profile.avatar_url || "");
    setUsernameTouched(!!profile.username);
  }, [profile]);

  const districts = useMemo(() => getDistricts(form.state), [form.state]);
  const blocks = useMemo(() => getBlocks(form.state, form.district), [form.state, form.district]);

  function onFullNameChange(v: string) {
    setForm((f) => ({
      ...f,
      fullName: v,
      username: usernameTouched ? f.username : slugifyUsername(v),
    }));
  }

  function friendlyUploadError(err: any, stage: "upload" | "sign" | "profile" | "remove"): string {
    const raw = (err?.message || err?.error_description || err?.error || "").toString();
    const status = Number(err?.statusCode ?? err?.status ?? 0);
    const lower = raw.toLowerCase();

    if (!navigator.onLine) return "You appear to be offline. Check your connection and try again.";
    if (lower.includes("network") || lower.includes("fetch") || lower.includes("failed to fetch")) {
      return "Network error while contacting the server. Please try again.";
    }
    if (status === 401 || lower.includes("jwt") || lower.includes("unauthorized")) {
      return "Your session has expired. Please sign in again and retry.";
    }
    if (status === 403 || lower.includes("row-level security") || lower.includes("not allowed") || lower.includes("policy")) {
      return "You don't have permission to update this photo.";
    }
    if (status === 413 || lower.includes("payload too large") || lower.includes("too large")) {
      return "That image is too large. Please choose a file under 5 MB.";
    }
    if (status === 415 || lower.includes("mime") || lower.includes("content type")) {
      return "Unsupported image type. Please use a JPG, PNG, or WEBP.";
    }
    if (status === 429 || lower.includes("rate")) {
      return "Too many uploads in a short time. Please wait a moment and try again.";
    }
    if (status >= 500) return "The server had a problem saving your photo. Please try again shortly.";

    switch (stage) {
      case "upload": return "We couldn't upload your photo. Please try a different image.";
      case "sign":   return "Uploaded, but we couldn't generate a preview link. Please try again.";
      case "profile":return "Photo uploaded, but saving it to your profile failed. Please retry.";
      case "remove": return "We couldn't remove your photo. Please try again.";
    }
  }

  async function handleAvatarFile(f: File) {
    if (!user) {
      const msg = "Please sign in to upload a photo";
      setUploadError(msg);
      toast.error(msg);
      return;
    }
    setUploading(true);
    setUploadError(null);
    const preview = URL.createObjectURL(f);
    setAvatar(preview);
    let stage: "upload" | "sign" | "profile" = "upload";
    try {
      const ext = f.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, f, { upsert: true, contentType: f.type });
      if (upErr) throw upErr;
      stage = "sign";
      const { data: signed, error: signErr } = await supabase.storage
        .from("avatars")
        .createSignedUrl(path, 60 * 60 * 24 * 365);
      if (signErr) throw signErr;
      const url = signed.signedUrl;
      stage = "profile";
      const { error: updErr } = await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("id", user.id);
      if (updErr) throw updErr;
      setAvatar(url);
      await refreshProfile();
      toast.success("Profile photo updated");
    } catch (err: any) {
      const msg = friendlyUploadError(err, stage);
      console.error("[avatar upload] stage=", stage, err);
      setUploadError(msg);
      toast.error(msg);
      setAvatar(profile?.avatar_url || "");
    } finally {
      URL.revokeObjectURL(preview);
      setUploading(false);
    }
  }

  async function handleAvatarRemove() {
    if (!user) return;
    const previous = avatar;
    setAvatar("");
    setUploadError(null);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", user.id);
      if (error) throw error;
      await refreshProfile();
      toast.success("Profile photo removed");
    } catch (err: any) {
      const msg = friendlyUploadError(err, "remove");
      console.error("[avatar remove]", err);
      setUploadError(msg);
      toast.error(msg);
      setAvatar(previous);
    }
  }



  function handlePincode(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 6);
    setForm({ ...form, pincode: raw });
    if (raw.length === 0) setPincodeError(null);
    else if (raw.length < 6) setPincodeError("Pincode must be 6 digits");
    else if (!/^[1-9][0-9]{5}$/.test(raw)) setPincodeError("Invalid Indian pincode");
    else setPincodeError(null);
  }

  async function handleSave() {
    if (!user) {
      toast.error("Please sign in to save changes");
      return;
    }
    if (form.pincode && pincodeError) {
      toast.error(pincodeError);
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: form.fullName || null,
          username: form.username || null,
          gender: form.gender || null,
          date_of_birth: form.dob || null,
          state: form.state || null,
          district: form.district || null,
          block: form.block || null,
          pincode: form.pincode || null,
        })
        .eq("id", user.id);
      if (error) throw error;
      await refreshProfile();
      toast.success("Personal information saved");
    } catch (err: any) {
      toast.error(err?.message || "Could not save changes");
    } finally {
      setSaving(false);
    }
  }

  const initials = (form.fullName || PROFILE.fullName)
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("");

  return (
    <PanelShell title="Personal information" subtitle="How you appear across Nexora.">
      <ProfileImageUpload
        value={avatar}
        onFile={handleAvatarFile}
        onRemove={handleAvatarRemove}
        fallback={initials}
        uploading={uploading}
        maxSizeMB={5}
      />

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field label="Full name">
          <input value={form.fullName} onChange={(e) => onFullNameChange(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Username">
          <input
            value={form.username}
            onChange={(e) => {
              setUsernameTouched(true);
              setForm({ ...form, username: slugifyUsername(e.target.value) });
            }}
            placeholder="auto-suggested from name"
            className={inputCls}
          />
        </Field>
        <Field label="Gender">
          <div className="flex flex-wrap gap-3 pt-1">
            {[
              { v: "male", l: "Male" },
              { v: "female", l: "Female" },
              { v: "other", l: "Other" },
              { v: "prefer_not", l: "Prefer not to say" },
            ].map((g) => (
              <label key={g.v} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  checked={form.gender === g.v}
                  onChange={() => setForm({ ...form, gender: g.v })}
                  className="accent-primary h-4 w-4"
                />
                {g.l}
              </label>
            ))}
          </div>
        </Field>
        <Field label="Date of birth">
          <input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} className={inputCls} />
        </Field>
        <Field label="State">
          <SearchableSelect
            value={form.state}
            placeholder="Select state / UT"
            searchPlaceholder="Search state..."
            options={INDIAN_STATES}
            onChange={(v) => setForm({ ...form, state: v, district: "", block: "" })}
          />
        </Field>
        <Field label="District">
          <SearchableSelect
            value={form.district}
            placeholder={form.state ? "Select district" : "Select state first"}
            searchPlaceholder="Search district..."
            options={districts}
            disabled={!form.state}
            onChange={(v) => setForm({ ...form, district: v, block: "" })}
          />
        </Field>
        <Field label="Block / Tehsil">
          <SearchableSelect
            value={form.block}
            placeholder={form.district ? "Select block" : "Select district first"}
            searchPlaceholder="Search block..."
            options={blocks}
            disabled={!form.district}
            onChange={(v) => setForm({ ...form, block: v })}
          />
        </Field>
        <Field label="Pincode">
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={form.pincode}
            onChange={handlePincode}
            placeholder="6-digit pincode"
            className={inputCls}
            aria-invalid={!!pincodeError}
          />
          {pincodeError && <p className="text-destructive mt-1 text-xs">{pincodeError}</p>}
        </Field>
      </div>

      <SaveBar onSave={handleSave} saving={saving} />
    </PanelShell>
  );
}

function SearchableSelect({
  value,
  options,
  onChange,
  placeholder,
  searchPlaceholder,
  disabled,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  placeholder: string;
  searchPlaceholder: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            inputCls,
            "flex items-center justify-between text-left disabled:cursor-not-allowed disabled:opacity-50",
            !value && "text-muted-foreground",
          )}
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt}
                  value={opt}
                  onSelect={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === opt ? "opacity-100" : "opacity-0")} />
                  {opt}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export const inputCls =
  "border-border bg-background focus-visible:ring-ring h-10 w-full rounded-md border px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-heading mb-1 block text-xs font-bold uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

export function PanelShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="bg-card border-border rounded-[var(--radius-card-lg)] border p-5 md:p-6">
      <header className="mb-4">
        <h2 className="text-heading text-xl font-black">{title}</h2>
        {subtitle && <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}

export function SaveBar({ onSave, saving }: { onSave?: () => void; saving?: boolean }) {
  return (
    <div className="border-border mt-6 flex justify-end gap-2 border-t pt-4">
      <button type="button" className="border-border hover:bg-accent rounded-md border px-4 py-2 text-sm font-semibold">Cancel</button>
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-bold shadow-sm disabled:opacity-60"
      >
        {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {saving ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}

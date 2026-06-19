import { useRef, useState } from "react";
import { Camera, Upload } from "lucide-react";
import { PROFILE } from "./mockSettings";

export function PersonalInfoPanel() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState<string>(PROFILE.avatarUrl);
  const [form, setForm] = useState({
    fullName: PROFILE.fullName,
    username: PROFILE.username,
    gender: PROFILE.gender as string,
    dob: PROFILE.dob,
    country: PROFILE.country,
    state: PROFILE.state,
    city: PROFILE.city,
  });

  function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    // In production, upload to Cloudinary unsigned preset and store secure_url.
    const url = URL.createObjectURL(f);
    setAvatar(url);
  }

  return (
    <PanelShell title="Personal information" subtitle="How you appear across Nexora.">
      <div className="flex items-start gap-4">
        <div className="relative">
          <div className="bg-muted ring-border grid h-24 w-24 place-items-center overflow-hidden rounded-full ring-2">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <span className="text-heading text-2xl font-black">
                {form.fullName.split(" ").map((s) => s[0]).slice(0, 2).join("")}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="bg-primary text-primary-foreground absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full shadow-md"
            aria-label="Upload avatar"
          >
            <Camera className="h-4 w-4" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
        </div>
        <div className="flex-1">
          <p className="text-heading text-sm font-bold">Profile photo</p>
          <p className="text-muted-foreground text-xs">JPG or PNG, max 5 MB. We'll auto-crop to a circle.</p>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="border-border hover:bg-accent mt-2 inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold"
          >
            <Upload className="h-3.5 w-3.5" /> Upload new
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field label="Full name">
          <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Username">
          <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className={inputCls} />
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
        <Field label="Country">
          <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className={inputCls}>
            {["India", "UAE", "Singapore", "United Kingdom", "United States"].map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="State">
          <select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className={inputCls}>
            {["Karnataka", "Maharashtra", "Tamil Nadu", "Delhi", "Telangana"].map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="City">
          <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputCls}>
            {["Bengaluru", "Mumbai", "Chennai", "New Delhi", "Hyderabad"].map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
      </div>

      <SaveBar />
    </PanelShell>
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

export function SaveBar({ onSave }: { onSave?: () => void }) {
  return (
    <div className="border-border mt-6 flex justify-end gap-2 border-t pt-4">
      <button type="button" className="border-border hover:bg-accent rounded-md border px-4 py-2 text-sm font-semibold">Cancel</button>
      <button
        type="button"
        onClick={onSave}
        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-bold shadow-sm"
      >
        Save changes
      </button>
    </div>
  );
}

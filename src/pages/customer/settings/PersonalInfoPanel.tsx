import { useMemo, useRef, useState } from "react";
import { Camera, Check, ChevronsUpDown, Upload } from "lucide-react";
import { PROFILE } from "./mockSettings";
import { INDIAN_STATES, getDistricts, getBlocks } from "./indiaGeo";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

export function PersonalInfoPanel() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState<string>(PROFILE.avatarUrl);
  const [form, setForm] = useState({
    fullName: PROFILE.fullName,
    username: PROFILE.username,
    gender: PROFILE.gender as string,
    dob: PROFILE.dob,
    state: "",
    district: "",
    block: "",
    pincode: "",
  });
  const [pincodeError, setPincodeError] = useState<string | null>(null);

  const districts = useMemo(() => getDistricts(form.state), [form.state]);
  const blocks = useMemo(() => getBlocks(form.state, form.district), [form.state, form.district]);

  function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setAvatar(url);
  }

  function handlePincode(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 6);
    setForm({ ...form, pincode: raw });
    if (raw.length === 0) setPincodeError(null);
    else if (raw.length < 6) setPincodeError("Pincode must be 6 digits");
    else if (!/^[1-9][0-9]{5}$/.test(raw)) setPincodeError("Invalid Indian pincode");
    else setPincodeError(null);
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

      <SaveBar />
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

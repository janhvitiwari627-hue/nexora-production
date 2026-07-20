import { useEffect, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ALL_SERVICES,
  DAYS,
  DESIGNATIONS,
  LANGUAGES,
  SLOTS,
  SPECIALIZATIONS,
  emptyAvailability,
  type Availability,
  type Day,
  type DaySlot,
  type StaffMember,
} from "./mockStaff";
import { cn } from "@/lib/utils";

function emptyStaff(): StaffMember {
  return {
    id: "",
    name: "",
    designation: DESIGNATIONS[0],
    experienceYears: 1,
    photo: "https://i.pravatar.cc/200?img=8",
    specializations: [],
    languages: [],
    assignedServiceIds: [],
    rating: 0,
    reviewCount: 0,
    available: true,
    bookingsThisMonth: 0,
    revenueThisMonth: 0,
    portfolio: [],
    certificates: [],
    availability: emptyAvailability(),
  };
}

export function AddEditStaffModal({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (s: StaffMember) => void;
  initial?: StaffMember | null;
}) {
  const [form, setForm] = useState<StaffMember>(emptyStaff());

  useEffect(() => {
    if (open) setForm(initial ?? emptyStaff());
  }, [open, initial]);

  const toggleChip = (key: "specializations" | "languages" | "assignedServiceIds", val: string) => {
    setForm((f) => {
      const set = new Set(f[key]);
      if (set.has(val)) set.delete(val);
      else set.add(val);
      return { ...f, [key]: Array.from(set) };
    });
  };

  const toggleSlot = (day: Day, slot: DaySlot) => {
    setForm((f) => {
      const a: Availability = {
        ...f.availability,
        [day]: { ...f.availability[day], [slot]: !f.availability[day][slot] },
      };
      return { ...f, availability: a };
    });
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => setForm((f) => ({ ...f, photo: String(r.result) }));
    r.readAsDataURL(file);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({ ...form, id: form.id || `st${Date.now()}` });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Edit Staff" : "Add Staff"} size="xl">
      <form onSubmit={submit} className="space-y-6 p-6">
        {/* Photo + identity */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <label className="border-border bg-muted/30 hover:bg-muted/50 group relative grid h-28 w-28 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-2xl border-2 border-dashed">
            {form.photo ? (
              <img src={form.photo} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="text-muted-foreground flex flex-col items-center text-xs">
                <ImagePlus className="mb-1 h-5 w-5" />
                Upload
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </label>

          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Full name">
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>
            <Field label="Designation">
              <Select
                value={form.designation}
                onValueChange={(v) => setForm({ ...form, designation: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DESIGNATIONS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Experience (years)">
              <Input
                type="number"
                min={0}
                value={form.experienceYears}
                onChange={(e) => setForm({ ...form, experienceYears: Number(e.target.value) })}
              />
            </Field>
            <Field label="Instagram URL">
              <Input
                value={form.instagram ?? ""}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                placeholder="https://instagram.com/…"
              />
            </Field>
            <Field label="WhatsApp">
              <Input
                value={form.whatsapp ?? ""}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="9198XXXXXXXX"
              />
            </Field>
            <Field label="Available now">
              <div className="flex h-9 items-center">
                <Switch
                  checked={form.available}
                  onCheckedChange={(c) => setForm({ ...form, available: c })}
                />
                <span className="text-muted-foreground ml-2 text-xs">
                  {form.available ? "Marked available" : "Off duty"}
                </span>
              </div>
            </Field>
          </div>
        </div>

        {/* Chip multi-selects */}
        <ChipGroup
          label="Specializations"
          options={SPECIALIZATIONS}
          selected={form.specializations}
          onToggle={(v) => toggleChip("specializations", v)}
        />
        <ChipGroup
          label="Languages spoken"
          options={LANGUAGES}
          selected={form.languages}
          onToggle={(v) => toggleChip("languages", v)}
        />
        <ChipGroup
          label="Assigned services"
          options={ALL_SERVICES.map((s) => s.name)}
          selected={ALL_SERVICES.filter((s) => form.assignedServiceIds.includes(s.id)).map(
            (s) => s.name,
          )}
          onToggle={(name) => {
            const svc = ALL_SERVICES.find((s) => s.name === name);
            if (svc) toggleChip("assignedServiceIds", svc.id);
          }}
        />

        {/* Availability grid */}
        <div className="space-y-2">
          <Label className="text-heading text-xs font-semibold uppercase tracking-wide">
            Weekly availability
          </Label>
          <div className="border-border overflow-hidden rounded-lg border">
            <div className="grid grid-cols-[80px_repeat(7,1fr)] text-center text-xs">
              <div className="bg-muted/60 border-border border-b p-2 font-semibold" />
              {DAYS.map((d) => (
                <div
                  key={d}
                  className="bg-muted/60 border-border border-b border-l p-2 font-semibold"
                >
                  {d}
                </div>
              ))}
              {SLOTS.map((slot) => (
                <div key={slot} className="contents">
                  <div className="bg-muted/30 border-border border-b p-2 text-left text-[11px] font-semibold uppercase">
                    {slot}
                  </div>
                  {DAYS.map((d) => {
                    const checked = form.availability[d][slot];
                    return (
                      <button
                        key={`${d}-${slot}`}
                        type="button"
                        onClick={() => toggleSlot(d, slot)}
                        className={cn(
                          "border-border flex items-center justify-center border-b border-l py-2 transition",
                          checked ? "bg-success/15 text-success" : "bg-card hover:bg-muted/40",
                        )}
                        aria-pressed={checked}
                      >
                        <Checkbox
                          checked={checked}
                          aria-label={`${d} ${slot}`}
                          className="pointer-events-none"
                        />
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{initial ? "Save changes" : "Add staff"}</Button>
        </div>
      </form>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-heading text-xs font-semibold uppercase tracking-wide">{label}</Label>
      {children}
    </div>
  );
}

function ChipGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (val: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-heading text-xs font-semibold uppercase tracking-wide">{label}</Label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition",
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border bg-card text-body hover:bg-muted/40",
              )}
            >
              {active && <X className="h-3 w-3" />}
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

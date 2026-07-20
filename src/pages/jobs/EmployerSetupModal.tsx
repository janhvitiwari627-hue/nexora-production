import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/authStore";
import { getMyEmployerProfile, upsertEmployerProfile } from "@/lib/jobs";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onClose: () => void;
  redirectTo?: string;
};

const BUSINESS_TYPES = [
  "Salon",
  "Spa",
  "Barbershop",
  "Nail Studio",
  "Makeup Studio",
  "Academy",
  "Other",
];

export function EmployerSetupModal({ open, onClose, redirectTo = "/hire/post-job" }: Props) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    business_name: "",
    business_type: BUSINESS_TYPES[0],
    city: "",
    state: "",
    phone: "",
  });

  useEffect(() => {
    if (!open || !user) return;
    let cancelled = false;
    setChecking(true);
    getMyEmployerProfile(user.id)
      .then((p) => {
        if (cancelled) return;
        if (p) {
          onClose();
          navigate({ to: redirectTo });
        }
      })
      .catch(() => {})
      .finally(() => !cancelled && setChecking(false));
    return () => {
      cancelled = true;
    };
  }, [open, user, navigate, onClose, redirectTo]);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.business_name || !form.city || !form.state || !form.phone) {
      toast.error("Please fill all required fields");
      return;
    }
    setSaving(true);
    try {
      await upsertEmployerProfile(user.id, form);
      toast.success("Business profile saved");
      onClose();
      navigate({ to: redirectTo });
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-card w-full max-w-md rounded-[var(--radius-card)] border border-border p-6 shadow-2xl">
        <h2 className="text-heading text-xl font-bold">Set up your business profile</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Set up your business profile to post jobs.
        </p>
        {checking ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Checking…</div>
        ) : (
          <form onSubmit={submit} className="mt-4 space-y-3">
            <Field label="Business / Salon name" required>
              <input
                required
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                value={form.business_name}
                onChange={(e) => setForm({ ...form, business_name: e.target.value })}
              />
            </Field>
            <Field label="Business type" required>
              <select
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                value={form.business_type}
                onChange={(e) => setForm({ ...form, business_type: e.target.value })}
              >
                {BUSINESS_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="City" required>
                <input
                  required
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </Field>
              <Field label="State" required>
                <input
                  required
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Phone number" required>
              <input
                required
                type="tel"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </Field>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-[var(--radius-button)] border border-border px-4 py-2.5 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-gradient-cta text-primary-foreground flex-1 rounded-[var(--radius-button)] px-4 py-2.5 text-sm font-bold shadow-[var(--shadow-glow)] disabled:opacity-60"
              >
                {saving ? "Saving…" : "Continue"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-heading mb-1 block text-xs font-semibold">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      {children}
    </label>
  );
}

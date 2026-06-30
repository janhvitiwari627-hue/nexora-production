import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Building2, User, Phone, MessageCircle, MapPin, Image as ImageIcon, Clock,
  Sparkles, QrCode, ListChecks, Check, ChevronLeft, ChevronRight, Loader2,
  Palette, Rocket, Upload, LocateFixed, Cloud,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { BackButton } from "@/components/shared/BackButton";
import { useOwnerContext } from "@/hooks/use-owner-context";
import { uploadToCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";
import {
  getOwnerSalonFull,
  updateOwnerSalon,
  listOwnerServices,
  upsertOwnerService,
  markSalonSetupComplete,
} from "@/lib/owner.functions";

const CATEGORIES = [
  "Hair Salon", "Barber Shop", "Beauty Parlour", "Spa",
  "Massage Center", "Tattoo Studio", "Nail Art Studio",
];

const DAYS = [
  { key: "mon", label: "Mon" }, { key: "tue", label: "Tue" }, { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" }, { key: "fri", label: "Fri" }, { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

type Hours = Record<string, { open: string; close: string; closed: boolean }>;
const DEFAULT_HOURS: Hours = Object.fromEntries(
  DAYS.map((d) => [d.key, { open: "10:00", close: "20:00", closed: d.key === "sun" }]),
) as Hours;

const URL_FIELDS = new Set(["logo_url", "cover_image_url"]);
const UPI_PATTERN = /^[a-zA-Z0-9._-]+@[a-zA-Z]{2,64}$/;

type ServiceRow = { id?: string; name: string; price: number; duration_minutes: number };
const EMPTY_SERVICE: ServiceRow = { name: "", price: 0, duration_minutes: 30 };

type Form = {
  name: string;
  category: string;
  owner_name: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  logo_url: string;
  cover_image_url: string;
  hours: Hours;
  upi_id: string;
};

function sanitizeSetupPatch(
  patch: Partial<Form>,
  options: { omitIncompleteUpi?: boolean } = {},
) {
  const cleaned: Record<string, unknown> = {};
  const omitIncompleteUpi = options.omitIncompleteUpi ?? true;

  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    if (typeof value !== "string") {
      cleaned[key] = value;
      continue;
    }

    const trimmed = value.trim();
    if (URL_FIELDS.has(key)) {
      if (!trimmed) cleaned[key] = null;
      else if (/^https?:\/\//i.test(trimmed)) cleaned[key] = trimmed;
      continue;
    }

    if (key === "upi_id") {
      if (!trimmed) cleaned[key] = null;
      else if (UPI_PATTERN.test(trimmed)) cleaned[key] = trimmed;
      else if (!omitIncompleteUpi) cleaned[key] = trimmed;
      continue;
    }

    if (key === "name" && !trimmed) continue;
    cleaned[key] = trimmed;
  }

  return cleaned;
}

function friendlySetupError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || "Please check the setup fields.");
  if (message.includes("upi_id")) return "Please enter a valid UPI ID, for example yourname@okhdfc.";
  if (message.includes("logo_url") || message.includes("cover_image_url") || message.includes("Invalid url")) {
    return "Please upload a valid logo or cover image before saving.";
  }
  return message;
}

const STEPS = [
  { id: "basics", label: "Business basics", icon: Building2 },
  { id: "location", label: "Location pin", icon: MapPin },
  { id: "brand", label: "Logo & cover", icon: ImageIcon },
  { id: "hours", label: "Working hours", icon: Clock },
  { id: "services", label: "Top 5 services", icon: Sparkles },
  { id: "payment", label: "Nexora QR (UPI)", icon: QrCode },
  { id: "theme", label: "Pick a theme", icon: Palette },
  { id: "review", label: "Review & go live", icon: Rocket },
] as const;

export function SetupWizardPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { activeSalonId, activeSalon, isLoading: ownerLoading, hasSalon } = useOwnerContext();
  const stepStorageKey = activeSalonId ? `nexora.setup.step.${activeSalonId}` : null;
  const [stepIdx, setStepIdx] = useState(0);
  const goToStep = (i: number) => {
    setStepIdx(i);
    if (stepStorageKey) try { localStorage.setItem(stepStorageKey, String(i)); } catch { /* noop */ }
  };
  // Restore last-visited step once we know which salon we're on.
  useEffect(() => {
    if (!stepStorageKey) return;
    try {
      const raw = localStorage.getItem(stepStorageKey);
      const n = raw ? Number(raw) : NaN;
      if (Number.isFinite(n) && n >= 0 && n < STEPS.length) setStepIdx(n);
    } catch { /* noop */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepStorageKey]);

  const fetchFull = useServerFn(getOwnerSalonFull);
  const updateFn = useServerFn(updateOwnerSalon);
  const listSvc = useServerFn(listOwnerServices);
  const upsertSvc = useServerFn(upsertOwnerService);
  const completeFn = useServerFn(markSalonSetupComplete);

  const salonQ = useQuery({
    queryKey: ["owner", "salon-full", activeSalonId],
    queryFn: () => fetchFull({ data: { salon_id: activeSalonId! } }),
    enabled: !!activeSalonId,
  });
  const servicesQ = useQuery({
    queryKey: ["owner", "services", activeSalonId],
    queryFn: () => listSvc({ data: { salon_id: activeSalonId! } }),
    enabled: !!activeSalonId,
  });

  const [form, setForm] = useState<Form>({
    name: "", category: "", owner_name: "", phone: "", whatsapp: "",
    address: "", city: "", pincode: "", latitude: null, longitude: null,
    logo_url: "", cover_image_url: "", hours: DEFAULT_HOURS, upi_id: "",
  });
  const [services, setServices] = useState<ServiceRow[]>(
    Array.from({ length: 5 }, () => ({ ...EMPTY_SERVICE })),
  );

  // Hydrate form once data lands.
  const hydratedRef = useRef(false);
  useEffect(() => {
    const s = salonQ.data;
    if (!s) return;
    setForm((prev) => ({
      ...prev,
      name: s.name ?? "", category: s.category ?? "",
      owner_name: (s as { owner_name?: string }).owner_name ?? "",
      phone: s.phone ?? "", whatsapp: s.whatsapp ?? "",
      address: s.address ?? "", city: s.city ?? "", pincode: s.pincode ?? "",
      latitude: s.latitude ?? null, longitude: s.longitude ?? null,
      logo_url: s.logo_url ?? "", cover_image_url: s.cover_image_url ?? "",
      hours: (s.hours as Hours | null) ?? DEFAULT_HOURS,
      upi_id: (s as { upi_id?: string }).upi_id ?? "",
    }));
    hydratedRef.current = true;
  }, [salonQ.data]);

  const servicesHydratedRef = useRef(false);
  useEffect(() => {
    const existing = servicesQ.data;
    if (!existing) return;
    if (existing.length > 0) {
      const rows: ServiceRow[] = Array.from({ length: 5 }, (_, i) => {
        const e = existing[i];
        return e
          ? { id: e.id, name: e.name, price: Number(e.price), duration_minutes: e.duration_minutes }
          : { ...EMPTY_SERVICE };
      });
      setServices(rows);
    }
    servicesHydratedRef.current = true;
  }, [servicesQ.data]);


  // ---------------- Checklist ----------------
  const checklist = useMemo(() => {
    const validUpi = /^[a-zA-Z0-9._-]+@[a-zA-Z]{2,64}$/.test(form.upi_id);
    return [
      { id: "name", label: "Business name", done: !!form.name.trim() },
      { id: "category", label: "Category", done: !!form.category },
      { id: "owner", label: "Owner name", done: !!form.owner_name.trim() },
      { id: "phone", label: "Mobile", done: /^[+]?[0-9]{10,15}$/.test(form.phone) },
      { id: "wa", label: "WhatsApp", done: /^[+]?[0-9]{10,15}$/.test(form.whatsapp) },
      { id: "addr", label: "Address", done: form.address.trim().length >= 5 },
      { id: "pin", label: "Google Maps pin", done: form.latitude != null && form.longitude != null },
      { id: "logo", label: "Logo", done: !!form.logo_url },
      { id: "cover", label: "Cover banner", done: !!form.cover_image_url },
      { id: "svc", label: "Top 5 services", done: services.filter((s) => s.name.trim() && s.price > 0).length >= 5 },
      { id: "hours", label: "Working hours", done: Object.values(form.hours).every((h) => h.closed || (!!h.open && !!h.close)) },
      { id: "upi", label: "Nexora QR (UPI)", done: validUpi },
      { id: "theme", label: "Theme selected", done: !!activeSalon?.selected_template_id },
    ];
  }, [form, services, activeSalon?.selected_template_id]);

  const completed = checklist.filter((c) => c.done).length;
  const pct = Math.round((completed / checklist.length) * 100);

  // ---------------- Mutations ----------------
  const saveStep = useMutation({
    mutationFn: async (patch: Partial<Form>) => {
      if (!activeSalonId) throw new Error("No active salon");
      const cleaned = sanitizeSetupPatch(patch, { omitIncompleteUpi: false });
      return updateFn({ data: { salon_id: activeSalonId, patch: cleaned } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["owner", "salon-full", activeSalonId] }),
    onError: (e: Error) => toast.error(friendlySetupError(e)),
  });

  const saveServices = useMutation({
    mutationFn: async () => {
      if (!activeSalonId) throw new Error("No active salon");
      const valid = services.filter((s) => s.name.trim() && s.price > 0);
      for (const s of valid) {
        await upsertSvc({
          data: {
            id: s.id, salon_id: activeSalonId, name: s.name.trim(),
            price: Number(s.price), duration_minutes: Number(s.duration_minutes) || 30,
            is_active: true,
          },
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["owner", "services", activeSalonId] });
      toast.success("Services saved");
    },
    onError: (e: Error) => toast.error(friendlySetupError(e)),
  });

  const goLive = useMutation({
    mutationFn: async () => {
      if (!activeSalonId) throw new Error("No active salon");
      return completeFn({ data: { salon_id: activeSalonId } });
    },
    onSuccess: (r) => {
      if (!r.ok) {
        toast.error(`Still missing: ${r.missing.slice(0, 3).join(", ")}${r.missing.length > 3 ? "…" : ""}`);
        return;
      }
      qc.invalidateQueries({ queryKey: ["owner", "salons"] });
      toast.success("Your website is live!");
      navigate({ to: "/owner/website" });
    },
    onError: (e: Error) => toast.error(friendlySetupError(e)),
  });

  // ---------------- Autosave ----------------
  const [autosave, setAutosave] = useState<{
    status: "idle" | "saving" | "saved" | "error";
    at: number | null;
    error: string | null;
  }>({ status: "idle", at: null, error: null });
  const lastFormJsonRef = useRef<string>("");
  const lastServicesJsonRef = useRef<string>("");
  const retryRef = useRef<null | (() => Promise<void>)>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (!retryRef.current) return;
    setIsRetrying(true);
    try {
      await retryRef.current();
    } finally {
      setIsRetrying(false);
    }
  };

  // Debounced autosave for salon profile fields.
  useEffect(() => {
    if (!activeSalonId || !hydratedRef.current) return;
    const snapshot = JSON.stringify(form);
    if (snapshot === lastFormJsonRef.current) return;
    const runSave = async () => {
      try {
        setAutosave({ status: "saving", at: null, error: null });
        await updateFn({
          data: {
            salon_id: activeSalonId,
            patch: sanitizeSetupPatch({
              name: form.name, category: form.category, owner_name: form.owner_name,
              phone: form.phone, whatsapp: form.whatsapp, address: form.address,
              city: form.city, pincode: form.pincode,
              latitude: form.latitude, longitude: form.longitude,
              logo_url: form.logo_url, cover_image_url: form.cover_image_url,
              hours: form.hours, upi_id: form.upi_id,
            }),
          },
        });
        lastFormJsonRef.current = snapshot;
        retryRef.current = null;
        setAutosave({ status: "saved", at: Date.now(), error: null });
        qc.invalidateQueries({ queryKey: ["owner", "salon-full", activeSalonId] });
      } catch (e) {
        retryRef.current = runSave;
        setAutosave({ status: "error", at: Date.now(), error: friendlySetupError(e) });
      }
    };
    const handle = window.setTimeout(runSave, 900);
    return () => window.clearTimeout(handle);
  }, [form, activeSalonId, updateFn, qc]);

  // Debounced autosave for services (only valid rows).
  useEffect(() => {
    if (!activeSalonId || !servicesHydratedRef.current) return;
    const snapshot = JSON.stringify(services);
    if (snapshot === lastServicesJsonRef.current) return;
    const runSave = async () => {
      const valid = services.filter((s) => s.name.trim() && s.price > 0);
      if (valid.length === 0) { lastServicesJsonRef.current = snapshot; return; }
      try {
        setAutosave({ status: "saving", at: null, error: null });
        for (const s of valid) {
          await upsertSvc({
            data: {
              id: s.id, salon_id: activeSalonId, name: s.name.trim(),
              price: Number(s.price), duration_minutes: Number(s.duration_minutes) || 30,
              is_active: true,
            },
          });
        }
        lastServicesJsonRef.current = snapshot;
        retryRef.current = null;
        setAutosave({ status: "saved", at: Date.now(), error: null });
        qc.invalidateQueries({ queryKey: ["owner", "services", activeSalonId] });
      } catch (e) {
        retryRef.current = runSave;
        setAutosave({ status: "error", at: Date.now(), error: friendlySetupError(e) });
      }
    };
    const handle = window.setTimeout(runSave, 1200);
    return () => window.clearTimeout(handle);
  }, [services, activeSalonId, upsertSvc, qc]);

  // ---------------- File upload (Cloudinary) ----------------
  const uploadImage = async (file: File, kind: "logo" | "cover") => {
    if (!activeSalonId) return null;
    if (!isCloudinaryConfigured()) {
      toast.error("Image uploads aren't configured yet. Please contact support.");
      return null;
    }
    try {
      const result = await uploadToCloudinary(file, { folder: `salons/${activeSalonId}/${kind}` });
      // Persist URL immediately so a refresh keeps the image.
      setAutosave({ status: "saving", at: null, error: null });
      const patch = kind === "logo"
        ? { logo_url: result.secure_url }
        : { cover_image_url: result.secure_url };
      await updateFn({ data: { salon_id: activeSalonId, patch } });
      setAutosave({ status: "saved", at: Date.now(), error: null });
      qc.invalidateQueries({ queryKey: ["owner", "salon-full", activeSalonId] });
      return result.secure_url;
    } catch (e) {
      setAutosave({ status: "error", at: Date.now(), error: friendlySetupError(e) });
      toast.error(`Image upload failed: ${friendlySetupError(e)}`);
      return null;
    }
  };



  if (ownerLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hasSalon) {
    return (
      <div className="container mx-auto max-w-2xl py-16 text-center">
        <h1 className="text-2xl font-bold">Complete salon registration first</h1>
        <p className="mt-2 text-muted-foreground">You need a registered salon before launching your website.</p>
        <Button className="mt-6" onClick={() => navigate({ to: "/owner/onboarding" })}>
          Register your salon
        </Button>
      </div>
    );
  }

  const step = STEPS[stepIdx];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 space-y-3">
        <BackButton to="/owner" label="Back to dashboard" variant="ghost" size="sm" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Badge className="border-0 bg-primary/10 text-primary gap-1.5">
              <Rocket className="h-3 w-3" /> 30-minute launch
            </Badge>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-heading">
              Launch your website
            </h1>
            <p className="text-muted-foreground">
              Fill the essentials below — your booking website goes live the moment it's complete.
            </p>
          </div>
          <div className="min-w-[200px] text-right">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Setup progress</div>
            <div className="text-2xl font-bold text-heading">{pct}%</div>
            <Progress value={pct} className="mt-1 h-2 w-48" />
            <AutosaveBadge state={autosave} />
          </div>
        </div>
      </div>


      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* ============ MAIN STEPS ============ */}
        <div className="space-y-6">
          {/* Stepper bar */}
          <div className="flex flex-wrap gap-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const active = i === stepIdx;
              return (
                <button
                  key={s.id}
                  onClick={() => goToStep(i)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:text-heading"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {i + 1}. {s.label}
                </button>
              );
            })}
          </div>

          <Card className="p-6">
            {step.id === "basics" && (
              <div className="space-y-5">
                <SectionHeader icon={Building2} title="Business basics" subtitle="Tell customers who you are." />
                <Grid2>
                  <Field label="Business name *">
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Luxe Hair Spa" />
                  </Field>
                  <Field label="Category *">
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                      <option value="">Choose a category…</option>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label="Owner name *" icon={User}>
                    <Input value={form.owner_name} onChange={(e) => setForm({ ...form, owner_name: e.target.value })} />
                  </Field>
                  <Field label="Mobile *" icon={Phone}>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/[^\d+]/g, "") })} placeholder="9876543210" />
                  </Field>
                  <Field label="WhatsApp *" icon={MessageCircle}>
                    <Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value.replace(/[^\d+]/g, "") })} placeholder="9876543210" />
                  </Field>
                  <Field label="City">
                    <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                  </Field>
                </Grid2>
                <Field label="Full address *">
                  <Textarea rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Shop no, street, area, landmark…" />
                </Field>
                <Field label="PIN code">
                  <Input className="max-w-[160px]" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })} />
                </Field>
                <StepActions
                  onSave={() => saveStep.mutate({
                    name: form.name, category: form.category, owner_name: form.owner_name,
                    phone: form.phone, whatsapp: form.whatsapp, address: form.address,
                    city: form.city, pincode: form.pincode,
                  })}
                  saving={saveStep.isPending}
                  next={() => setStepIdx(stepIdx + 1)}
                  prev={null}
                />
              </div>
            )}

            {step.id === "location" && (
              <div className="space-y-5">
                <SectionHeader icon={MapPin} title="Pin your location" subtitle="Customers tap the pin for directions." />
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Latitude">
                    <Input type="number" step="0.000001" value={form.latitude ?? ""} onChange={(e) => setForm({ ...form, latitude: e.target.value ? Number(e.target.value) : null })} />
                  </Field>
                  <Field label="Longitude">
                    <Input type="number" step="0.000001" value={form.longitude ?? ""} onChange={(e) => setForm({ ...form, longitude: e.target.value ? Number(e.target.value) : null })} />
                  </Field>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        if (!navigator.geolocation) return toast.error("Geolocation not available");
                        navigator.geolocation.getCurrentPosition(
                          (pos) => setForm({ ...form, latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
                          () => toast.error("Could not get location"),
                        );
                      }}
                    >
                      <LocateFixed className="h-4 w-4" /> Use my location
                    </Button>
                  </div>
                </div>
                {form.latitude != null && form.longitude != null && (
                  <a
                    className="inline-flex items-center gap-1 text-sm text-primary underline"
                    href={`https://www.google.com/maps?q=${form.latitude},${form.longitude}`}
                    target="_blank" rel="noreferrer"
                  >
                    Preview pin on Google Maps
                  </a>
                )}
                <StepActions
                  onSave={() => saveStep.mutate({ latitude: form.latitude, longitude: form.longitude })}
                  saving={saveStep.isPending}
                  next={() => setStepIdx(stepIdx + 1)}
                  prev={() => setStepIdx(stepIdx - 1)}
                />
              </div>
            )}

            {step.id === "brand" && (
              <div className="space-y-5">
                <SectionHeader icon={ImageIcon} title="Logo & cover banner" subtitle="Square logo + wide cover work best." />
                <div className="grid gap-6 sm:grid-cols-2">
                  <ImagePicker label="Logo" url={form.logo_url} aspect="aspect-square"
                    onPick={async (f) => { const u = await uploadImage(f, "logo"); if (u) setForm({ ...form, logo_url: u }); }} />
                  <ImagePicker label="Cover banner" url={form.cover_image_url} aspect="aspect-[16/9]"
                    onPick={async (f) => { const u = await uploadImage(f, "cover"); if (u) setForm({ ...form, cover_image_url: u }); }} />
                </div>
                <StepActions
                  onSave={() => saveStep.mutate({ logo_url: form.logo_url, cover_image_url: form.cover_image_url })}
                  saving={saveStep.isPending}
                  next={() => setStepIdx(stepIdx + 1)}
                  prev={() => setStepIdx(stepIdx - 1)}
                />
              </div>
            )}

            {step.id === "hours" && (
              <div className="space-y-5">
                <SectionHeader icon={Clock} title="Working hours" subtitle="Bookings only accept inside these slots." />
                <div className="space-y-2">
                  {DAYS.map((d) => {
                    const h = form.hours[d.key];
                    return (
                      <div key={d.key} className="grid grid-cols-[80px_1fr_1fr_120px] items-center gap-3">
                        <div className="font-medium">{d.label}</div>
                        <Input type="time" value={h.open} disabled={h.closed}
                          onChange={(e) => setForm({ ...form, hours: { ...form.hours, [d.key]: { ...h, open: e.target.value } } })} />
                        <Input type="time" value={h.close} disabled={h.closed}
                          onChange={(e) => setForm({ ...form, hours: { ...form.hours, [d.key]: { ...h, close: e.target.value } } })} />
                        <label className="inline-flex items-center gap-2 text-sm">
                          <Checkbox checked={h.closed}
                            onCheckedChange={(c) => setForm({ ...form, hours: { ...form.hours, [d.key]: { ...h, closed: !!c } } })} />
                          Closed
                        </label>
                      </div>
                    );
                  })}
                </div>
                <StepActions
                  onSave={() => saveStep.mutate({ hours: form.hours })}
                  saving={saveStep.isPending}
                  next={() => setStepIdx(stepIdx + 1)}
                  prev={() => setStepIdx(stepIdx - 1)}
                />
              </div>
            )}

            {step.id === "services" && (
              <div className="space-y-5">
                <SectionHeader icon={Sparkles} title="Your top 5 services" subtitle="What customers book most often." />
                <div className="space-y-3">
                  {services.map((s, i) => (
                    <div key={i} className="grid grid-cols-[1fr_120px_120px] gap-3">
                      <Input placeholder={`Service ${i + 1} name`} value={s.name}
                        onChange={(e) => { const c = [...services]; c[i] = { ...c[i], name: e.target.value }; setServices(c); }} />
                      <Input type="number" min={0} placeholder="Price ₹" value={s.price || ""}
                        onChange={(e) => { const c = [...services]; c[i] = { ...c[i], price: Number(e.target.value) || 0 }; setServices(c); }} />
                      <Input type="number" min={5} placeholder="Mins" value={s.duration_minutes}
                        onChange={(e) => { const c = [...services]; c[i] = { ...c[i], duration_minutes: Number(e.target.value) || 30 }; setServices(c); }} />
                    </div>
                  ))}
                </div>
                <StepActions
                  onSave={() => saveServices.mutate()}
                  saving={saveServices.isPending}
                  next={() => setStepIdx(stepIdx + 1)}
                  prev={() => setStepIdx(stepIdx - 1)}
                />
              </div>
            )}

            {step.id === "payment" && (
              <div className="space-y-5">
                <SectionHeader icon={QrCode} title="Nexora QR — UPI setup" subtitle="Bookings accept advance via your UPI. Settlement runs daily at 10 PM." />
                <Field label="UPI ID *">
                  <Input value={form.upi_id} placeholder="yourname@okhdfc"
                    onChange={(e) => setForm({ ...form, upi_id: e.target.value.trim() })} />
                </Field>
                <p className="text-xs text-muted-foreground">
                  Only Nexora QR (UPI) is supported in V1. Platform commission applies only on successful transactions — no monthly SaaS fee.
                </p>
                <StepActions
                  onSave={() => saveStep.mutate({ upi_id: form.upi_id })}
                  saving={saveStep.isPending}
                  next={() => setStepIdx(stepIdx + 1)}
                  prev={() => setStepIdx(stepIdx - 1)}
                />
              </div>
            )}

            {step.id === "theme" && (
              <div className="space-y-5">
                <SectionHeader icon={Palette} title="Pick a theme" subtitle="Switch anytime — content stays intact." />
                {activeSalon?.selected_template_id ? (
                  <p className="text-sm">
                    <Check className="mr-1 inline h-4 w-4 text-emerald-600" /> Theme selected. You can change it from the gallery.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">No theme picked yet.</p>
                )}
                <Button asChild variant="outline">
                  <Link to="/owner/templates">Open template gallery</Link>
                </Button>
                <StepActions
                  onSave={null}
                  saving={false}
                  next={() => setStepIdx(stepIdx + 1)}
                  prev={() => setStepIdx(stepIdx - 1)}
                />
              </div>
            )}

            {step.id === "review" && (
              <div className="space-y-5">
                <SectionHeader icon={Rocket} title="Review & go live" subtitle="Everything below must be green before we publish." />
                <div className="grid gap-2 sm:grid-cols-2">
                  {checklist.map((c) => (
                    <div key={c.id} className="flex items-center gap-2 rounded-md border bg-card/50 px-3 py-2 text-sm">
                      <span className={`grid h-5 w-5 place-items-center rounded-full ${c.done ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"}`}>
                        {c.done ? <Check className="h-3 w-3" /> : "•"}
                      </span>
                      <span className={c.done ? "" : "text-muted-foreground"}>{c.label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => setStepIdx(stepIdx - 1)}>
                    <ChevronLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button
                    size="lg"
                    disabled={goLive.isPending || pct < 100}
                    onClick={() => goLive.mutate()}
                    className="ml-auto"
                  >
                    {goLive.isPending ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Publishing…</>
                    ) : pct < 100 ? (
                      `Complete ${checklist.length - completed} more to publish`
                    ) : (
                      <><Rocket className="h-4 w-4" /> Go live now</>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* ============ CHECKLIST SIDEBAR ============ */}
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-primary" />
              <div className="text-sm font-semibold text-heading">Launch checklist</div>
              <span className="ml-auto text-xs text-muted-foreground">{completed}/{checklist.length}</span>
            </div>
            <Progress value={pct} className="mb-4 h-2" />
            <ul className="space-y-1.5">
              {checklist.map((c) => (
                <li key={c.id} className="flex items-center gap-2 text-sm">
                  <span className={`grid h-4 w-4 place-items-center rounded-full ${c.done ? "bg-emerald-600 text-white" : "border bg-background text-muted-foreground"}`}>
                    {c.done && <Check className="h-2.5 w-2.5" />}
                  </span>
                  <span className={c.done ? "text-heading" : "text-muted-foreground"}>{c.label}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="bg-primary/5 p-5 text-sm">
            <div className="flex items-center gap-2 font-semibold text-primary">
              <Sparkles className="h-4 w-4" /> 30 minutes to live
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Fill these 12 items and tap <b>Go live</b> — your white-label site, booking engine, and Nexora QR start working immediately.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}

// ============ Helpers ============
function SectionHeader({ icon: Icon, title, subtitle }: { icon: typeof Building2; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-lg font-semibold text-heading">{title}</div>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function Grid2({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function Field({
  label, icon: Icon, children,
}: { label: string; icon?: typeof Building2; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5" />} {label}
      </Label>
      {children}
    </div>
  );
}

function StepActions({
  onSave, saving, next, prev,
}: {
  onSave: (() => void) | null;
  saving: boolean;
  next: (() => void) | null;
  prev: (() => void) | null;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
      {prev ? (
        <Button variant="ghost" onClick={prev}><ChevronLeft className="h-4 w-4" /> Back</Button>
      ) : <span />}
      <div className="flex gap-2">
        {onSave && (
          <Button variant="outline" onClick={onSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Save
          </Button>
        )}
        {next && (
          <Button onClick={() => { onSave?.(); next(); }}>
            Continue <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function ImagePicker({
  label, url, aspect, onPick,
}: { label: string; url: string; aspect: string; onPick: (f: File) => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  return (
    <div>
      <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <label className={`relative grid ${aspect} cursor-pointer place-items-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/40 hover:border-primary`}>
        {url ? (
          <img src={url} alt={label} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="text-center text-sm text-muted-foreground">
            <Upload className="mx-auto h-5 w-5" />
            <div className="mt-1">Click to upload</div>
          </div>
        )}
        {busy && (
          <div className="absolute inset-0 grid place-items-center bg-black/40 text-white">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setBusy(true);
            try { await onPick(f); } finally { setBusy(false); }
          }}
        />
      </label>
    </div>
  );
}

function AutosaveBadge({ state }: { state: { status: "idle" | "saving" | "saved" | "error"; at: number | null } }) {
  const time = state.at ? new Date(state.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : null;
  let label = "Autosave on";
  let tone = "text-muted-foreground";
  let Icon: typeof Cloud = Cloud;
  if (state.status === "saving") { label = "Saving…"; tone = "text-primary"; Icon = Loader2; }
  else if (state.status === "saved") { label = time ? `Saved ${time}` : "Saved"; tone = "text-emerald-600"; Icon = Check; }
  else if (state.status === "error") { label = "Save failed — retrying on next change"; tone = "text-destructive"; Icon = Cloud; }
  return (
    <div className={`mt-1 inline-flex items-center justify-end gap-1.5 text-[11px] ${tone}`}>
      <Icon className={`h-3 w-3 ${state.status === "saving" ? "animate-spin" : ""}`} />
      <span>{label}</span>
    </div>
  );
}

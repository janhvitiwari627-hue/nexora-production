import { useEffect, useMemo, useRef, useState } from "react";
import { Link, getRouteApi } from "@tanstack/react-router";
import { HexColorPicker } from "react-colorful";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ExternalLink,
  Loader2,
  Upload,
  X,
  Save,
  Trash2,
  Plus,
  Paintbrush,
  Pencil,
  Scissors,
  Users,
  Image as ImageIcon,
  Star,
  Info,
  Tag,
  Package,
  BadgePercent,
  ChevronRight,
  Monitor,
  Smartphone,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useOwnerContext } from "@/hooks/use-owner-context";
import { ownerSalonFullQuery, ownerServicesQuery, ownerStaffQuery } from "@/lib/owner.queries";
import {
  updateOwnerSalon,
  upsertOwnerService,
  deleteOwnerService,
  upsertOwnerStaff,
  deleteOwnerStaff,
} from "@/lib/owner.functions";
import { supabase } from "@/integrations/supabase/client";
import {
  getTemplate,
  TEMPLATE_KEYS,
  TEMPLATES,
  type TemplateKey,
} from "@/components/whiteLabelWebsite/templates";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
type DayKey = (typeof DAYS)[number];
const DAY_LABELS: Record<DayKey, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};
type HoursMap = Record<string, { open: string; close: string; closed: boolean }>;
const DEFAULT_HOURS: HoursMap = Object.fromEntries(
  DAYS.map((d) => [d, { open: "10:00", close: "20:00", closed: d === "sun" }]),
);

type Patch = {
  name?: string;
  tagline?: string | null;
  description?: string | null;
  about_us?: string | null;
  cover_image_url?: string | null;
  owner_profile_image_url?: string | null;
  video_url?: string | null;
  brand_primary?: string | null;
  brand_secondary?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  is_home_service?: boolean;
  home_service_charge?: number;
  home_service_radius_km?: number;
  hours?: HoursMap | null;
  gallery_images?: string[];
  selected_template_key?: TemplateKey;
};

type ServiceDraft = {
  id?: string;
  name: string;
  price: number;
  duration_minutes: number;
  description: string;
  image_url: string;
  category: string;
};

type StaffDraft = {
  id?: string;
  name: string;
  role: string;
  bio: string;
  avatar_url: string;
  rating: number;
};

export function OwnerWebsitePage() {
  const { activeSalon, activeSalonId, hasSalon, isLoading: ctxLoading } = useOwnerContext();
  const qc = useQueryClient();
  const { data: salon, isLoading } = useQuery(ownerSalonFullQuery(activeSalonId ?? ""));
  const { data: servicesData } = useQuery(ownerServicesQuery(activeSalonId ?? ""));
  const { data: staffData } = useQuery(ownerStaffQuery(activeSalonId ?? ""));
  const update = useServerFn(updateOwnerSalon);
  const upsertSvc = useServerFn(upsertOwnerService);
  const deleteSvc = useServerFn(deleteOwnerService);
  const upsertStaffFn = useServerFn(upsertOwnerStaff);
  const deleteStaffFn = useServerFn(deleteOwnerStaff);
  const [autosaveState, setAutosaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const mutate = useMutation({
    mutationFn: (patch: Patch) => update({ data: { salon_id: activeSalonId!, patch } }),
    onSuccess: () => {
      toast.success("Website updated");
      if (activeSalonId) {
        qc.invalidateQueries({ queryKey: ["owner", "salon-full", activeSalonId] });
        qc.invalidateQueries({ queryKey: ["owner", "salons"] });
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const [form, setForm] = useState<Patch | null>(null);
  const [services, setServices] = useState<ServiceDraft[] | null>(null);
  const [savingServices, setSavingServices] = useState(false);
  const [preview, setPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const routeSearch = getRouteApi("/owner/website").useSearch();
  const autoOpenedRef = useRef(false);
  useEffect(() => {
    if (routeSearch?.live === 1 && !autoOpenedRef.current && salon) {
      autoOpenedRef.current = true;
      setPreview(true);
    }
  }, [routeSearch, salon]);


  useEffect(() => {
    if (salon && !form) {
      const templateDefaults = getTemplate(salon.selected_template_key);
      setForm({
        name: salon.name ?? "",
        tagline: salon.tagline ?? "",
        description: salon.description ?? "",
        about_us: salon.about_us ?? "",
        cover_image_url: salon.cover_image_url ?? "",
        owner_profile_image_url: salon.owner_profile_image_url ?? "",
        video_url: salon.video_url ?? "",
        brand_primary: salon.brand_primary ?? templateDefaults.colors.primary,
        brand_secondary: salon.brand_secondary ?? templateDefaults.colors.secondary,
        phone: salon.phone ?? "",
        email: salon.email ?? "",
        address: salon.address ?? "",
        is_home_service: salon.is_home_service ?? false,
        home_service_charge: salon.home_service_charge ?? 0,
        home_service_radius_km: salon.home_service_radius_km ?? 5,
        hours: (salon.hours as HoursMap) ?? DEFAULT_HOURS,
        gallery_images: (salon.gallery_images as string[] | null) ?? [],
        selected_template_key: templateDefaults.key,
      });
    }
  }, [salon, form]);

  useEffect(() => {
    if (servicesData && services === null) {
      setServices(
        servicesData.map((s) => ({
          id: s.id,
          name: s.name,
          price: Number(s.price ?? 0),
          duration_minutes: s.duration_minutes ?? 30,
          description: s.description ?? "",
          image_url: s.image_url ?? "",
          category: s.category ?? "",
        })),
      );
    }
  }, [servicesData, services]);

  const set = <K extends keyof Patch>(key: K, value: Patch[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  const chooseTemplate = (key: TemplateKey) => {
    const template = TEMPLATES[key];
    setForm((f) =>
      f
        ? {
            ...f,
            selected_template_key: key,
            brand_primary: template.colors.primary,
            brand_secondary: template.colors.secondary,
          }
        : f,
    );
  };

  const publicUrl = useMemo(() => (salon?.slug ? `/site/${salon.slug}` : ""), [salon?.slug]);
  const selectedTemplate = getTemplate(form?.selected_template_key ?? salon?.selected_template_key);
  const previewUrl = salon?.slug
    ? `/site/${salon.slug}?preview=1&live=1&t=${encodeURIComponent(selectedTemplate.key)}`
    : `/template-preview/${encodeURIComponent(selectedTemplate.key)}?live=1`;

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [iframeReady, setIframeReady] = useState(false);

  // Post current form patch to the live preview iframe whenever it changes.
  useEffect(() => {
    if (!preview || !iframeReady || !form) return;
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    const patch: Record<string, unknown> = { ...form };
    if (services) {
      patch.services = services.map((s) => ({
        id: s.id,
        name: s.name,
        price: s.price,
        duration: s.duration_minutes,
        desc: s.description,
        image: s.image_url || undefined,
        category: s.category || undefined,
      }));
    }
    win.postMessage({ type: "live-preview-overrides", patch }, "*");
  }, [preview, iframeReady, form, services]);

  // Listen for the iframe's ready handshake.
  useEffect(() => {
    if (!preview) return;
    setIframeReady(false);
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === "live-preview-ready") setIframeReady(true);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [preview]);

  // Autosave draft for template/colors/logo/banner fields (debounced).
  const AUTOSAVE_KEYS = [
    "selected_template_key",
    "brand_primary",
    "brand_secondary",
    "cover_image_url",
    "owner_profile_image_url",
  ] as const;
  const lastAutosavedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!form || !activeSalonId) return;
    const draft: Patch = {};
    for (const k of AUTOSAVE_KEYS) {
      // @ts-expect-error index
      draft[k] = form[k];
    }
    const key = JSON.stringify(draft);
    if (lastAutosavedRef.current === null) {
      lastAutosavedRef.current = key;
      return;
    }
    if (lastAutosavedRef.current === key) return;
    const handle = setTimeout(async () => {
      try {
        setAutosaveState("saving");
        await update({ data: { salon_id: activeSalonId, patch: draft } });
        lastAutosavedRef.current = key;
        setAutosaveState("saved");
        qc.invalidateQueries({ queryKey: ["owner", "salon-full", activeSalonId] });
      } catch (e) {
        setAutosaveState("error");
        toast.error(e instanceof Error ? e.message : "Draft autosave failed");
      }
    }, 800);
    return () => clearTimeout(handle);
  }, [
    form?.selected_template_key,
    form?.brand_primary,
    form?.brand_secondary,
    form?.cover_image_url,
    form?.owner_profile_image_url,
    activeSalonId,
    update,
    qc,
  ]);

  const handleSave = () => {
    if (!form) return;
    mutate.mutate(form);
  };

  // ---------- Services editor helpers ----------
  const addService = () => {
    setServices((prev) => [
      ...(prev ?? []),
      { name: "New Service", price: 500, duration_minutes: 30, description: "", image_url: "", category: "" },
    ]);
  };
  const updateService = (idx: number, patch: Partial<ServiceDraft>) => {
    setServices((prev) => prev?.map((s, i) => (i === idx ? { ...s, ...patch } : s)) ?? null);
  };
  const removeService = (idx: number) => {
    setServices((prev) => prev?.filter((_, i) => i !== idx) ?? null);
  };
  const [uploadingServiceIdx, setUploadingServiceIdx] = useState<number | null>(null);
  const handleServiceImageUpload = async (idx: number, file: File) => {
    setUploadingServiceIdx(idx);
    const url = await uploadFile(file, "services");
    setUploadingServiceIdx(null);
    if (url) updateService(idx, { image_url: url });
  };
  const saveServices = async () => {
    if (!activeSalonId || !services) return;
    setSavingServices(true);
    try {
      const originals = servicesData ?? [];
      const draftIds = new Set(services.filter((s) => s.id).map((s) => s.id!));
      // Delete removed rows
      for (const orig of originals) {
        if (!draftIds.has(orig.id)) {
          await deleteSvc({ data: { id: orig.id } });
        }
      }
      // Upsert current rows
      for (const s of services) {
        if (!s.name.trim()) continue;
        await upsertSvc({
          data: {
            id: s.id,
            salon_id: activeSalonId,
            name: s.name.trim(),
            description: s.description || null,
            category: s.category || null,
            duration_minutes: s.duration_minutes || 30,
            price: Number(s.price) || 0,
            is_active: true,
            image_url: s.image_url ? s.image_url : null,
          },
        });
      }
      toast.success("Services saved");
      await qc.invalidateQueries({ queryKey: ["owner", "services", activeSalonId] });
      setServices(null); // re-init from fresh data
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save services");
    } finally {
      setSavingServices(false);
    }
  };




  const uploadFile = async (file: File, folder: "cover" | "owner" | "gallery" | "video" | "services") => {
    if (!activeSalonId) return null;
    const isVideo = folder === "video";
    const maxBytes = isVideo ? 10 * 1024 * 1024 : 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error(isVideo ? "Video must be 10MB or smaller" : "Each photo must be 2MB or smaller");
      return null;
    }
    if (isVideo ? !file.type.startsWith("video/") : !file.type.startsWith("image/")) {
      toast.error(isVideo ? "Please choose a video file" : "Please choose an image file");
      return null;
    }
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${activeSalonId}/${folder}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("salon-media").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) {
      toast.error(error.message);
      return null;
    }
    const { data } = supabase.storage.from("salon-media").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleImageUpload = async (
    file: File,
    field: "cover_image_url" | "owner_profile_image_url",
  ) => {
    setUploading(true);
    const url = await uploadFile(file, field === "cover_image_url" ? "cover" : "owner");
    setUploading(false);
    if (url) set(field, url);
  };

  const handleGalleryUpload = async (files: FileList) => {
    const current = form?.gallery_images ?? [];
    const remaining = Math.max(0, 5 - current.length);
    if (!remaining) {
      toast.error("You can upload up to 5 gallery photos");
      return;
    }
    setUploading(true);
    const urls: string[] = [];
    for (const f of Array.from(files).slice(0, remaining)) {
      const url = await uploadFile(f, "gallery");
      if (url) urls.push(url);
    }
    setUploading(false);
    if (files.length > remaining)
      toast.info(`Only ${remaining} more photo${remaining === 1 ? "" : "s"} can be added`);
    if (urls.length) set("gallery_images", [...current, ...urls]);
  };

  const handleVideoUpload = async (file: File) => {
    setUploading(true);
    const url = await uploadFile(file, "video");
    setUploading(false);
    if (url) set("video_url", url);
  };

  const removeGalleryImage = (url: string) => {
    set(
      "gallery_images",
      (form?.gallery_images ?? []).filter((u) => u !== url),
    );
  };

  if (ctxLoading || isLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!hasSalon || !form) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <Card>
          <CardContent className="space-y-3 p-8 text-center">
            <h1 className="text-xl font-bold">No salon linked yet</h1>
            <p className="text-muted-foreground text-sm">
              Register your salon to receive your ready-made booking website.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 overflow-x-hidden px-3 py-5 sm:px-4 sm:py-6">
      <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">Website Management</h1>
          <p className="text-muted-foreground text-sm">
            Update your ready-made salon website using these simple fields.
          </p>
        </div>
        <div className="grid w-full grid-cols-1 items-center gap-2 sm:w-auto sm:grid-cols-[auto_auto_auto]">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5 justify-center sm:justify-end">
            {autosaveState === "saving" && (
              <>
                <Loader2 className="h-3 w-3 animate-spin" /> Draft saving…
              </>
            )}
            {autosaveState === "saved" && <span className="text-emerald-600">Draft saved</span>}
            {autosaveState === "error" && <span className="text-destructive">Autosave failed</span>}
            {autosaveState === "idle" && <span className="opacity-60">Auto-draft on</span>}
          </div>
          <Button
            variant="outline"
            onClick={() => setPreview(true)}
            disabled={!previewUrl}
            className="min-w-0 border-primary/40 bg-gradient-to-r from-primary/10 to-primary/5 px-2 text-xs font-semibold text-primary hover:from-primary/20 hover:to-primary/10 sm:px-4 sm:text-sm"
          >
            <Zap className="h-4 w-4" /> Edit & Live
          </Button>
          <Button
            onClick={handleSave}
            disabled={mutate.isPending}
            className="min-w-0 bg-gradient-cta px-2 text-xs text-primary-foreground hover:opacity-90 sm:px-4 sm:text-sm"
          >
            {mutate.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>

      </div>

      {/* Status card */}
      <Card className="max-w-full overflow-hidden">
        <CardContent className="grid min-w-0 gap-4 p-4 sm:p-5">
          <div className="min-w-0 space-y-2">
            <Badge
              variant="secondary"
              className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
            >
              {salon?.is_active ? "Live" : "Waiting for approval"}
            </Badge>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
              <code className="bg-muted block min-w-0 truncate rounded px-2 py-1 text-sm">
                {publicUrl}
              </code>
              {publicUrl && (
                <Button variant="ghost" size="sm" className="shrink-0 px-2" asChild>
                  <a href={publicUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" /> Open
                  </a>
                </Button>
              )}
            </div>
            <div className="text-muted-foreground text-xs">Salon: {activeSalon?.name}</div>
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-full overflow-hidden">
        <CardContent className="grid min-w-0 gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-5">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-primary-foreground"
              style={{ backgroundColor: selectedTemplate.colors.primary }}
            >
              <Paintbrush className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="truncate font-semibold">Shop Template: {selectedTemplate.name}</div>
              <p className="text-muted-foreground text-xs">
                Change the design anytime. Your services, photos, bookings and content remain safe.
              </p>
            </div>
          </div>
          <div className="grid gap-2 sm:min-w-72">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {TEMPLATE_KEYS.map((key) => {
                const template = TEMPLATES[key];
                const active = selectedTemplate.key === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => chooseTemplate(key)}
                    className={`rounded-lg border p-2 text-left text-xs transition ${
                      active ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted/60"
                    }`}
                  >
                    <span
                      className="mb-1 block h-3 rounded-full"
                      style={{ backgroundColor: template.colors.primary }}
                    />
                    <span className="block truncate font-semibold">{template.name}</span>
                  </button>
                );
              })}
            </div>
            <Button variant="outline" className="w-full min-w-0" asChild>
              <Link to="/owner/templates">
                <Paintbrush className="h-4 w-4" /> Full Template Gallery
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-full overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base">Edit Website Sections</CardTitle>
          <p className="text-muted-foreground text-xs">
            Har section ko yahan se edit karein. Changes turant aapki template website par dikhenge.
          </p>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <SectionEditLink
            icon={<Info className="h-4 w-4" />}
            title="About / Our Salon"
            desc="Salon story, tagline, description"
            to="/owner/settings"
          />
          <SectionEditLink
            icon={<Scissors className="h-4 w-4" />}
            title="Services"
            desc="Add, edit ya remove services"
            to="/owner/services"
          />
          <SectionEditLink
            icon={<Tag className="h-4 w-4" />}
            title="Rate Card"
            desc="Service prices manage karein"
            to="/owner/services"
          />
          <SectionEditLink
            icon={<Package className="h-4 w-4" />}
            title="Packages"
            desc="Combo & bundle offers"
            to="/owner/services"
          />
          <SectionEditLink
            icon={<Users className="h-4 w-4" />}
            title="Staff / Meet the Team"
            desc="Team members add & edit"
            to="/owner/staff"
          />
          <SectionEditLink
            icon={<BadgePercent className="h-4 w-4" />}
            title="Membership & Offers"
            desc="Promotions aur memberships"
            to="/owner/marketing"
          />
          <SectionEditLink
            icon={<ImageIcon className="h-4 w-4" />}
            title="Gallery"
            desc="Salon photos manage karein"
            to="/owner/gallery"
          />
          <SectionEditLink
            icon={<Star className="h-4 w-4" />}
            title="Reviews"
            desc="Customer reviews dekhein"
            to="/owner/reviews"
          />
          <SectionEditLink
            icon={<Pencil className="h-4 w-4" />}
            title="Contact & Hours"
            desc="Phone, WhatsApp, address, city"
            to="/owner/settings"
          />
        </CardContent>
      </Card>

      {/* Services (Our Services / Rate Card) inline editor */}
      <Card className="max-w-full overflow-hidden">
        <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
          <div className="min-w-0">
            <CardTitle className="text-base flex items-center gap-2">
              <Scissors className="h-4 w-4" /> Our Services / Rate Card
            </CardTitle>
            <p className="text-muted-foreground text-xs mt-1">
              Add ya edit karein — image URL paste karke turant live preview me dikhega. Save karke customers ko live karo.
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={addService}>
              <Plus className="h-4 w-4" /> Add Service
            </Button>
            <Button size="sm" onClick={saveServices} disabled={savingServices || !services}>
              {savingServices ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Services
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {(!services || services.length === 0) && (
            <div className="text-muted-foreground rounded-lg border border-dashed py-6 text-center text-sm">
              Koi service nahi. "Add Service" click karke shuru karein.
            </div>
          )}
          {services?.map((s, idx) => (
            <div key={s.id ?? `new-${idx}`} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[80px_minmax(0,1fr)_auto]">
              <div className="flex flex-col items-center gap-1.5">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border bg-muted grid place-items-center relative">
                  {s.image_url ? (
                    <img src={s.image_url} alt={s.name} className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  )}
                  {uploadingServiceIdx === idx && (
                    <div className="absolute inset-0 grid place-items-center bg-black/50">
                      <Loader2 className="h-5 w-5 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <label className="cursor-pointer text-[11px] font-medium text-primary hover:underline">
                  {s.image_url ? "Change" : "Upload"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void handleServiceImageUpload(idx, f);
                      e.target.value = "";
                    }}
                  />
                </label>
                {s.image_url && (
                  <button
                    type="button"
                    className="text-[11px] text-destructive hover:underline"
                    onClick={() => updateService(idx, { image_url: "" })}
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="min-w-0 grid gap-2 sm:grid-cols-2">
                <Input
                  placeholder="Service name (e.g. Haircut)"
                  value={s.name}
                  onChange={(e) => updateService(idx, { name: e.target.value })}
                />
                <Input
                  placeholder="Category (Hair / Skin / Nails)"
                  value={s.category}
                  onChange={(e) => updateService(idx, { category: e.target.value })}
                />
                <Input
                  type="number"
                  min={0}
                  placeholder="Price (₹)"
                  value={s.price}
                  onChange={(e) => updateService(idx, { price: Number(e.target.value) })}
                />
                <Input
                  type="number"
                  min={5}
                  placeholder="Duration (minutes)"
                  value={s.duration_minutes}
                  onChange={(e) => updateService(idx, { duration_minutes: Number(e.target.value) })}
                />
                <Input
                  className="sm:col-span-2"
                  placeholder="Ya image URL paste karein (optional)"
                  value={s.image_url}
                  onChange={(e) => updateService(idx, { image_url: e.target.value })}
                />
                <Textarea
                  className="sm:col-span-2"
                  rows={2}
                  placeholder="Short description"
                  value={s.description}
                  onChange={(e) => updateService(idx, { description: e.target.value })}
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive self-start"
                onClick={() => removeService(idx)}
              >
                <Trash2 className="h-4 w-4" /> Remove
              </Button>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            Tip: Thumbnail par "Upload" click karke apne phone/computer se image chunein (max 2MB). Ya optional URL field me public image link paste karein.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Brand customizer */}
        <Card className="max-w-full overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Brand</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <label className="text-sm font-medium">Business Name</label>
              <Input
                value={form.name ?? ""}
                onChange={(e) => set("name", e.target.value)}
                maxLength={120}
                className="mt-1.5"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tagline</label>
              <Input
                value={form.tagline ?? ""}
                onChange={(e) => set("tagline", e.target.value)}
                placeholder="Premium hair & beauty in Mumbai"
                maxLength={200}
                className="mt-1.5"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Cover Image</label>
              <label className="hover:bg-muted/50 mt-2 flex h-32 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors">
                {form.cover_image_url ? (
                  <img
                    src={form.cover_image_url}
                    alt="Salon cover"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-muted-foreground text-center">
                    {uploading ? (
                      <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                    ) : (
                      <Upload className="mx-auto mb-1 h-5 w-5" />
                    )}
                    <div className="text-xs">Upload image (maximum 2MB)</div>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleImageUpload(f, "cover_image_url");
                  }}
                />
              </label>
              {form.cover_image_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-danger mt-2"
                  onClick={() => set("cover_image_url", null)}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </Button>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Short Description</label>
              <Textarea
                value={form.description ?? ""}
                onChange={(e) => set("description", e.target.value)}
                rows={4}
                maxLength={2000}
                placeholder="Tell customers what makes your salon special."
                className="mt-1.5"
              />
            </div>
            <div>
              <label className="text-sm font-medium">About Us</label>
              <Textarea
                value={form.about_us ?? ""}
                onChange={(e) => set("about_us", e.target.value)}
                rows={5}
                maxLength={4000}
                placeholder="Share your salon story, experience and specialities."
                className="mt-1.5"
              />
            </div>
          </CardContent>
        </Card>

        {/* Simple identity */}
        <Card className="max-w-full overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Owner & Colours</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <label className="text-sm font-medium">Owner Profile Photo</label>
              <label className="hover:bg-muted/50 mt-2 flex h-36 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors">
                {form.owner_profile_image_url ? (
                  <img
                    src={form.owner_profile_image_url}
                    alt="Salon owner"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-muted-foreground text-center">
                    <Upload className="mx-auto mb-1 h-5 w-5" />
                    <div className="text-xs">Upload one photo (maximum 2MB)</div>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, "owner_profile_image_url");
                  }}
                />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <ColorField
                label="Primary Color"
                value={form.brand_primary ?? "#6366f1"}
                onChange={(v) => set("brand_primary", v)}
              />
              <ColorField
                label="Accent Color"
                value={form.brand_secondary ?? "#ec4899"}
                onChange={(v) => set("brand_secondary", v)}
              />
            </div>
            <p className="text-muted-foreground text-xs">
              The clean page layout stays consistent so it remains easy for customers to use.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contact + Hours */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="max-w-full overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Phone</label>
              <Input
                value={form.phone ?? ""}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+91 98765 43210"
                className="mt-1.5"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={form.email ?? ""}
                onChange={(e) => set("email", e.target.value)}
                placeholder="hello@yoursalon.com"
                className="mt-1.5"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Address</label>
              <Textarea
                value={form.address ?? ""}
                onChange={(e) => set("address", e.target.value)}
                rows={3}
                placeholder="Shop 12, Linking Road, Bandra West, Mumbai"
                className="mt-1.5"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="max-w-full overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Business Hours</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {DAYS.map((d) => {
              const h = form.hours?.[d] ?? DEFAULT_HOURS[d];
              return (
                <div
                  key={d}
                  className="grid grid-cols-[42px_minmax(0,1fr)_minmax(0,1fr)] items-center gap-2 sm:grid-cols-[52px_minmax(0,1fr)_minmax(0,1fr)_74px]"
                >
                  <span className="text-sm font-medium">{DAY_LABELS[d]}</span>
                  <Input
                    type="time"
                    value={h.open}
                    disabled={h.closed}
                    className="min-w-0 px-2 text-xs sm:text-sm"
                    onChange={(e) =>
                      set("hours", {
                        ...(form.hours ?? DEFAULT_HOURS),
                        [d]: { ...h, open: e.target.value },
                      })
                    }
                  />
                  <Input
                    type="time"
                    value={h.close}
                    disabled={h.closed}
                    className="min-w-0 px-2 text-xs sm:text-sm"
                    onChange={(e) =>
                      set("hours", {
                        ...(form.hours ?? DEFAULT_HOURS),
                        [d]: { ...h, close: e.target.value },
                      })
                    }
                  />
                  <label className="text-muted-foreground col-span-2 col-start-2 inline-flex items-center justify-end gap-1.5 text-xs sm:col-auto sm:justify-start">
                    <Switch
                      checked={!h.closed}
                      onCheckedChange={(v) =>
                        set("hours", {
                          ...(form.hours ?? DEFAULT_HOURS),
                          [d]: { ...h, closed: !v },
                        })
                      }
                    />
                    <span>{h.closed ? "Closed" : "Open"}</span>
                  </label>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Card className="max-w-full overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base">Home Service</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-lg border p-4">
            <div className="min-w-0">
              <div className="font-medium">Offer service at customer home</div>
              <div className="text-muted-foreground text-xs">
                Customers see the extra charge before booking.
              </div>
            </div>
            <Switch
              checked={form.is_home_service ?? false}
              onCheckedChange={(v) => set("is_home_service", v)}
            />
          </label>
          {form.is_home_service && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Extra Charge (₹)</label>
                <Input
                  type="number"
                  min={0}
                  value={form.home_service_charge ?? 0}
                  onChange={(e) => set("home_service_charge", Number(e.target.value))}
                  className="mt-1.5"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Service Radius (km)</label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={form.home_service_radius_km ?? 5}
                  onChange={(e) => set("home_service_radius_km", Number(e.target.value))}
                  className="mt-1.5"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gallery */}
      <Card className="max-w-full overflow-hidden">
        <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0">
            <CardTitle className="text-base">Gallery</CardTitle>
            <p className="text-muted-foreground mt-1 text-xs">Up to 5 photos, maximum 2MB each.</p>
          </div>
          <label
            className={`bg-primary text-primary-foreground inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold hover:opacity-90 ${(form.gallery_images ?? []).length >= 5 ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
          >
            {uploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
            Add Photos
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleGalleryUpload(e.target.files)}
            />
          </label>
        </CardHeader>
        <CardContent>
          {(form.gallery_images ?? []).length === 0 ? (
            <div className="text-muted-foreground rounded-xl border border-dashed py-10 text-center text-sm">
              No photos yet. Upload some to showcase your work.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {(form.gallery_images ?? []).map((url) => (
                <div
                  key={url}
                  className="group relative aspect-square overflow-hidden rounded-lg border"
                >
                  <img src={url} alt="gallery" className="h-full w-full object-cover" />
                  <button
                    onClick={() => removeGalleryImage(url)}
                    className="absolute top-1.5 right-1.5 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100"
                    aria-label="Remove photo"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="max-w-full overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base">Salon Video</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {form.video_url ? (
            <video
              controls
              src={form.video_url}
              className="max-h-80 w-full rounded-lg border bg-black"
            />
          ) : (
            <div className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
              No video uploaded.
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <label className="bg-primary text-primary-foreground inline-flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm">
              <Upload className="h-4 w-4" /> Upload video (maximum 10MB)
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleVideoUpload(file);
                }}
              />
            </label>
            {form.video_url && (
              <Button variant="outline" onClick={() => set("video_url", null)}>
                <Trash2 className="h-4 w-4" /> Remove
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Theme preview hint + save bar */}
      <div className="sticky bottom-0 -mx-3 grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 border-t bg-background/95 px-3 py-3 backdrop-blur sm:-mx-4 sm:gap-3 sm:px-4">
        <div className="text-muted-foreground min-w-0 text-xs">
          Unsaved changes preview live rahenge — customers ko save ke baad hi dikhenge.
        </div>
        <Button
          variant="outline"
          onClick={() => setPreview(true)}
          disabled={!previewUrl}
          className="border-primary/40 text-primary"
        >
          <Zap className="h-4 w-4" /> Edit & Live
        </Button>
        <Button onClick={handleSave} disabled={mutate.isPending}>
          {mutate.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save
        </Button>
      </div>

      {/* Live preview modal */}
      <Dialog open={preview} onOpenChange={setPreview}>
        <DialogContent className="flex h-[90vh] w-[calc(100vw-1rem)] max-w-6xl flex-col p-0 sm:w-full">
          <DialogHeader className="border-b px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <DialogTitle className="flex items-center gap-2 text-base">
                <Zap className="h-4 w-4 text-primary" />
                Edit & Live · {form.name}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex overflow-hidden rounded-full border bg-muted p-0.5">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("desktop")}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                      previewDevice === "desktop"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    aria-pressed={previewDevice === "desktop"}
                    aria-label="Desktop preview"
                  >
                    <Monitor className="h-3.5 w-3.5" /> Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("mobile")}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                      previewDevice === "mobile"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    aria-pressed={previewDevice === "mobile"}
                    aria-label="Mobile preview"
                  >
                    <Smartphone className="h-3.5 w-3.5" /> Mobile
                  </button>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    iframeReady
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <span
                    className={`inline-block h-1.5 w-1.5 rounded-full ${
                      iframeReady ? "animate-pulse bg-emerald-500" : "bg-muted-foreground"
                    }`}
                  />
                  {iframeReady ? "Live" : "Loading…"}
                </span>
                {publicUrl && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={publicUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-3.5 w-3.5" /> Open
                    </a>
                  </Button>
                )}
              </div>
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              Aap jo bhi color, banner, logo ya text change karenge, wo yahan turant dikhega. Save Changes ke baad customers ko bhi dikhega.
            </p>
          </DialogHeader>
          <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden bg-muted/40 lg:grid-cols-[340px_minmax(0,1fr)]">
            <aside className="max-h-[34vh] overflow-y-auto border-b bg-background p-4 lg:max-h-none lg:border-r lg:border-b-0">
              <div className="space-y-4">
                <div>
                  <div className="mb-2 text-sm font-semibold">Template</div>
                  <div className="grid gap-2">
                    {TEMPLATE_KEYS.map((key) => {
                      const template = TEMPLATES[key];
                      const active = selectedTemplate.key === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => chooseTemplate(key)}
                          className={`flex items-center gap-3 rounded-lg border p-2 text-left transition ${
                            active ? "border-primary bg-primary/10" : "hover:bg-muted/60"
                          }`}
                        >
                          <span
                            className="h-8 w-8 shrink-0 rounded-full border"
                            style={{ backgroundColor: template.colors.primary, borderColor: template.colors.secondary }}
                          />
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold">{template.name}</span>
                            <span className="text-muted-foreground block truncate text-[11px]">{template.themeType}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid gap-3">
                  <label className="text-sm font-medium">
                    Shop Name
                    <Input
                      value={form.name ?? ""}
                      onChange={(e) => set("name", e.target.value)}
                      className="mt-1"
                    />
                  </label>
                  <label className="text-sm font-medium">
                    Tagline
                    <Input
                      value={form.tagline ?? ""}
                      onChange={(e) => set("tagline", e.target.value)}
                      className="mt-1"
                    />
                  </label>
                  <label className="text-sm font-medium">
                    About Text
                    <Textarea
                      value={form.about_us ?? ""}
                      onChange={(e) => set("about_us", e.target.value)}
                      rows={3}
                      className="mt-1"
                    />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <ColorField
                    label="Primary"
                    value={form.brand_primary ?? selectedTemplate.colors.primary}
                    onChange={(v) => set("brand_primary", v)}
                  />
                  <ColorField
                    label="Accent"
                    value={form.brand_secondary ?? selectedTemplate.colors.secondary}
                    onChange={(v) => set("brand_secondary", v)}
                  />
                </div>
                <div className="grid gap-3">
                  <label className="text-sm font-medium">
                    Banner Image
                    <span className="hover:bg-muted/50 mt-1 flex h-24 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed">
                      {form.cover_image_url ? (
                        <img src={form.cover_image_url} alt="Website banner" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-muted-foreground text-xs">Upload banner</span>
                      )}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleImageUpload(f, "cover_image_url");
                      }}
                    />
                  </label>
                  <label className="text-sm font-medium">
                    Logo / Owner Photo
                    <span className="hover:bg-muted/50 mt-1 flex h-24 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed">
                      {form.owner_profile_image_url ? (
                        <img src={form.owner_profile_image_url} alt="Website logo" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-muted-foreground text-xs">Upload logo</span>
                      )}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleImageUpload(f, "owner_profile_image_url");
                      }}
                    />
                  </label>
                </div>
                <Button onClick={handleSave} disabled={mutate.isPending} className="w-full">
                  {mutate.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Website
                </Button>
              </div>
            </aside>
            <div
              className={`min-h-0 overflow-auto ${
                previewDevice === "mobile" ? "grid place-items-start justify-center py-4" : ""
              }`}
            >
              <div
                className={
                  previewDevice === "mobile"
                    ? "h-[760px] w-[390px] max-w-full overflow-hidden rounded-[2rem] border-[10px] border-slate-900 bg-background shadow-2xl"
                    : "h-full min-h-[680px] w-full"
                }
              >
                <iframe
                  ref={iframeRef}
                  src={previewUrl}
                  title="Live website preview"
                  className="h-full w-full"
                  onLoad={() => {
                    if (form) {
                      iframeRef.current?.contentWindow?.postMessage(
                        { type: "live-preview-overrides", patch: form },
                        "*",
                      );
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <button className="hover:bg-muted mt-2 flex w-full min-w-0 items-center gap-2 rounded-md border px-2 py-1.5">
            <div className="h-6 w-6 rounded border" style={{ backgroundColor: value }} />
            <span className="truncate font-mono text-sm">{value}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3">
          <HexColorPicker color={value} onChange={onChange} />
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="mt-3 font-mono text-sm"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function SectionEditLink({
  icon,
  title,
  desc,
  to,
  hint,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  to?: string;
  hint?: string;
}) {
  const inner = (
    <>
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold">{title}</div>
        <div className="text-muted-foreground truncate text-xs">{hint ?? desc}</div>
      </div>
      {to ? (
        <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" />
      ) : (
        <span className="text-muted-foreground shrink-0 rounded-full border px-2 py-0.5 text-[10px] uppercase">
          Below
        </span>
      )}
    </>
  );
  const className =
    "hover:bg-muted/60 flex items-center gap-3 rounded-lg border p-3 text-left transition";
  if (to) {
    return (
      <Link to={to} className={className}>
        {inner}
      </Link>
    );
  }
  return <div className={className}>{inner}</div>;
}


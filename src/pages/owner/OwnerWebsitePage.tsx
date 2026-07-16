import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
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
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useOwnerContext } from "@/hooks/use-owner-context";
import { ownerSalonFullQuery } from "@/lib/owner.queries";
import { updateOwnerSalon } from "@/lib/owner.functions";
import { supabase } from "@/integrations/supabase/client";
import { getTemplate } from "@/components/whiteLabelWebsite/templates";

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
};

export function OwnerWebsitePage() {
  const { activeSalon, activeSalonId, hasSalon, isLoading: ctxLoading } = useOwnerContext();
  const qc = useQueryClient();
  const { data: salon, isLoading } = useQuery(ownerSalonFullQuery(activeSalonId ?? ""));
  const update = useServerFn(updateOwnerSalon);
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
  const [preview, setPreview] = useState(false);
  const [uploading, setUploading] = useState(false);

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
      });
    }
  }, [salon, form]);

  const set = <K extends keyof Patch>(key: K, value: Patch[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  const publicUrl = useMemo(() => (salon?.slug ? `/site/${salon.slug}` : ""), [salon?.slug]);
  const selectedTemplate = getTemplate(salon?.selected_template_key);
  const previewUrl = salon?.slug
    ? `/site/${salon.slug}?preview=1&live=1`
    : `/template-preview/${encodeURIComponent(selectedTemplate.key)}?live=1`;

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [iframeReady, setIframeReady] = useState(false);

  // Post current form patch to the live preview iframe whenever it changes.
  useEffect(() => {
    if (!preview || !iframeReady || !form) return;
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage({ type: "live-preview-overrides", patch: form }, "*");
  }, [preview, iframeReady, form]);

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

  const handleSave = () => {
    if (!form) return;
    mutate.mutate(form);
  };

  const uploadFile = async (file: File, folder: "cover" | "owner" | "gallery" | "video") => {
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
        <div className="grid w-full grid-cols-1 items-center gap-2 sm:w-auto sm:grid-cols-2">
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
          <Button variant="outline" className="w-full min-w-0 sm:w-auto" asChild>
            <Link to="/owner/templates">
              <Paintbrush className="h-4 w-4" /> Choose or Change Template
            </Link>
          </Button>
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
      <div className="sticky bottom-0 -mx-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t bg-background/95 px-3 py-3 backdrop-blur sm:-mx-4 sm:px-4">
        <div className="text-muted-foreground min-w-0 text-xs">
          Simple salon template · Unsaved changes are not visible to customers yet.
        </div>
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
        <DialogContent className="flex h-[85vh] w-[calc(100vw-1.5rem)] max-w-6xl flex-col p-0 sm:w-full">
          <DialogHeader className="border-b px-4 py-3">
            <DialogTitle>Website Preview · {form.name}</DialogTitle>
          </DialogHeader>
          <iframe src={previewUrl} title="preview" className="h-full w-full flex-1" />
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


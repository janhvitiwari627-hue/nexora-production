import { useEffect, useMemo, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ExternalLink, Eye, Loader2, Sparkles, Upload, X, Save, Trash2, Plus,
} from "lucide-react";
import { toast } from "sonner";
import { useOwnerContext } from "@/hooks/use-owner-context";
import { ownerSalonFullQuery } from "@/lib/owner.queries";
import { updateOwnerSalon } from "@/lib/owner.functions";
import { supabase } from "@/integrations/supabase/client";

const THEMES = [
  { id: "modern", name: "Modern", desc: "Clean, minimal, photo-led" },
  { id: "classic", name: "Classic", desc: "Warm, refined, serif headlines" },
  { id: "luxury", name: "Luxury", desc: "Dark, gold accents, premium feel" },
  { id: "vibrant", name: "Vibrant", desc: "Bold colours, playful gradients" },
];

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
type DayKey = (typeof DAYS)[number];
const DAY_LABELS: Record<DayKey, string> = {
  mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun",
};
type HoursMap = Record<string, { open: string; close: string; closed: boolean }>;
const DEFAULT_HOURS: HoursMap = Object.fromEntries(
  DAYS.map((d) => [d, { open: "10:00", close: "20:00", closed: d === "sun" }]),
);

type Patch = {
  name?: string; tagline?: string | null; description?: string | null;
  image_url?: string | null;
  brand_primary?: string | null; brand_secondary?: string | null;
  theme?: string | null; custom_css?: string | null;
  seo_title?: string | null; seo_description?: string | null;
  phone?: string | null; email?: string | null; address?: string | null;
  hours?: HoursMap | null;
  gallery_images?: string[];
};

export function OwnerWebsitePage() {
  const { activeSalon, activeSalonId, hasSalon, isLoading: ctxLoading } = useOwnerContext();
  const qc = useQueryClient();
  const { data: salon, isLoading } = useQuery(ownerSalonFullQuery(activeSalonId ?? ""));
  const update = useServerFn(updateOwnerSalon);
  const mutate = useMutation({
    mutationFn: (patch: Patch) =>
      update({ data: { salon_id: activeSalonId!, patch } }),
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
      setForm({
        name: salon.name ?? "",
        tagline: salon.tagline ?? "",
        description: salon.description ?? "",
        image_url: salon.image_url ?? "",
        brand_primary: salon.brand_primary ?? "#6366f1",
        brand_secondary: salon.brand_secondary ?? "#ec4899",
        theme: salon.theme ?? "modern",
        custom_css: salon.custom_css ?? "",
        seo_title: salon.seo_title ?? salon.name ?? "",
        seo_description: salon.seo_description ?? salon.description ?? "",
        phone: salon.phone ?? "",
        email: salon.email ?? "",
        address: salon.address ?? "",
        hours: (salon.hours as HoursMap) ?? DEFAULT_HOURS,
        gallery_images: (salon.gallery_images as string[] | null) ?? [],
      });
    }
  }, [salon, form]);

  const set = <K extends keyof Patch>(key: K, value: Patch[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  const publicUrl = useMemo(
    () => (salon?.slug ? `/s/${salon.slug}` : ""),
    [salon?.slug],
  );

  const handleSave = () => {
    if (!form) return;
    mutate.mutate(form);
  };

  const uploadFile = async (file: File, folder: "logo" | "gallery") => {
    if (!activeSalonId) return null;
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${activeSalonId}/${folder}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("salon-media").upload(path, file, {
      cacheControl: "3600", upsert: false,
    });
    if (error) { toast.error(error.message); return null; }
    const { data } = supabase.storage.from("salon-media").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleLogoUpload = async (file: File) => {
    setUploading(true);
    const url = await uploadFile(file, "logo");
    setUploading(false);
    if (url) set("image_url", url);
  };

  const handleGalleryUpload = async (files: FileList) => {
    setUploading(true);
    const urls: string[] = [];
    for (const f of Array.from(files)) {
      const url = await uploadFile(f, "gallery");
      if (url) urls.push(url);
    }
    setUploading(false);
    if (urls.length) set("gallery_images", [...(form?.gallery_images ?? []), ...urls]);
  };

  const removeGalleryImage = (url: string) => {
    set("gallery_images", (form?.gallery_images ?? []).filter((u) => u !== url));
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
              Link a salon to your account to start customising your booking website.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl space-y-6 px-4 py-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Website Management</h1>
          <p className="text-muted-foreground text-sm">
            Customise your booking website. Changes go live after saving.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setPreview(true)} disabled={!publicUrl}>
            <Eye className="h-4 w-4" /> Live Preview
          </Button>
          <Button
            onClick={handleSave}
            disabled={mutate.isPending}
            className="bg-gradient-to-r from-indigo-500 to-pink-500 text-white hover:opacity-90"
          >
            {mutate.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Status card */}
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="space-y-2">
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              ● Live
            </Badge>
            <div className="flex items-center gap-2">
              <code className="bg-muted rounded px-2 py-1 text-sm">{publicUrl}</code>
              {publicUrl && (
                <Button variant="ghost" size="sm" asChild>
                  <a href={publicUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" /> Open
                  </a>
                </Button>
              )}
            </div>
            <div className="text-muted-foreground text-xs">
              Salon: {activeSalon?.name}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme selector */}
      <Card>
        <CardHeader><CardTitle className="text-base">Theme</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {THEMES.map((t) => {
              const active = form.theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => set("theme", t.id)}
                  className={`rounded-xl border p-4 text-left transition ${
                    active ? "border-primary ring-primary/30 ring-2" : "hover:border-primary/50 border-border"
                  }`}
                >
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-muted-foreground mt-1 text-xs">{t.desc}</div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Brand customizer */}
        <Card>
          <CardHeader><CardTitle className="text-base">Brand</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div>
              <label className="text-sm font-medium">Business Name</label>
              <Input value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} maxLength={120} className="mt-1.5" />
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
              <label className="text-sm font-medium">Logo / Cover Image</label>
              <label className="hover:bg-muted/50 mt-2 flex h-32 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors">
                {form.image_url ? (
                  <img src={form.image_url} alt="Logo" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-muted-foreground text-center">
                    {uploading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : <Upload className="mx-auto mb-1 h-5 w-5" />}
                    <div className="text-xs">Upload image (JPG/PNG)</div>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleLogoUpload(f);
                  }}
                />
              </label>
              {form.image_url && (
                <Button variant="ghost" size="sm" className="text-danger mt-2" onClick={() => set("image_url", null)}>
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <ColorField label="Primary Color" value={form.brand_primary ?? "#6366f1"} onChange={(v) => set("brand_primary", v)} />
              <ColorField label="Secondary Color" value={form.brand_secondary ?? "#ec4899"} onChange={(v) => set("brand_secondary", v)} />
            </div>
            <div>
              <label className="text-sm font-medium">About</label>
              <Textarea
                value={form.description ?? ""}
                onChange={(e) => set("description", e.target.value)}
                rows={4}
                maxLength={2000}
                placeholder="Tell customers what makes your salon special."
                className="mt-1.5"
              />
            </div>
          </CardContent>
        </Card>

        {/* SEO */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">SEO Settings</CardTitle>
            <Sparkles className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Meta Title</label>
              <Input
                value={form.seo_title ?? ""}
                onChange={(e) => set("seo_title", e.target.value)}
                maxLength={60}
                className="mt-1"
              />
              <div className="text-muted-foreground mt-1 text-xs">{(form.seo_title ?? "").length}/60</div>
            </div>
            <div>
              <label className="text-sm font-medium">Meta Description</label>
              <Textarea
                value={form.seo_description ?? ""}
                onChange={(e) => set("seo_description", e.target.value)}
                maxLength={160}
                rows={3}
                className="mt-1"
              />
              <div className="text-muted-foreground mt-1 text-xs">{(form.seo_description ?? "").length}/160</div>
            </div>
            <div className="bg-muted/40 rounded-lg border p-3">
              <div className="text-muted-foreground mb-1 text-xs">Google preview</div>
              <div className="truncate text-sm text-blue-600">{form.seo_title || form.name}</div>
              <div className="truncate text-xs text-emerald-700">{`yoursite.com${publicUrl}`}</div>
              <div className="text-muted-foreground mt-1 line-clamp-2 text-xs">{form.seo_description}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact + Hours */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Contact</CardTitle></CardHeader>
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

        <Card>
          <CardHeader><CardTitle className="text-base">Business Hours</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {DAYS.map((d) => {
              const h = form.hours?.[d] ?? DEFAULT_HOURS[d];
              return (
                <div key={d} className="grid grid-cols-[60px_1fr_1fr_70px] items-center gap-2">
                  <span className="text-sm font-medium">{DAY_LABELS[d]}</span>
                  <Input
                    type="time"
                    value={h.open}
                    disabled={h.closed}
                    onChange={(e) =>
                      set("hours", { ...(form.hours ?? DEFAULT_HOURS), [d]: { ...h, open: e.target.value } })
                    }
                  />
                  <Input
                    type="time"
                    value={h.close}
                    disabled={h.closed}
                    onChange={(e) =>
                      set("hours", { ...(form.hours ?? DEFAULT_HOURS), [d]: { ...h, close: e.target.value } })
                    }
                  />
                  <label className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
                    <Switch
                      checked={!h.closed}
                      onCheckedChange={(v) =>
                        set("hours", { ...(form.hours ?? DEFAULT_HOURS), [d]: { ...h, closed: !v } })
                      }
                    />
                    {h.closed ? "Closed" : "Open"}
                  </label>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Gallery */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Gallery</CardTitle>
          <label className="bg-primary text-primary-foreground inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold hover:opacity-90">
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
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
                <div key={url} className="group relative aspect-square overflow-hidden rounded-lg border">
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

      {/* Custom CSS */}
      <Card>
        <CardHeader><CardTitle className="text-base">Custom CSS (advanced)</CardTitle></CardHeader>
        <CardContent>
          <Textarea
            value={form.custom_css ?? ""}
            onChange={(e) => set("custom_css", e.target.value)}
            rows={6}
            placeholder=":root { --radius: 16px; }"
            className="font-mono text-xs"
          />
        </CardContent>
      </Card>

      {/* Theme preview hint + save bar */}
      <div className="sticky bottom-0 -mx-4 flex items-center justify-between border-t bg-background/95 px-4 py-3 backdrop-blur">
        <div className="text-muted-foreground text-xs">
          Theme: <span className="text-heading font-semibold">{form.theme}</span> · Unsaved changes are not visible to customers yet.
        </div>
        <Button onClick={handleSave} disabled={mutate.isPending}>
          {mutate.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save
        </Button>
      </div>

      {/* Live preview modal */}
      <Dialog open={preview} onOpenChange={setPreview}>
        <DialogContent className="flex h-[85vh] max-w-6xl flex-col p-0">
          <DialogHeader className="border-b px-4 py-3">
            <DialogTitle>Website Preview · {form.name}</DialogTitle>
          </DialogHeader>
          <iframe src={publicUrl} title="preview" className="h-full w-full flex-1" />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <button className="hover:bg-muted mt-2 flex w-full items-center gap-2 rounded-md border px-2 py-1.5">
            <div className="h-6 w-6 rounded border" style={{ backgroundColor: value }} />
            <span className="font-mono text-sm">{value}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3">
          <HexColorPicker color={value} onChange={onChange} />
          <Input value={value} onChange={(e) => onChange(e.target.value)} className="mt-3 font-mono text-sm" />
        </PopoverContent>
      </Popover>
    </div>
  );
}

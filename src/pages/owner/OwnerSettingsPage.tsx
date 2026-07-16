import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ImagePlus, Loader2, Save, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOwnerContext } from "@/hooks/use-owner-context";
import { supabase } from "@/integrations/supabase/client";
import { getOwnerSalonFull, updateOwnerSalon } from "@/lib/owner.functions";

const CATEGORIES = [
  "Barber Shop",
  "Salon",
  "Beauty Parlour",
  "Spa",
  "Tattoo Studio",
  "Massage Center",
  "Nail Art Studio",
  "Unisex",
];

type Form = {
  name: string;
  category: string;
  owner_name: string;
  tagline: string;
  description: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  location: string;
  pincode: string;
  logo_url: string;
  cover_image_url: string;
  upi_id: string;
};

const EMPTY: Form = {
  name: "",
  category: "",
  owner_name: "",
  tagline: "",
  description: "",
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  city: "",
  location: "",
  pincode: "",
  logo_url: "",
  cover_image_url: "",
  upi_id: "",
};

const s = (v: unknown) => (typeof v === "string" ? v : "");

export function OwnerSettingsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { activeSalonId, isLoading: ctxLoading, hasSalon } = useOwnerContext();
  const fetchFull = useServerFn(getOwnerSalonFull);
  const updateFn = useServerFn(updateOwnerSalon);

  const { data: salon, isLoading } = useQuery({
    queryKey: ["owner", "salon", "full", activeSalonId],
    queryFn: () => fetchFull({ data: { salon_id: activeSalonId! } }),
    enabled: !!activeSalonId,
  });

  const [form, setForm] = useState<Form>(EMPTY);
  const [uploading, setUploading] = useState<"logo" | "cover" | null>(null);

  useEffect(() => {
    if (!salon) return;
    const row = salon as Record<string, unknown>;
    setForm({
      name: s(row.name),
      category: s(row.category),
      owner_name: s(row.owner_name),
      tagline: s(row.tagline),
      description: s(row.description),
      phone: s(row.phone),
      whatsapp: s(row.whatsapp),
      email: s(row.email),
      address: s(row.address),
      city: s(row.city),
      location: s(row.location),
      pincode: s(row.pincode),
      logo_url: s(row.logo_url),
      cover_image_url: s(row.cover_image_url),
      upi_id: s(row.upi_id),
    });
  }, [salon]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((p) => ({ ...p, [k]: v }));

  const uploadImage = async (file: File, kind: "logo" | "cover") => {
    if (!activeSalonId) {
      toast.error("No active shop");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Please choose a JPG, PNG or WebP image");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be 2MB or smaller");
      return;
    }

    setUploading(kind);
    try {
      const extension =
        file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = `${activeSalonId}/${kind}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage.from("salon-media").upload(path, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("salon-media").getPublicUrl(path);
      set(kind === "logo" ? "logo_url" : "cover_image_url", data.publicUrl);
      toast.success(`${kind === "logo" ? "Logo" : "Cover image"} uploaded. Save changes to apply.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image upload failed");
    } finally {
      setUploading(null);
    }
  };

  const save = useMutation({
    mutationFn: async () => {
      if (!activeSalonId) throw new Error("No active shop");
      const patch: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(form)) {
        const t = typeof v === "string" ? v.trim() : v;
        if (k === "name") {
          if (t) patch[k] = t;
        } else {
          patch[k] = t === "" ? null : t;
        }
      }
      return updateFn({ data: { salon_id: activeSalonId, patch } });
    },
    onSuccess: async () => {
      toast.success("Shop details saved. Website updated.");
      await qc.invalidateQueries({ queryKey: ["owner"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  if (ctxLoading || isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hasSalon) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <h1 className="text-heading text-2xl font-semibold">No shop yet</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Register your shop first, then come back to manage its details.
        </p>
        <Button className="mt-4" onClick={() => navigate({ to: "/owner/register-business" })}>
          Register your shop
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 md:py-10">
      <header>
        <h1 className="text-heading text-2xl font-bold md:text-3xl">Shop Settings</h1>
        <p className="text-muted-foreground text-sm">
          Yeh single page hai shop ke saare details manage karne ke liye. Yahan se save hone wala
          data seedha aapke template website (/site/{"<slug>"}) par dikhega.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Business basics</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Business Name" required>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
          </Field>

          <Field label="Category">
            <Select value={form.category} onValueChange={(v) => set("category", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Owner Name">
            <Input value={form.owner_name} onChange={(e) => set("owner_name", e.target.value)} />
          </Field>

          <Field label="Tagline">
            <Input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
          </Field>

          <Field label="Description" className="md:col-span-2">
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Phone">
            <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </Field>

          <Field label="WhatsApp">
            <Input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
          </Field>

          <Field label="Email">
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </Field>

          <Field label="UPI ID">
            <Input
              value={form.upi_id}
              onChange={(e) => set("upi_id", e.target.value)}
              placeholder="name@bank"
            />
          </Field>

          <Field label="Address" className="md:col-span-2">
            <Textarea
              rows={2}
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
            />
          </Field>

          <Field label="City">
            <Input value={form.city} onChange={(e) => set("city", e.target.value)} />
          </Field>

          <Field label="Area / Location">
            <Input value={form.location} onChange={(e) => set("location", e.target.value)} />
          </Field>

          <Field label="PIN Code">
            <Input value={form.pincode} onChange={(e) => set("pincode", e.target.value)} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Branding images</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <ImageUploadField
            label="Logo"
            value={form.logo_url}
            uploading={uploading === "logo"}
            previewClassName="h-24 w-24 rounded-xl object-cover"
            onUpload={(file) => uploadImage(file, "logo")}
            onRemove={() => set("logo_url", "")}
          >
            <Input
              value={form.logo_url}
              onChange={(e) => set("logo_url", e.target.value)}
              placeholder="https://…"
            />
          </ImageUploadField>

          <ImageUploadField
            label="Cover Image"
            value={form.cover_image_url}
            uploading={uploading === "cover"}
            previewClassName="h-32 w-full rounded-xl object-cover"
            onUpload={(file) => uploadImage(file, "cover")}
            onRemove={() => set("cover_image_url", "")}
          >
            <Input
              value={form.cover_image_url}
              onChange={(e) => set("cover_image_url", e.target.value)}
              placeholder="https://…"
            />
          </ImageUploadField>
        </CardContent>
      </Card>

      <div className="sticky bottom-0 flex justify-end gap-2 border-t bg-background/95 py-3 backdrop-blur">
        <Button variant="outline" onClick={() => navigate({ to: "/owner/welcome" })}>
          Back
        </Button>
        <Button
          onClick={() => save.mutate()}
          disabled={save.isPending || uploading !== null || !form.name.trim()}
        >
          {save.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save changes
        </Button>
      </div>
    </div>
  );
}

function ImageUploadField({
  label,
  value,
  uploading,
  previewClassName,
  onUpload,
  onRemove,
  children,
}: {
  label: string;
  value: string;
  uploading: boolean;
  previewClassName: string;
  onUpload: (file: File) => void;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <Field label={`${label} URL`}>
      <div className="space-y-3">
        {value && (
          <div className="overflow-hidden rounded-xl border border-border bg-muted/30 p-2">
            <img src={value} alt={`${label} preview`} className={previewClassName} />
          </div>
        )}
        {children}
        <div className="flex flex-wrap items-center gap-2">
          <label
            className={`inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 ${
              uploading ? "pointer-events-none opacity-60" : ""
            }`}
          >
            {uploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="mr-2 h-4 w-4" />
            )}
            {uploading ? "Uploading…" : `Upload ${label}`}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={uploading}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onUpload(file);
                event.target.value = "";
              }}
            />
          </label>
          {value && (
            <Button type="button" variant="outline" onClick={onRemove} disabled={uploading}>
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </Button>
          )}
          <span className="text-xs text-muted-foreground">JPG, PNG or WebP · maximum 2MB</span>
        </div>
      </div>
    </Field>
  );
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-sm">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
    </div>
  );
}

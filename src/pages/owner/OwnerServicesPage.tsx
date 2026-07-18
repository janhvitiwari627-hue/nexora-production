import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  IndianRupee,
  Tag,
  Power,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/shared/Modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useOwnerContext } from "@/hooks/use-owner-context";
import { supabase } from "@/integrations/supabase/client";
import { ownerServicesQuery } from "@/lib/owner.queries";
import { deleteOwnerService, upsertOwnerService } from "@/lib/owner.functions";

const DEFAULT_CATEGORIES = [
  "Hair",
  "Skin & Facial",
  "Nails",
  "Makeup",
  "Spa & Massage",
  "Bridal",
  "Men's Grooming",
  "Other",
];

type ServiceRow = {
  id: string;
  salon_id: string;
  name: string;
  description: string | null;
  category: string | null;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  image_url: string | null;
};

function emptyService(salonId: string): Partial<ServiceRow> {
  return {
    salon_id: salonId,
    name: "",
    description: "",
    category: "Hair",
    duration_minutes: 30,
    price: 500,
    is_active: true,
    image_url: "",
  };
}

export function OwnerServicesPage() {
  const { activeSalonId, activeSalon, isLoading: ownerLoading } = useOwnerContext();
  const qc = useQueryClient();
  const upsertFn = useServerFn(upsertOwnerService);
  const deleteFn = useServerFn(deleteOwnerService);

  const { data: services = [], isLoading } = useQuery({
    ...ownerServicesQuery(activeSalonId ?? ""),
    enabled: !!activeSalonId,
  });

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<ServiceRow> | null>(null);
  const [deleting, setDeleting] = useState<ServiceRow | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  const list = services as ServiceRow[];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((s) => {
      if (filter === "active" && !s.is_active) return false;
      if (filter === "inactive" && s.is_active) return false;
      if (!q) return true;
      return s.name.toLowerCase().includes(q) || (s.description ?? "").toLowerCase().includes(q);
    });
  }, [list, query, filter]);

  const grouped = useMemo(() => {
    const m = new Map<string, ServiceRow[]>();
    for (const s of filtered) {
      const cat = s.category || "Other";
      if (!m.has(cat)) m.set(cat, []);
      m.get(cat)!.push(s);
    }
    return Array.from(m.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const stats = useMemo(() => {
    const active = list.filter((s) => s.is_active).length;
    const avgPrice = list.length
      ? list.reduce((a, s) => a + Number(s.price || 0), 0) / list.length
      : 0;
    const cats = new Set(list.map((s) => s.category || "Other")).size;
    return { total: list.length, active, avgPrice, cats };
  }, [list]);

  const upsertMut = useMutation({
    mutationFn: (input: Partial<ServiceRow>) => upsertFn({ data: input as never }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["owner", "services", activeSalonId] });
      toast.success(editing?.id ? "Service updated" : "Service added");
      setEditOpen(false);
    },
    onError: (e: Error) => toast.error(e.message || "Failed to save"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["owner", "services", activeSalonId] });
      toast.success("Service deleted");
      setDeleting(null);
    },
    onError: (e: Error) => toast.error(e.message || "Failed to delete"),
  });

  const toggleActive = (s: ServiceRow) => {
    upsertMut.mutate({
      id: s.id,
      salon_id: s.salon_id,
      name: s.name,
      description: s.description,
      category: s.category,
      duration_minutes: s.duration_minutes,
      price: s.price,
      is_active: !s.is_active,
      image_url: s.image_url,
    });
  };

  const openAdd = () => {
    if (!activeSalonId) return;
    setEditing(emptyService(activeSalonId));
    setEditOpen(true);
  };
  const openEdit = (s: ServiceRow) => {
    setEditing(s);
    setEditOpen(true);
  };

  const uploadServiceImage = async (file: File) => {
    if (!activeSalonId) return toast.error("No active salon");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return toast.error("Please choose a JPG, PNG or WebP image");
    }
    if (file.size > 2 * 1024 * 1024) {
      return toast.error("Image must be 2MB or smaller");
    }

    setImageUploading(true);
    try {
      const extension =
        file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = `${activeSalonId}/services/${Date.now()}-${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage.from("salon-media").upload(path, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });
      if (error) throw error;

      const { data } = supabase.storage.from("salon-media").getPublicUrl(path);
      setEditing((current) => ({ ...current, image_url: data.publicUrl }));
      toast.success("Service image uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image upload failed");
    } finally {
      setImageUploading(false);
    }
  };

  if (ownerLoading) return <div className="p-8 text-muted-foreground">Loading…</div>;

  if (!activeSalonId) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <Card>
          <CardContent className="p-8 text-center space-y-3">
            <Tag className="mx-auto h-10 w-10 text-muted-foreground" />
            <h1 className="text-xl font-bold">No salon connected</h1>
            <p className="text-sm text-muted-foreground">
              Complete onboarding to manage your service catalog.
            </p>
            <Button asChild>
              <a href="/owner/onboarding">Start onboarding</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-heading text-2xl font-bold">Services</h1>
            <p className="text-muted-foreground text-sm">
              {activeSalon?.name ?? "Your salon"} · {stats.total} services across {stats.cats}{" "}
              categor{stats.cats === 1 ? "y" : "ies"} · {stats.active} active
            </p>
          </div>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" /> Add Service
          </Button>
        </header>

        {/* KPIs */}
        <div className="grid gap-3 sm:grid-cols-4">
          <KPI label="Total" value={stats.total.toString()} />
          <KPI label="Active" value={stats.active.toString()} />
          <KPI label="Categories" value={stats.cats.toString()} />
          <KPI
            label="Avg price"
            value={stats.avgPrice ? `₹${Math.round(stats.avgPrice).toLocaleString("en-IN")}` : "—"}
          />
        </div>

        {/* Toolbar */}
        <div className="bg-card border-border flex flex-wrap items-center gap-3 rounded-xl border p-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search services"
              className="pl-9"
            />
          </div>
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-muted-foreground p-8 text-center">Loading services…</div>
        ) : grouped.length === 0 ? (
          <div className="bg-card border-border text-muted-foreground rounded-xl border p-12 text-center">
            {list.length === 0
              ? "No services yet. Click 'Add Service' to create your first."
              : "No services match your filters."}
          </div>
        ) : (
          <Accordion type="multiple" defaultValue={grouped.map(([c]) => c)} className="space-y-3">
            {grouped.map(([cat, items]) => (
              <AccordionItem
                key={cat}
                value={cat}
                className="bg-card border-border overflow-hidden rounded-xl border"
              >
                <AccordionTrigger className="hover:bg-muted/40 px-4 py-3 hover:no-underline">
                  <div className="flex w-full items-center justify-between pr-2">
                    <span className="text-heading text-base font-semibold">{cat}</span>
                    <Badge variant="secondary">{items.length}</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="border-border space-y-2 border-t p-4">
                  {items.map((s) => (
                    <ServiceRow
                      key={s.id}
                      service={s}
                      onEdit={() => openEdit(s)}
                      onDelete={() => setDeleting(s)}
                      onToggle={() => toggleActive(s)}
                    />
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={editing?.id ? "Edit Service" : "Add Service"}
        size="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!editing?.name?.trim()) return toast.error("Name is required");
            const payload: Partial<ServiceRow> = {
              ...(editing.id ? { id: editing.id } : {}),
              salon_id: activeSalonId,
              name: editing.name.trim(),
              description: editing.description || null,
              category: editing.category || null,
              duration_minutes: Number(editing.duration_minutes ?? 30),
              price: Number(editing.price ?? 0),
              is_active: editing.is_active ?? true,
              image_url: editing.image_url || null,
            };
            upsertMut.mutate(payload);
          }}
          className="space-y-4 p-6"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label className="text-xs uppercase tracking-wide">Service name *</Label>
              <Input
                required
                maxLength={120}
                value={editing?.name ?? ""}
                onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))}
                className="mt-1"
                placeholder="e.g. Hair Spa with Head Massage"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide">Category</Label>
              <Select
                value={editing?.category ?? "Other"}
                onValueChange={(v) => setEditing((p) => ({ ...p, category: v }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEFAULT_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide">Duration (min)</Label>
              <Input
                type="number"
                min={5}
                max={600}
                value={editing?.duration_minutes ?? 30}
                onChange={(e) =>
                  setEditing((p) => ({ ...p, duration_minutes: Number(e.target.value) }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide">Price (₹)</Label>
              <Input
                type="number"
                min={0}
                value={editing?.price ?? 0}
                onChange={(e) => setEditing((p) => ({ ...p, price: Number(e.target.value) }))}
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <div className="flex h-10 items-center gap-2 rounded-md border px-3">
                <Switch
                  checked={editing?.is_active ?? true}
                  onCheckedChange={(c) => setEditing((p) => ({ ...p, is_active: c }))}
                />
                <span className="text-sm">{editing?.is_active ? "Active" : "Inactive"}</span>
              </div>
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs uppercase tracking-wide">Description</Label>
              <Textarea
                rows={3}
                maxLength={1000}
                value={editing?.description ?? ""}
                onChange={(e) => setEditing((p) => ({ ...p, description: e.target.value }))}
                className="mt-1"
                placeholder="What's included, who it's for, any add-ons…"
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs uppercase tracking-wide">Image URL (optional)</Label>
              {editing?.image_url && (
                <img
                  src={editing.image_url}
                  alt="Service preview"
                  className="border-border mt-2 h-32 w-full rounded-xl border object-cover"
                />
              )}
              <Input
                value={editing?.image_url ?? ""}
                onChange={(e) => setEditing((p) => ({ ...p, image_url: e.target.value }))}
                className="mt-1"
                placeholder="https://…"
              />
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <label
                  className={`bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 cursor-pointer items-center justify-center rounded-md px-4 text-sm font-medium shadow-sm transition ${
                    imageUploading ? "pointer-events-none opacity-60" : ""
                  }`}
                >
                  {imageUploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ImagePlus className="mr-2 h-4 w-4" />
                  )}
                  {imageUploading ? "Uploading…" : "Upload Image"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    disabled={imageUploading}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) uploadServiceImage(file);
                      event.target.value = "";
                    }}
                  />
                </label>
                {editing?.image_url && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={imageUploading}
                    onClick={() => setEditing((current) => ({ ...current, image_url: "" }))}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                )}
                <span className="text-muted-foreground text-xs">
                  JPG, PNG or WebP · maximum 2MB
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={upsertMut.isPending || imageUploading}>
              {upsertMut.isPending ? "Saving…" : editing?.id ? "Save changes" : "Add service"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete service" size="md">
        <div className="space-y-5 p-6">
          <p className="text-sm">
            Permanently delete <strong>{deleting?.name}</strong>? Past bookings won't be affected.
          </p>
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button
              className="bg-danger hover:bg-danger/90 text-white"
              disabled={deleteMut.isPending}
              onClick={() => deleting && deleteMut.mutate(deleting.id)}
            >
              {deleteMut.isPending ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function KPI({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-muted-foreground text-xs uppercase tracking-wide">{label}</div>
        <div className="text-heading mt-1 text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function ServiceRow({
  service,
  onEdit,
  onDelete,
  onToggle,
}: {
  service: ServiceRow;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  return (
    <div className="bg-background border-border flex flex-wrap items-center gap-3 rounded-lg border p-3 sm:flex-nowrap">
      {service.image_url ? (
        <img
          src={service.image_url}
          alt=""
          className="border-border h-14 w-14 rounded-lg border object-cover"
        />
      ) : (
        <div className="bg-muted text-muted-foreground grid h-14 w-14 place-items-center rounded-lg">
          <Tag className="h-5 w-5" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-heading truncate font-semibold">{service.name}</h4>
          {!service.is_active && <Badge variant="outline">Inactive</Badge>}
        </div>
        {service.description && (
          <p className="text-muted-foreground line-clamp-1 text-xs">{service.description}</p>
        )}
        <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1 text-heading font-semibold">
            <IndianRupee className="h-3 w-3" />
            {Number(service.price || 0).toLocaleString("en-IN")}
          </span>
          <span>{service.duration_minutes} min</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button size="icon" variant="ghost" onClick={onToggle} aria-label="Toggle active">
          <Power
            className={`h-4 w-4 ${service.is_active ? "text-emerald-600" : "text-muted-foreground"}`}
          />
        </Button>
        <Button size="icon" variant="ghost" onClick={onEdit} aria-label="Edit">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="text-danger hover:bg-danger/10"
          onClick={onDelete}
          aria-label="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

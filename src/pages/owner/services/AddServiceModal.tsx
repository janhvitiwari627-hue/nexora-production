import { useEffect, useState } from "react";
import { ImagePlus, Sparkles } from "lucide-react";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { OwnerService, ServiceCategory, Gender } from "./mockServices";

export function AddServiceModal({
  open,
  onClose,
  onSave,
  categories,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (s: OwnerService) => void;
  categories: ServiceCategory[];
  initial?: OwnerService | null;
}) {
  const [form, setForm] = useState<OwnerService>(() => emptyService(categories[0]?.id ?? "hair"));
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initial ?? emptyService(categories[0]?.id ?? "hair"));
    }
  }, [open, initial, categories]);

  const generateDescription = () => {
    if (!form.name) return;
    setGenerating(true);
    setTimeout(() => {
      setForm((f) => ({
        ...f,
        description: `Experience our premium ${f.name.toLowerCase()} — performed by certified specialists using salon-grade products for a refreshed, polished result that lasts.`,
      }));
      setGenerating(false);
    }, 700);
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, image: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({ ...form, id: form.id || `s${Date.now()}` });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? "Edit Service" : "Add Service"} size="lg">
      <form onSubmit={submit} className="space-y-5 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Category">
            <Select
              value={form.categoryId}
              onValueChange={(v) => setForm({ ...form, categoryId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Service name">
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Hydrating Facial"
            />
          </Field>
        </div>

        <Field
          label="Description"
          action={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={generateDescription}
              disabled={!form.name || generating}
              className="text-primary"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {generating ? "Generating…" : "AI Generate"}
            </Button>
          }
        >
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            placeholder="Briefly describe this service…"
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Duration">
            <div className="relative">
              <Input
                type="number"
                min={5}
                step={5}
                value={form.durationMin}
                onChange={(e) => setForm({ ...form, durationMin: Number(e.target.value) })}
              />
              <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs">
                min
              </span>
            </div>
          </Field>
          <Field label="Regular price (₹)">
            <Input
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            />
          </Field>
          <Field label="Offer price (₹)">
            <Input
              type="number"
              min={0}
              value={form.offerPrice ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  offerPrice: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              placeholder="Optional"
            />
          </Field>
        </div>

        <Field label="Available for">
          <RadioGroup
            value={form.gender}
            onValueChange={(v) => setForm({ ...form, gender: v as Gender })}
            className="flex gap-4"
          >
            {(["all", "female", "male"] as Gender[]).map((g) => (
              <label key={g} className="inline-flex items-center gap-2 text-sm capitalize">
                <RadioGroupItem value={g} /> {g === "all" ? "Everyone" : g}
              </label>
            ))}
          </RadioGroup>
        </Field>

        <Field label="Service image">
          <label className="border-border bg-muted/30 hover:bg-muted/50 flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-sm transition">
            {form.image ? (
              <img src={form.image} alt="" className="h-20 w-20 rounded object-cover" />
            ) : (
              <>
                <ImagePlus className="text-muted-foreground h-5 w-5" />
                <span className="text-muted-foreground">Click to upload image (PNG, JPG)</span>
              </>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
          </label>
        </Field>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{initial ? "Save changes" : "Add service"}</Button>
        </div>
      </form>
    </Modal>
  );
}

function Field({
  label,
  action,
  children,
}: {
  label: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-heading text-xs font-semibold uppercase tracking-wide">
          {label}
        </Label>
        {action}
      </div>
      {children}
    </div>
  );
}

function emptyService(categoryId: string): OwnerService {
  return {
    id: "",
    categoryId,
    name: "",
    description: "",
    durationMin: 30,
    price: 0,
    gender: "all",
    featured: false,
    active: true,
  };
}

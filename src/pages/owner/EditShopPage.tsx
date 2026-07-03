import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import { getOwnerSalonFull, updateOwnerSalon } from "@/lib/owner.functions";

const CATEGORIES = [
  "Hire Cute Shop",
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

export function EditShopPage() {
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
    onSuccess: () => {
      toast.success("Shop details updated");
      qc.invalidateQueries({ queryKey: ["owner"] });
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
          Create your shop first, then come back to edit its details.
        </p>
        <Button className="mt-4" onClick={() => navigate({ to: "/owner/onboarding" })}>
          Get started
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 md:py-10">
      <header>
        <h1 className="text-heading text-2xl font-bold md:text-3xl">Edit Shop</h1>
        <p className="text-muted-foreground text-sm">Update your shop details anytime.</p>
      </header>

      <Card>
        <CardContent className="grid gap-4 p-6 md:grid-cols-2">
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

          <Field label="Phone">
            <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </Field>

          <Field label="WhatsApp">
            <Input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
          </Field>

          <Field label="Email">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
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

          <Field label="Logo URL" className="md:col-span-2">
            <Input
              value={form.logo_url}
              onChange={(e) => set("logo_url", e.target.value)}
              placeholder="https://…"
            />
          </Field>

          <Field label="Cover Image URL" className="md:col-span-2">
            <Input
              value={form.cover_image_url}
              onChange={(e) => set("cover_image_url", e.target.value)}
              placeholder="https://…"
            />
          </Field>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate({ to: "/owner/dashboard" })}>
          Cancel
        </Button>
        <Button
          onClick={() => save.mutate()}
          disabled={save.isPending || !form.name.trim()}
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

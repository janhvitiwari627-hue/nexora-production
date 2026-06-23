import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Megaphone, Plus, Trash2, Calendar, Target as TargetIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PortalLayout, PortalHeading, EmptyHint } from "./PortalLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { z } from "zod";
import { useAuthStore } from "@/stores/authStore";
import { SingleFileUpload } from "./FileUpload";
import { getMyBrand, type Brand, type BrandProduct } from "./lib";

type Promotion = {
  id: string;
  brand_id: string;
  product_id: string | null;
  title: string;
  description: string | null;
  target_category: string | null;
  target_state: string | null;
  target_district: string | null;
  budget: number | null;
  banner_url: string | null;
  start_date: string;
  end_date: string;
  status: string;
  impressions: number;
  clicks: number;
  created_at: string;
};

const promoSchema = z.object({
  title: z.string().trim().min(3, "Title is required").max(120),
  description: z.string().max(500).optional().nullable(),
  product_id: z.string().uuid().optional().nullable(),
  target_category: z.string().max(80).optional().nullable(),
  target_state: z.string().max(80).optional().nullable(),
  target_district: z.string().max(80).optional().nullable(),
  budget: z.number().min(0).max(10_000_000).optional().nullable(),
  start_date: z.string().min(1),
  end_date: z.string().min(1),
});

const CATEGORIES = ["Skincare", "Haircare", "Makeup", "Fragrance", "Tools", "Wellness", "Nails", "Other"];

export function PromotionCenterPage() {
  const user = useAuthStore((s) => s.user);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [products, setProducts] = useState<BrandProduct[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const in14 = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  }, []);

  const [form, setForm] = useState({
    title: "",
    description: "",
    product_id: "",
    target_category: "",
    target_state: "",
    target_district: "",
    budget: "",
    start_date: today,
    end_date: in14,
    banner_url: "",
  });

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) { setLoading(false); return; }
    (async () => {
      const b = await getMyBrand(user.id);
      setBrand(b);
      if (b) {
        const [{ data: prods }, { data: promos }] = await Promise.all([
          supabase.from("brand_products").select("id,brand_id,name,description,category,image_url,price,mrp,is_featured").eq("brand_id", b.id).order("name"),
          (supabase as any).from("promotions").select("*").eq("brand_id", b.id).order("created_at", { ascending: false }),
        ]);
        setProducts((prods ?? []) as BrandProduct[]);
        setPromotions((promos ?? []) as Promotion[]);
      }
      setLoading(false);
    })();
  }, [user, isInitialized]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!brand) return;
    const parsed = promoSchema.safeParse({
      title: form.title,
      description: form.description || null,
      product_id: form.product_id || null,
      target_category: form.target_category || null,
      target_state: form.target_state || null,
      target_district: form.target_district || null,
      budget: form.budget ? Number(form.budget) : null,
      start_date: form.start_date,
      end_date: form.end_date,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    if (parsed.data.end_date < parsed.data.start_date) {
      toast.error("End date must be after start date");
      return;
    }
    setSubmitting(true);
    const payload = { ...parsed.data, brand_id: brand.id, banner_url: form.banner_url || null, status: "pending" };
    const { data, error } = await (supabase as any).from("promotions").insert(payload).select().single();
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Promotion submitted for review");
    setPromotions((p) => [data as Promotion, ...p]);
    setForm({ ...form, title: "", description: "", product_id: "", target_category: "", target_state: "", target_district: "", budget: "", banner_url: "" });
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this promotion?")) return;
    const { error } = await (supabase as any).from("promotions").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setPromotions((p) => p.filter((x) => x.id !== id));
    toast.success("Promotion removed");
  }

  if (!isInitialized || loading) {
    return <PortalLayout><p className="text-sm text-muted-foreground">Loading…</p></PortalLayout>;
  }

  if (!user) {
    return (
      <PortalLayout>
        <PortalHeading eyebrow="Promotion Center" title="Sign in to manage promotions" />
        <Button asChild className="bg-gradient-cta text-primary-foreground"><Link to="/login">Sign in</Link></Button>
      </PortalLayout>
    );
  }

  if (!brand) {
    return (
      <PortalLayout>
        <PortalHeading eyebrow="Promotion Center" title="Register a brand to create promotions" />
        <EmptyHint
          icon={Megaphone}
          title="No brand profile yet"
          body="Promotions are tied to your brand profile. Register one to get started."
          action={<Button asChild className="bg-gradient-cta text-primary-foreground"><Link to="/portal/brands/register">Register brand</Link></Button>}
        />
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <PortalHeading
        eyebrow="Promotion Center"
        title="Promote products to beauty businesses"
        description="Target by category, state and district. Submitted promotions go through a quick review before going live."
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-heading">Create promotion</h3>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="title">Promotion title *</Label>
              <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Summer skincare launch" required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What's the offer? Who's it for?" />
            </div>

            <div>
              <Label>Product</Label>
              <Select value={form.product_id || "all"} onValueChange={(v) => setForm({ ...form, product_id: v === "all" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="All products / brand-wide" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All products (brand-wide)</SelectItem>
                  {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {products.length === 0 && (
                <p className="mt-1 text-xs text-muted-foreground">No products yet — add some on your brand page.</p>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <Label>Target category</Label>
                <Select value={form.target_category || "any"} onValueChange={(v) => setForm({ ...form, target_category: v === "any" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any category</SelectItem>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="state">Target state</Label>
                <Input id="state" value={form.target_state} onChange={(e) => setForm({ ...form, target_state: e.target.value })} placeholder="e.g. Maharashtra" />
              </div>
              <div>
                <Label htmlFor="district">Target district</Label>
                <Input id="district" value={form.target_district} onChange={(e) => setForm({ ...form, target_district: e.target.value })} placeholder="e.g. Pune" />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <Label htmlFor="budget">Budget (₹)</Label>
                <Input id="budget" type="number" min={0} step={500} value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="5000" />
              </div>
              <div>
                <Label htmlFor="start">Start date *</Label>
                <Input id="start" type="date" min={today} value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="end">End date *</Label>
                <Input id="end" type="date" min={form.start_date} value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} required />
              </div>
            </div>

            <div>
              <Label>Banner image</Label>
              <SingleFileUpload value={form.banner_url} onChange={(url) => setForm({ ...form, banner_url: url || "" })} folder={`promotions/${brand.id}`} />
              <p className="mt-1 text-xs text-muted-foreground">Recommended 1200×400, under 2 MB.</p>
            </div>

            <Button type="submit" disabled={submitting} className="w-full bg-gradient-cta text-primary-foreground">
              {submitting ? "Submitting…" : "Submit promotion"}
            </Button>
          </form>
        </Card>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-heading">Your promotions ({promotions.length})</h3>
          </div>
          {promotions.length === 0 ? (
            <EmptyHint icon={Megaphone} title="No promotions yet" body="Submit your first campaign and reach thousands of salons and beauty retailers." />
          ) : (
            <div className="space-y-3">
              {promotions.map((p) => (
                <Card key={p.id} className="overflow-hidden">
                  {p.banner_url && <img src={p.banner_url} alt={p.title} className="h-32 w-full object-cover" />}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-heading">{p.title}</p>
                        {p.description && <p className="mt-1 text-sm text-body line-clamp-2">{p.description}</p>}
                      </div>
                      <Badge variant={p.status === "active" ? "default" : "secondary"} className={p.status === "active" ? "bg-emerald-500 text-white" : ""}>{p.status}</Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{p.start_date} → {p.end_date}</span>
                      {p.target_category && <span className="inline-flex items-center gap-1"><TargetIcon className="h-3 w-3" />{p.target_category}</span>}
                      {p.target_state && <Badge variant="outline">{[p.target_district, p.target_state].filter(Boolean).join(", ")}</Badge>}
                      {p.budget != null && <Badge variant="outline">₹{Number(p.budget).toLocaleString()}</Badge>}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{p.impressions.toLocaleString()} views · {p.clicks.toLocaleString()} clicks</span>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(p.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="mr-1 h-3 w-3" />Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}

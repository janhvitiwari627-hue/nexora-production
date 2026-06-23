import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { PortalLayout, PortalHeading } from "./PortalLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { slugify, getMyBrand, type Brand } from "./lib";

export function BrandRegistrationPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [existing, setExisting] = useState<Brand | null>(null);
  const [form, setForm] = useState({
    name: "", tagline: "", description: "", category: "", website: "", email: "", phone: "",
    hq_city: "", hq_state: "", logo_url: "", cover_url: "",
    social_instagram: "", social_facebook: "", social_youtube: "",
  });

  useEffect(() => {
    if (!user) return;
    getMyBrand(user.id).then((b) => {
      if (b) {
        setExisting(b);
        setForm((f) => ({ ...f, ...Object.fromEntries(Object.entries(b).filter(([_, v]) => v !== null)) as any }));
      }
    });
  }, [user]);

  const submit = async () => {
    if (!user) { toast.error("Please sign in"); navigate({ to: "/login" }); return; }
    if (!form.name.trim()) { toast.error("Brand name is required"); return; }
    setLoading(true);
    const payload: any = { ...form, user_id: user.id };
    Object.keys(payload).forEach((k) => { if (payload[k] === "") payload[k] = null; });
    payload.name = form.name.trim();

    let error;
    if (existing) {
      ({ error } = await supabase.from("brands").update(payload).eq("id", existing.id));
    } else {
      payload.slug = slugify(form.name);
      ({ error } = await supabase.from("brands").insert(payload));
    }
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success(existing ? "Brand profile updated" : "Brand registered successfully");
    navigate({ to: "/portal/dashboard" });
  };

  return (
    <PortalLayout>
      <PortalHeading
        eyebrow={existing ? "Edit Brand" : "Brand Registration"}
        title={existing ? "Update your brand profile" : "Register your brand"}
        description="Create your brand presence on Nexora. Visible to thousands of beauty businesses across India."
      />
      <Card className="p-6 md:p-8">
        <div className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Field id="name" label="Brand Name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Field id="category" label="Category" placeholder="e.g. Haircare, Skincare" value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
          </div>
          <Field id="tagline" label="Tagline" value={form.tagline} onChange={(v) => setForm({ ...form, tagline: v })} />
          <div>
            <Label htmlFor="desc">Description</Label>
            <Textarea id="desc" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Field id="logo" label="Logo URL" value={form.logo_url} onChange={(v) => setForm({ ...form, logo_url: v })} />
            <Field id="cover" label="Cover Image URL" value={form.cover_url} onChange={(v) => setForm({ ...form, cover_url: v })} />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Field id="website" label="Website" value={form.website} onChange={(v) => setForm({ ...form, website: v })} />
            <Field id="email" label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            <Field id="phone" label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Field id="city" label="HQ City" value={form.hq_city} onChange={(v) => setForm({ ...form, hq_city: v })} />
            <Field id="state" label="HQ State" value={form.hq_state} onChange={(v) => setForm({ ...form, hq_state: v })} />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Field id="ig" label="Instagram" value={form.social_instagram} onChange={(v) => setForm({ ...form, social_instagram: v })} />
            <Field id="fb" label="Facebook" value={form.social_facebook} onChange={(v) => setForm({ ...form, social_facebook: v })} />
            <Field id="yt" label="YouTube" value={form.social_youtube} onChange={(v) => setForm({ ...form, social_youtube: v })} />
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => navigate({ to: "/portal" })}>Cancel</Button>
            <Button onClick={submit} disabled={loading} className="bg-gradient-cta text-primary-foreground">
              {loading ? "Saving…" : existing ? "Update Profile" : "Register Brand"}
            </Button>
          </div>
        </div>
      </Card>
    </PortalLayout>
  );
}

function Field({ id, label, value, onChange, placeholder }: { id: string; label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

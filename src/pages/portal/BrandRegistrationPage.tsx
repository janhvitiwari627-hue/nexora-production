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
import { SingleFileUpload, MultiFileUpload } from "./FileUpload";

const BUSINESS_TYPES = ["Manufacturer", "Importer", "Brand Owner", "Exporter"];

export function BrandRegistrationPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [existing, setExisting] = useState<Brand | null>(null);
  const [form, setForm] = useState({
    name: "",
    company_name: "",
    owner_name: "",
    tagline: "",
    description: "",
    category: "",
    website: "",
    email: "",
    phone: "",
    gst_number: "",
    pan_number: "",
    business_type: "",
    address: "",
    hq_city: "",
    hq_state: "",
    pincode: "",
    logo_url: "",
    cover_url: "",
    social_instagram: "",
    social_facebook: "",
    social_youtube: "",
    document_urls: [] as string[],
    gallery_urls: [] as string[],
  });

  useEffect(() => {
    if (!user) return;
    getMyBrand(user.id).then((b) => {
      if (b) {
        setExisting(b);
        setForm((f) => ({
          ...f,
          ...(Object.fromEntries(
            Object.entries(b).filter(([_, v]) => v !== null && !Array.isArray(v)),
          ) as any),
          document_urls: (b as any).document_urls ?? [],
          gallery_urls: (b as any).gallery_urls ?? [],
        }));
      }
    });
  }, [user]);

  const submit = async () => {
    if (!user) {
      toast.error("Please sign in");
      navigate({ to: "/login" });
      return;
    }
    if (!form.name.trim()) {
      toast.error("Brand name is required");
      return;
    }
    setLoading(true);
    const payload: any = { ...form, user_id: user.id };
    Object.keys(payload).forEach((k) => {
      if (payload[k] === "") payload[k] = null;
    });
    payload.name = form.name.trim();
    payload.document_urls = form.document_urls;
    payload.gallery_urls = form.gallery_urls;

    let error;
    if (existing) {
      ({ error } = await supabase.from("brands").update(payload).eq("id", existing.id));
    } else {
      payload.slug = slugify(form.name);
      ({ error } = await supabase.from("brands").insert(payload));
    }
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
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
        <div className="grid gap-5">
          <SectionTitle>Company & Brand</SectionTitle>
          <div className="grid gap-3 md:grid-cols-2">
            <Field
              id="cn"
              label="Company Name"
              value={form.company_name}
              onChange={(v) => setForm({ ...form, company_name: v })}
            />
            <Field
              id="name"
              label="Brand Name *"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
            />
            <Field
              id="owner"
              label="Owner Name"
              value={form.owner_name}
              onChange={(v) => setForm({ ...form, owner_name: v })}
            />
            <Field
              id="category"
              label="Category"
              placeholder="e.g. Haircare, Skincare"
              value={form.category}
              onChange={(v) => setForm({ ...form, category: v })}
            />
          </div>
          <Field
            id="tagline"
            label="Tagline"
            value={form.tagline}
            onChange={(v) => setForm({ ...form, tagline: v })}
          />
          <div>
            <Label htmlFor="desc">Company Description</Label>
            <Textarea
              id="desc"
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <SectionTitle>Contact</SectionTitle>
          <div className="grid gap-3 md:grid-cols-3">
            <Field
              id="phone"
              label="Mobile"
              value={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
            />
            <Field
              id="email"
              label="Email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
            />
            <Field
              id="website"
              label="Website"
              value={form.website}
              onChange={(v) => setForm({ ...form, website: v })}
            />
          </div>

          <SectionTitle>Business Details</SectionTitle>
          <div className="grid gap-3 md:grid-cols-3">
            <Field
              id="gst"
              label="GST Number"
              value={form.gst_number}
              onChange={(v) => setForm({ ...form, gst_number: v })}
            />
            <Field
              id="pan"
              label="PAN"
              value={form.pan_number}
              onChange={(v) => setForm({ ...form, pan_number: v })}
            />
            <div>
              <Label htmlFor="bt">Business Type</Label>
              <select
                id="bt"
                value={form.business_type}
                onChange={(e) => setForm({ ...form, business_type: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select…</option>
                {BUSINESS_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <SectionTitle>Address</SectionTitle>
          <Field
            id="addr"
            label="Address"
            value={form.address}
            onChange={(v) => setForm({ ...form, address: v })}
          />
          <div className="grid gap-3 md:grid-cols-3">
            <Field
              id="state"
              label="State"
              value={form.hq_state}
              onChange={(v) => setForm({ ...form, hq_state: v })}
            />
            <Field
              id="city"
              label="City"
              value={form.hq_city}
              onChange={(v) => setForm({ ...form, hq_city: v })}
            />
            <Field
              id="pin"
              label="Pincode"
              value={form.pincode}
              onChange={(v) => setForm({ ...form, pincode: v })}
            />
          </div>

          <SectionTitle>Media & Documents</SectionTitle>
          <div className="grid gap-4 md:grid-cols-2">
            <SingleFileUpload
              label="Logo"
              value={form.logo_url}
              userId={user?.id}
              folder="brand-logos"
              onChange={(url) => setForm({ ...form, logo_url: url })}
            />
            <SingleFileUpload
              label="Cover Image"
              value={form.cover_url}
              userId={user?.id}
              folder="brand-covers"
              onChange={(url) => setForm({ ...form, cover_url: url })}
            />
          </div>
          <MultiFileUpload
            label="Gallery Images"
            values={form.gallery_urls}
            userId={user?.id}
            folder="brand-gallery"
            onChange={(v) => setForm({ ...form, gallery_urls: v })}
          />
          <MultiFileUpload
            label="Documents (GST, PAN, certificates — PDF or image)"
            values={form.document_urls}
            userId={user?.id}
            folder="brand-docs"
            onChange={(v) => setForm({ ...form, document_urls: v })}
            accept="image/*,application/pdf"
          />

          <SectionTitle>Social Links</SectionTitle>
          <div className="grid gap-3 md:grid-cols-3">
            <Field
              id="ig"
              label="Instagram"
              value={form.social_instagram}
              onChange={(v) => setForm({ ...form, social_instagram: v })}
            />
            <Field
              id="fb"
              label="Facebook"
              value={form.social_facebook}
              onChange={(v) => setForm({ ...form, social_facebook: v })}
            />
            <Field
              id="yt"
              label="YouTube"
              value={form.social_youtube}
              onChange={(v) => setForm({ ...form, social_youtube: v })}
            />
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => navigate({ to: "/portal" })}>
              Cancel
            </Button>
            <Button
              onClick={submit}
              disabled={loading}
              className="bg-gradient-cta text-primary-foreground"
            >
              {loading ? "Saving…" : existing ? "Update Profile" : "Submit for Verification"}
            </Button>
          </div>
        </div>
      </Card>
    </PortalLayout>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="border-b border-border/60 pb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </h3>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

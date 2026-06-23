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
import { slugify, getMyDistributor, type Distributor } from "./lib";
import { SingleFileUpload, MultiFileUpload } from "./FileUpload";

const BUSINESS_TYPES = ["Distributor", "Super Stockist", "Wholesaler", "Dealer", "Importer"];

export function DistributorRegistrationPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [existing, setExisting] = useState<Distributor | null>(null);
  const [form, setForm] = useState({
    company_name: "", owner_name: "", contact_person: "", description: "",
    email: "", phone: "", website: "",
    gst_number: "", pan_number: "", business_type: "",
    state: "", district: "", city: "", pincode: "", address: "",
    coverage_states_text: "", coverage_districts_text: "", categories_text: "", brands_handled_text: "",
    logo_url: "", cover_url: "", years_in_business: "",
    document_urls: [] as string[],
    gallery_urls: [] as string[],
  });

  useEffect(() => {
    if (!user) return;
    getMyDistributor(user.id).then((d) => {
      if (d) {
        setExisting(d);
        setForm((f) => ({
          ...f,
          ...Object.fromEntries(Object.entries(d).filter(([_, v]) => v !== null && typeof v !== "object")) as any,
          coverage_states_text: (d.coverage_states ?? []).join(", "),
          coverage_districts_text: (d.coverage_districts ?? []).join(", "),
          categories_text: (d.categories ?? []).join(", "),
          brands_handled_text: (d.brands_handled ?? []).join(", "),
          document_urls: (d as any).document_urls ?? [],
          gallery_urls: (d as any).gallery_urls ?? [],
          years_in_business: (d as any).years_in_business?.toString() ?? "",
        }));
      }
    });
  }, [user]);

  const submit = async () => {
    if (!user) { toast.error("Please sign in"); navigate({ to: "/login" }); return; }
    if (!form.company_name.trim()) { toast.error("Business name is required"); return; }
    setLoading(true);
    const splitCsv = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
    const payload: any = {
      user_id: user.id,
      company_name: form.company_name.trim(),
      owner_name: form.owner_name || null,
      contact_person: form.contact_person || null,
      description: form.description || null,
      email: form.email || null,
      phone: form.phone || null,
      website: form.website || null,
      gst_number: form.gst_number || null,
      pan_number: form.pan_number || null,
      business_type: form.business_type || null,
      state: form.state || null,
      district: form.district || null,
      city: form.city || null,
      pincode: form.pincode || null,
      address: form.address || null,
      logo_url: form.logo_url || null,
      cover_url: form.cover_url || null,
      coverage_states: splitCsv(form.coverage_states_text),
      coverage_districts: splitCsv(form.coverage_districts_text),
      categories: splitCsv(form.categories_text),
      brands_handled: splitCsv(form.brands_handled_text),
      years_in_business: form.years_in_business ? parseInt(form.years_in_business, 10) : null,
      document_urls: form.document_urls,
      gallery_urls: form.gallery_urls,
    };

    let error;
    if (existing) {
      ({ error } = await supabase.from("distributors").update(payload).eq("id", existing.id));
    } else {
      payload.slug = slugify(form.company_name);
      ({ error } = await supabase.from("distributors").insert(payload));
    }
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success(existing ? "Distributor profile updated" : "Submitted for approval");
    navigate({ to: "/portal/dashboard" });
  };

  return (
    <PortalLayout>
      <PortalHeading
        eyebrow={existing ? "Edit Distributor" : "Distributor Registration"}
        title={existing ? "Update your distributor profile" : "Register your distribution business"}
        description="Create your distributor presence on Nexora. Salons and brands across India will discover you."
      />
      <Card className="p-6 md:p-8">
        <div className="grid gap-5">
          <SectionTitle>Business</SectionTitle>
          <div className="grid gap-3 md:grid-cols-2">
            <F id="cn" label="Business Name *" value={form.company_name} onChange={(v) => setForm({ ...form, company_name: v })} />
            <F id="own" label="Owner Name" value={form.owner_name} onChange={(v) => setForm({ ...form, owner_name: v })} />
            <F id="cp" label="Contact Person" value={form.contact_person} onChange={(v) => setForm({ ...form, contact_person: v })} />
            <div>
              <Label htmlFor="bt">Business Type</Label>
              <select id="bt" value={form.business_type}
                onChange={(e) => setForm({ ...form, business_type: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Select…</option>
                {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor="dd">Business Description</Label>
            <Textarea id="dd" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <SectionTitle>Contact</SectionTitle>
          <div className="grid gap-3 md:grid-cols-3">
            <F id="em" label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            <F id="ph" label="Mobile" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            <F id="ws" label="Website" value={form.website} onChange={(v) => setForm({ ...form, website: v })} />
          </div>

          <SectionTitle>Statutory</SectionTitle>
          <div className="grid gap-3 md:grid-cols-3">
            <F id="gst" label="GST Number" value={form.gst_number} onChange={(v) => setForm({ ...form, gst_number: v })} />
            <F id="pan" label="PAN" value={form.pan_number} onChange={(v) => setForm({ ...form, pan_number: v })} />
            <F id="yib" label="Years in Business" value={form.years_in_business} onChange={(v) => setForm({ ...form, years_in_business: v })} />
          </div>

          <SectionTitle>Office Address</SectionTitle>
          <F id="addr" label="Office Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
          <div className="grid gap-3 md:grid-cols-4">
            <F id="state" label="State" value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
            <F id="dist" label="District" value={form.district} onChange={(v) => setForm({ ...form, district: v })} />
            <F id="city" label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
            <F id="pin" label="Pincode" value={form.pincode} onChange={(v) => setForm({ ...form, pincode: v })} />
          </div>

          <SectionTitle>Coverage & Catalog</SectionTitle>
          <div className="grid gap-3 md:grid-cols-2">
            <F id="cov" label="Coverage States (comma separated)" value={form.coverage_states_text} onChange={(v) => setForm({ ...form, coverage_states_text: v })} />
            <F id="covd" label="Coverage Districts (comma separated)" value={form.coverage_districts_text} onChange={(v) => setForm({ ...form, coverage_districts_text: v })} />
            <F id="cat" label="Categories Handled (comma separated)" value={form.categories_text} onChange={(v) => setForm({ ...form, categories_text: v })} />
            <F id="brh" label="Brands Handled (comma separated)" value={form.brands_handled_text} onChange={(v) => setForm({ ...form, brands_handled_text: v })} />
          </div>

          <SectionTitle>Media & Documents</SectionTitle>
          <div className="grid gap-4 md:grid-cols-2">
            <SingleFileUpload label="Profile / Logo" value={form.logo_url} userId={user?.id} folder="dist-logos"
              onChange={(url) => setForm({ ...form, logo_url: url })} />
            <SingleFileUpload label="Cover Image" value={form.cover_url} userId={user?.id} folder="dist-covers"
              onChange={(url) => setForm({ ...form, cover_url: url })} />
          </div>
          <MultiFileUpload label="Business Gallery" values={form.gallery_urls} userId={user?.id}
            folder="dist-gallery" onChange={(v) => setForm({ ...form, gallery_urls: v })} />
          <MultiFileUpload label="Business Documents (GST, trade licence, PAN — PDF or image)" values={form.document_urls}
            userId={user?.id} folder="dist-docs" onChange={(v) => setForm({ ...form, document_urls: v })}
            accept="image/*,application/pdf" />

          <div className="mt-2 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => navigate({ to: "/portal" })}>Cancel</Button>
            <Button onClick={submit} disabled={loading} className="bg-gradient-cta text-primary-foreground">
              {loading ? "Saving…" : existing ? "Update Profile" : "Submit for Approval"}
            </Button>
          </div>
        </div>
      </Card>
    </PortalLayout>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="border-b border-border/60 pb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{children}</h3>;
}

function F({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

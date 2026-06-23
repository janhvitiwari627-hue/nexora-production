import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Building2, Mail, Phone, Plus, Tag, Target, Truck } from "lucide-react";
import { PortalLayout, PortalHeading, EmptyHint } from "./PortalLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { getMyBrand, getMyDistributor, getMyLeads, type Brand, type Distributor } from "./lib";
import { ConnectionsPanel } from "./ConnectionsPanel";

export function PortalDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [distributor, setDistributor] = useState<Distributor | null>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) { setLoading(false); return; }
    (async () => {
      const [b, d, l] = await Promise.all([getMyBrand(user.id), getMyDistributor(user.id), getMyLeads(user.id)]);
      setBrand(b); setDistributor(d); setLeads(l); setLoading(false);
    })();
  }, [user, isInitialized]);

  if (!isInitialized || loading) {
    return <PortalLayout><p className="text-sm text-muted-foreground">Loading dashboard…</p></PortalLayout>;
  }

  if (!user) {
    return (
      <PortalLayout>
        <PortalHeading eyebrow="Dashboard" title="Sign in to access the portal dashboard" />
        <EmptyHint
          icon={Target}
          title="Sign in required"
          body="Manage your brand or distributor profile, products and inquiries from one dashboard."
          action={<Button asChild className="bg-gradient-cta text-primary-foreground"><Link to="/login">Sign in</Link></Button>}
        />
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <PortalHeading
        eyebrow="Dashboard"
        title="Your portal at a glance"
        description="Manage your brand or distributor profile and review inquiries."
      />

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <div className="mb-3 flex items-center gap-2"><Tag className="h-5 w-5 text-primary" /><h3 className="font-bold text-heading">Brand profile</h3></div>
          {brand ? (
            <>
              <p className="font-semibold">{brand.name}</p>
              {brand.tagline && <p className="text-sm text-body">{brand.tagline}</p>}
              <div className="mt-3 flex gap-2 text-xs">
                {brand.is_sponsored && <Badge className="bg-primary text-primary-foreground">Sponsored</Badge>}
                {brand.is_featured && <Badge variant="secondary">Featured</Badge>}
              </div>
              <Button asChild className="mt-4" variant="outline" size="sm"><Link to="/portal/brands/register">Edit brand</Link></Button>
            </>
          ) : (
            <>
              <p className="text-sm text-body">You haven't registered a brand yet.</p>
              <Button asChild className="mt-4 bg-gradient-cta text-primary-foreground" size="sm"><Link to="/portal/brands/register"><Plus className="mr-1 h-4 w-4" />Register brand</Link></Button>
            </>
          )}
        </Card>

        <Card className="p-6">
          <div className="mb-3 flex items-center gap-2"><Truck className="h-5 w-5 text-primary" /><h3 className="font-bold text-heading">Distributor profile</h3></div>
          {distributor ? (
            <>
              <p className="font-semibold">{distributor.company_name}</p>
              {distributor.city && <p className="text-sm text-body">{[distributor.city, distributor.state].filter(Boolean).join(", ")}</p>}
              <Button asChild className="mt-4" variant="outline" size="sm"><Link to="/portal/distributors/register">Edit distributor</Link></Button>
            </>
          ) : (
            <>
              <p className="text-sm text-body">You haven't registered a distributor yet.</p>
              <Button asChild className="mt-4 bg-gradient-cta text-primary-foreground" size="sm"><Link to="/portal/distributors/register"><Plus className="mr-1 h-4 w-4" />Register distributor</Link></Button>
            </>
          )}
        </Card>
      </section>

      <section className="mt-10">
        <div className="mb-3 flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-heading">Lead inbox ({leads.length})</h3>
        </div>
        {leads.length === 0 ? (
          <EmptyHint icon={Building2} title="No leads yet" body="When salons inquire about your brand or distribution, they'll appear here." />
        ) : (
          <div className="overflow-hidden rounded-[var(--radius-card)] border border-border/60">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-2">From</th>
                  <th className="px-4 py-2">Contact</th>
                  <th className="px-4 py-2">Message</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} className="border-t border-border/60">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-heading">{l.name}</p>
                      <p className="text-xs text-muted-foreground">{l.city ?? "—"}</p>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {l.email && <p className="flex items-center gap-1"><Mail className="h-3 w-3" />{l.email}</p>}
                      {l.phone && <p className="flex items-center gap-1"><Phone className="h-3 w-3" />{l.phone}</p>}
                    </td>
                    <td className="px-4 py-3 max-w-md"><p className="line-clamp-2 text-body">{l.message}</p></td>
                    <td className="px-4 py-3"><Badge variant="secondary">{l.target_type}</Badge></td>
                    <td className="px-4 py-3"><Badge>{l.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </PortalLayout>
  );
}

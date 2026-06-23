import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, Star, MapPin, Globe, Plus } from "lucide-react";
import { PortalLayout, PortalHeading, EmptyHint } from "./PortalLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listBrands, type Brand } from "./lib";
import { LeadDialog } from "./LeadDialog";

export function BrandDirectoryPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => { listBrands().then(setBrands).finally(() => setLoading(false)); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return brands;
    return brands.filter((b) =>
      [b.name, b.tagline, b.description, b.category, b.hq_city, b.hq_state].some((x) => x?.toLowerCase().includes(s)),
    );
  }, [brands, q]);

  return (
    <PortalLayout>
      <PortalHeading
        eyebrow="Brand Directory"
        title="Beauty brands on Nexora"
        description="Discover brands, request samples and connect with HQ teams directly."
        action={<Button asChild className="bg-gradient-cta text-primary-foreground"><Link to="/portal/brands/register"><Plus className="mr-1 h-4 w-4" /> Register Brand</Link></Button>}
      />

      <div className="mb-6 flex items-center gap-2 rounded-[var(--radius-button)] border border-border/60 bg-card px-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search brands, categories or cities" className="border-0 bg-transparent focus-visible:ring-0" />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading brands…</p>
      ) : filtered.length === 0 ? (
        <EmptyHint
          title="No brands yet"
          body="Be the first to register your brand on the portal."
          action={<Button asChild><Link to="/portal/brands/register">Register your brand</Link></Button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b) => (
            <article key={b.id} className="overflow-hidden rounded-[var(--radius-card)] border border-border/60 bg-card transition hover:shadow-[var(--shadow-card)]">
              <div className="relative h-28 bg-gradient-mesh">
                {b.cover_url && <img src={b.cover_url} alt="" className="h-full w-full object-cover" />}
                {b.is_sponsored && (
                  <Badge className="absolute right-2 top-2 bg-primary text-primary-foreground"><Star className="mr-1 h-3 w-3" /> Sponsored</Badge>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-muted">
                    {b.logo_url ? <img src={b.logo_url} alt={b.name} className="h-full w-full object-cover" /> : <span className="text-base font-bold text-muted-foreground">{b.name[0]}</span>}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-heading">{b.name}</h3>
                    {b.tagline && <p className="line-clamp-1 text-xs text-body">{b.tagline}</p>}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  {b.category && <Badge variant="secondary">{b.category}</Badge>}
                  {(b.hq_city || b.hq_state) && (
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {[b.hq_city, b.hq_state].filter(Boolean).join(", ")}</span>
                  )}
                  {b.website && (
                    <a href={b.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary"><Globe className="h-3 w-3" /> Website</a>
                  )}
                </div>
                {b.description && <p className="mt-3 line-clamp-2 text-sm text-body">{b.description}</p>}
                <div className="mt-4 flex gap-2">
                  <LeadDialog trigger={<Button size="sm" className="bg-gradient-cta text-primary-foreground">Contact</Button>} target={{ type: "brand", id: b.id, name: b.name }} />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </PortalLayout>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, Star, MapPin, Plus, Phone, Mail } from "lucide-react";
import { PortalLayout, PortalHeading, EmptyHint } from "./PortalLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listDistributors, type Distributor } from "./lib";
import { LeadDialog } from "./LeadDialog";

export function DistributorDirectoryPage() {
  const [items, setItems] = useState<Distributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");

  useEffect(() => {
    listDistributors()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const allStates = useMemo(() => {
    const set = new Set<string>();
    items.forEach((d) => {
      if (d.state) set.add(d.state);
      (d.coverage_states ?? []).forEach((s) => s && set.add(s));
    });
    return Array.from(set).sort();
  }, [items]);

  const allDistricts = useMemo(() => {
    const set = new Set<string>();
    items.forEach((d) => {
      if (d.district) set.add(d.district);
      (d.coverage_districts ?? []).forEach((s) => s && set.add(s));
    });
    return Array.from(set).sort();
  }, [items]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return items.filter((d) => {
      if (stateFilter) {
        const states = [d.state, ...(d.coverage_states ?? [])].filter(Boolean) as string[];
        if (!states.some((x) => x.toLowerCase() === stateFilter.toLowerCase())) return false;
      }
      if (districtFilter) {
        const districts = [d.district, ...(d.coverage_districts ?? [])].filter(Boolean) as string[];
        if (!districts.some((x) => x.toLowerCase() === districtFilter.toLowerCase())) return false;
      }
      if (!s) return true;
      return [
        d.company_name,
        d.description,
        d.state,
        d.district,
        d.city,
        ...(d.brands_handled ?? []),
        ...(d.categories ?? []),
      ].some((x) =>
        String(x ?? "")
          .toLowerCase()
          .includes(s),
      );
    });
  }, [items, q, stateFilter, districtFilter]);

  return (
    <PortalLayout>
      <PortalHeading
        eyebrow="Distributor Directory"
        title="Distributors across India"
        description="Find distributors by region, category and the brands they carry."
        action={
          <Button asChild className="bg-gradient-cta text-primary-foreground">
            <Link to="/portal/distributors/register">
              <Plus className="mr-1 h-4 w-4" /> Register Distributor
            </Link>
          </Button>
        }
      />

      <div className="mb-4 grid gap-2 md:grid-cols-[1fr_auto_auto]">
        <div className="flex items-center gap-2 rounded-[var(--radius-button)] border border-border/60 bg-card px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search distributors, brands, states"
            className="border-0 bg-transparent focus-visible:ring-0"
          />
        </div>
        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="h-10 rounded-[var(--radius-button)] border border-border/60 bg-card px-3 text-sm"
        >
          <option value="">All states</option>
          {allStates.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
          className="h-10 rounded-[var(--radius-button)] border border-border/60 bg-card px-3 text-sm"
        >
          <option value="">All districts</option>
          {allDistricts.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading distributors…</p>
      ) : filtered.length === 0 ? (
        <EmptyHint
          title="No distributors yet"
          body="Be the first to register your distribution business."
          action={
            <Button asChild>
              <Link to="/portal/distributors/register">Register as Distributor</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d) => (
            <article
              key={d.id}
              className="rounded-[var(--radius-card)] border border-border/60 bg-card p-5 transition hover:shadow-[var(--shadow-card)]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-muted">
                    {d.logo_url ? (
                      <img src={d.logo_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="font-bold text-muted-foreground">{d.company_name[0]}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-heading">{d.company_name}</h3>
                    {d.contact_person && <p className="text-xs text-body">{d.contact_person}</p>}
                  </div>
                </div>
                {d.is_sponsored && (
                  <Badge className="bg-primary text-primary-foreground">
                    <Star className="mr-1 h-3 w-3" /> Featured
                  </Badge>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {(d.categories ?? []).slice(0, 3).map((c) => (
                  <Badge key={c} variant="secondary">
                    {c}
                  </Badge>
                ))}
              </div>

              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                {(d.city || d.state) && (
                  <p className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" />{" "}
                    {[d.city, d.district, d.state].filter(Boolean).join(", ")}
                  </p>
                )}
                {d.coverage_states && d.coverage_states.length > 0 && (
                  <p>States: {d.coverage_states.join(", ")}</p>
                )}
                {d.coverage_districts && d.coverage_districts.length > 0 && (
                  <p>Districts: {d.coverage_districts.slice(0, 8).join(", ")}</p>
                )}
                {d.brands_handled && d.brands_handled.length > 0 && (
                  <p>Brands: {d.brands_handled.slice(0, 5).join(", ")}</p>
                )}
              </div>

              {d.description && (
                <p className="mt-3 line-clamp-2 text-sm text-body">{d.description}</p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link to="/portal/distributors/$slug" params={{ slug: d.slug }}>
                    View Profile
                  </Link>
                </Button>
                <LeadDialog
                  trigger={
                    <Button size="sm" className="bg-gradient-cta text-primary-foreground">
                      Contact
                    </Button>
                  }
                  target={{ type: "distributor", id: d.id, name: d.company_name }}
                />
                {d.phone && (
                  <Button size="sm" variant="ghost" asChild>
                    <a href={`tel:${d.phone}`}>
                      <Phone className="mr-1 h-3 w-3" />
                      Call
                    </a>
                  </Button>
                )}
                {d.email && (
                  <Button size="sm" variant="ghost" asChild>
                    <a href={`mailto:${d.email}`}>
                      <Mail className="mr-1 h-3 w-3" />
                      Email
                    </a>
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </PortalLayout>
  );
}

import { useEffect, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Globe, Mail, Phone, FileText, Star, Award } from "lucide-react";
import { PortalLayout } from "./PortalLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDistributorBySlug, type Distributor } from "./lib";
import { LeadDialog } from "./LeadDialog";

export function DistributorProfilePage() {
  const { slug } = useParams({ from: "/portal/distributors/$slug" });
  const [d, setD] = useState<Distributor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDistributorBySlug(slug).then((x) => {
      setD(x);
      setLoading(false);
    });
  }, [slug]);

  if (loading)
    return (
      <PortalLayout>
        <p className="text-sm text-muted-foreground">Loading…</p>
      </PortalLayout>
    );
  if (!d)
    return (
      <PortalLayout>
        <div className="rounded-[var(--radius-card)] border border-border/60 bg-card p-10 text-center">
          <h2 className="text-xl font-bold text-heading">Distributor not found</h2>
          <Button asChild className="mt-4">
            <Link to="/portal/distributors">Back to directory</Link>
          </Button>
        </div>
      </PortalLayout>
    );

  return (
    <PortalLayout>
      <Link
        to="/portal/distributors"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-heading"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Distributor directory
      </Link>

      <div className="overflow-hidden rounded-[var(--radius-card-lg)] border border-border/60 bg-card">
        <div className="relative h-40 bg-gradient-mesh md:h-56">
          {d.cover_url && <img src={d.cover_url} alt="" className="h-full w-full object-cover" />}
          {d.is_sponsored && (
            <Badge className="absolute right-3 top-3 bg-primary text-primary-foreground">
              <Star className="mr-1 h-3 w-3" />
              Featured
            </Badge>
          )}
        </div>
        <div className="p-6 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-border/60 bg-muted">
                {d.logo_url ? (
                  <img
                    src={d.logo_url}
                    alt={d.company_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-black text-muted-foreground">
                    {d.company_name[0]}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-black text-heading md:text-3xl">{d.company_name}</h1>
                {d.contact_person && <p className="mt-1 text-body">{d.contact_person}</p>}
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {d.business_type && <Badge variant="secondary">{d.business_type}</Badge>}
                  {d.years_in_business != null && (
                    <span className="inline-flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      {d.years_in_business} yrs
                    </span>
                  )}
                  {(d.city || d.state) && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {[d.city, d.district, d.state].filter(Boolean).join(", ")}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <LeadDialog
              trigger={
                <Button className="bg-gradient-cta text-primary-foreground">Send Inquiry</Button>
              }
              target={{ type: "distributor", id: d.id, name: d.company_name }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {d.description && (
            <Card className="p-6">
              <h2 className="mb-2 text-lg font-bold text-heading">About</h2>
              <p className="whitespace-pre-line text-body">{d.description}</p>
            </Card>
          )}

          <Card className="p-6">
            <h2 className="mb-3 text-lg font-bold text-heading">Coverage</h2>
            <div className="space-y-3 text-sm">
              {(d.coverage_states?.length ?? 0) > 0 && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                    States
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {d.coverage_states!.map((s) => (
                      <Badge key={s} variant="secondary">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {(d.coverage_districts?.length ?? 0) > 0 && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                    Districts
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {d.coverage_districts!.map((s) => (
                      <Badge key={s} variant="outline">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {!d.coverage_states?.length && !d.coverage_districts?.length && (
                <p className="text-muted-foreground">No coverage details yet.</p>
              )}
            </div>
          </Card>

          {((d.categories?.length ?? 0) > 0 || (d.brands_handled?.length ?? 0) > 0) && (
            <Card className="p-6">
              <h2 className="mb-3 text-lg font-bold text-heading">Product portfolio</h2>
              {(d.categories?.length ?? 0) > 0 && (
                <div className="mb-3">
                  <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                    Categories
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {d.categories!.map((c) => (
                      <Badge key={c} variant="secondary">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {(d.brands_handled?.length ?? 0) > 0 && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                    Brands Represented
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {d.brands_handled!.map((b) => (
                      <Badge key={b}>{b}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          {(d.gallery_urls?.length ?? 0) > 0 && (
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-bold text-heading">Business Gallery</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {d.gallery_urls!.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="block aspect-square overflow-hidden rounded-lg border border-border/60 bg-muted"
                  >
                    <img
                      src={url}
                      alt=""
                      className="h-full w-full object-cover transition hover:scale-105"
                    />
                  </a>
                ))}
              </div>
            </Card>
          )}

          {(d.document_urls?.length ?? 0) > 0 && (
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-bold text-heading">Verified Documents</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {d.document_urls!.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-border/60 p-3 text-sm hover:bg-muted"
                  >
                    <FileText className="h-4 w-4 text-primary" /> Document {i + 1}
                  </a>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-3 font-bold text-heading">Contact</h3>
            <div className="space-y-2 text-sm">
              {d.owner_name && (
                <p className="text-muted-foreground">
                  <span className="text-heading">Owner:</span> {d.owner_name}
                </p>
              )}
              {d.phone && (
                <a
                  href={`tel:${d.phone}`}
                  className="flex items-center gap-2 text-body hover:text-primary"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {d.phone}
                </a>
              )}
              {d.email && (
                <a
                  href={`mailto:${d.email}`}
                  className="flex items-center gap-2 text-body hover:text-primary"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {d.email}
                </a>
              )}
              {d.website && (
                <a
                  href={d.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-body hover:text-primary"
                >
                  <Globe className="h-3.5 w-3.5" />
                  Website
                </a>
              )}
              {d.address && (
                <p className="flex items-start gap-2 text-body">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {[d.address, d.city, d.district, d.state, d.pincode].filter(Boolean).join(", ")}
                </p>
              )}
              {d.gst_number && (
                <p className="text-muted-foreground">
                  <span className="text-heading">GST:</span> {d.gst_number}
                </p>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-2 font-bold text-heading">Send an inquiry</h3>
            <p className="mb-3 text-sm text-body">
              Looking to source products? Share your requirements directly.
            </p>
            <LeadDialog
              trigger={
                <Button className="w-full bg-gradient-cta text-primary-foreground">
                  Send Inquiry
                </Button>
              }
              target={{ type: "distributor", id: d.id, name: d.company_name }}
            />
          </Card>
        </div>
      </div>
    </PortalLayout>
  );
}

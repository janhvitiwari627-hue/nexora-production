import { useEffect, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  MapPin,
  Globe,
  Mail,
  Phone,
  Instagram,
  Facebook,
  Youtube,
  FileText,
  Star,
} from "lucide-react";
import { PortalLayout } from "./PortalLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getBrandBySlug, listProductsByBrand, type Brand, type BrandProduct } from "./lib";
import { LeadDialog } from "./LeadDialog";

export function BrandProfilePage() {
  const { slug } = useParams({ from: "/portal/brands/$slug" });
  const [brand, setBrand] = useState<Brand | null>(null);
  const [products, setProducts] = useState<BrandProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const b = await getBrandBySlug(slug);
      setBrand(b);
      if (b) setProducts(await listProductsByBrand(b.id));
      setLoading(false);
    })();
  }, [slug]);

  if (loading)
    return (
      <PortalLayout>
        <p className="text-sm text-muted-foreground">Loading…</p>
      </PortalLayout>
    );
  if (!brand)
    return (
      <PortalLayout>
        <div className="rounded-[var(--radius-card)] border border-border/60 bg-card p-10 text-center">
          <h2 className="text-xl font-bold text-heading">Brand not found</h2>
          <Button asChild className="mt-4">
            <Link to="/portal/brands">Back to directory</Link>
          </Button>
        </div>
      </PortalLayout>
    );

  return (
    <PortalLayout>
      <Link
        to="/portal/brands"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-heading"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Brand directory
      </Link>

      <div className="overflow-hidden rounded-[var(--radius-card-lg)] border border-border/60 bg-card">
        <div className="relative h-40 bg-gradient-mesh md:h-56">
          {brand.cover_url && (
            <img src={brand.cover_url} alt="" className="h-full w-full object-cover" />
          )}
          {brand.is_sponsored && (
            <Badge className="absolute right-3 top-3 bg-primary text-primary-foreground">
              <Star className="mr-1 h-3 w-3" />
              Sponsored
            </Badge>
          )}
        </div>
        <div className="p-6 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-border/60 bg-muted">
                {brand.logo_url ? (
                  <img
                    src={brand.logo_url}
                    alt={brand.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-black text-muted-foreground">{brand.name[0]}</span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-black text-heading md:text-3xl">{brand.name}</h1>
                {brand.tagline && <p className="mt-1 text-body">{brand.tagline}</p>}
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {brand.category && <Badge variant="secondary">{brand.category}</Badge>}
                  {brand.business_type && <Badge variant="outline">{brand.business_type}</Badge>}
                  {(brand.hq_city || brand.hq_state) && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {[brand.hq_city, brand.hq_state].filter(Boolean).join(", ")}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <LeadDialog
              trigger={
                <Button className="bg-gradient-cta text-primary-foreground">Send Inquiry</Button>
              }
              target={{ type: "brand", id: brand.id, name: brand.name }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {brand.description && (
            <Card className="p-6">
              <h2 className="mb-2 text-lg font-bold text-heading">About the brand</h2>
              <p className="whitespace-pre-line text-body">{brand.description}</p>
            </Card>
          )}

          {products.length > 0 && (
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-bold text-heading">Products</h2>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="overflow-hidden rounded-[var(--radius-card)] border border-border/60"
                  >
                    <div className="aspect-square bg-muted">
                      {p.image_url && (
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="p-3">
                      <p className="line-clamp-1 text-sm font-semibold text-heading">{p.name}</p>
                      {p.category && <p className="text-xs text-muted-foreground">{p.category}</p>}
                      {p.mrp != null && (
                        <p className="mt-1 text-sm font-bold text-primary">₹{p.mrp}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {(brand.gallery_urls?.length ?? 0) > 0 && (
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-bold text-heading">Gallery</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {brand.gallery_urls!.map((url, i) => (
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

          {(brand.document_urls?.length ?? 0) > 0 && (
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-bold text-heading">Catalogs & Documents</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {brand.document_urls!.map((url, i) => (
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
              {brand.company_name && (
                <p className="text-muted-foreground">
                  <span className="text-heading">Company:</span> {brand.company_name}
                </p>
              )}
              {brand.owner_name && (
                <p className="text-muted-foreground">
                  <span className="text-heading">Owner:</span> {brand.owner_name}
                </p>
              )}
              {brand.phone && (
                <a
                  href={`tel:${brand.phone}`}
                  className="flex items-center gap-2 text-body hover:text-primary"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {brand.phone}
                </a>
              )}
              {brand.email && (
                <a
                  href={`mailto:${brand.email}`}
                  className="flex items-center gap-2 text-body hover:text-primary"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {brand.email}
                </a>
              )}
              {brand.website && (
                <a
                  href={brand.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-body hover:text-primary"
                >
                  <Globe className="h-3.5 w-3.5" />
                  Website
                </a>
              )}
              {brand.address && (
                <p className="flex items-start gap-2 text-body">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {[brand.address, brand.hq_city, brand.hq_state, brand.pincode]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
            </div>
            {(brand.social_instagram || brand.social_facebook || brand.social_youtube) && (
              <div className="mt-4 flex gap-2">
                {brand.social_instagram && (
                  <a
                    href={brand.social_instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="grid h-9 w-9 place-items-center rounded-full bg-muted text-body hover:bg-primary hover:text-primary-foreground"
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                )}
                {brand.social_facebook && (
                  <a
                    href={brand.social_facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="grid h-9 w-9 place-items-center rounded-full bg-muted text-body hover:bg-primary hover:text-primary-foreground"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                )}
                {brand.social_youtube && (
                  <a
                    href={brand.social_youtube}
                    target="_blank"
                    rel="noreferrer"
                    className="grid h-9 w-9 place-items-center rounded-full bg-muted text-body hover:bg-primary hover:text-primary-foreground"
                  >
                    <Youtube className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="mb-2 font-bold text-heading">Looking for distributors?</h3>
            <p className="mb-3 text-sm text-body">
              Send a partnership inquiry — the brand will respond directly.
            </p>
            <LeadDialog
              trigger={
                <Button className="w-full bg-gradient-cta text-primary-foreground">
                  Become a Distributor
                </Button>
              }
              target={{ type: "brand", id: brand.id, name: brand.name }}
            />
          </Card>
        </div>
      </div>
    </PortalLayout>
  );
}

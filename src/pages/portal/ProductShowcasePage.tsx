import { useEffect, useMemo, useState } from "react";
import { Search, Star } from "lucide-react";
import { PortalLayout, PortalHeading, EmptyHint } from "./PortalLayout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { listProducts, type BrandProduct } from "./lib";

export function ProductShowcasePage() {
  const [items, setItems] = useState<BrandProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    listProducts()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((p) =>
      [p.name, p.description, p.category].some((x) => x?.toLowerCase().includes(s)),
    );
  }, [items, q]);

  return (
    <PortalLayout>
      <PortalHeading
        eyebrow="Product Showcase"
        title="Featured products from beauty brands"
        description="Curated catalog from registered brands. Click a product to inquire with the brand."
      />

      <div className="mb-6 flex items-center gap-2 rounded-[var(--radius-button)] border border-border/60 bg-card px-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products"
          className="border-0 bg-transparent focus-visible:ring-0"
        />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading products…</p>
      ) : filtered.length === 0 ? (
        <EmptyHint
          title="No products yet"
          body="Brands haven't added products. Register a brand and start uploading your catalog."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => (
            <article
              key={p.id}
              className="overflow-hidden rounded-[var(--radius-card)] border border-border/60 bg-card transition hover:shadow-[var(--shadow-card)]"
            >
              <div className="relative aspect-square bg-muted">
                {p.image_url && (
                  <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                )}
                {p.is_featured && (
                  <Badge className="absolute right-2 top-2 bg-primary text-primary-foreground">
                    <Star className="mr-1 h-3 w-3" /> Featured
                  </Badge>
                )}
              </div>
              <div className="p-3">
                <h3 className="truncate font-semibold text-heading">{p.name}</h3>
                {p.category && <p className="text-xs text-muted-foreground">{p.category}</p>}
                {p.price != null && (
                  <p className="mt-1 font-bold text-primary">
                    ₹{p.price}
                    {p.mrp && p.mrp > p.price && (
                      <span className="ml-2 text-xs font-normal text-muted-foreground line-through">
                        ₹{p.mrp}
                      </span>
                    )}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </PortalLayout>
  );
}

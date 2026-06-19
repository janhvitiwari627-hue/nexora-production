import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { z } from "zod";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { ShopCard } from "@/components/cards/ShopCard";
import { shopsQueryOptions } from "@/lib/shops.queries";

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
});

export const Route = createFileRoute("/search")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(shopsQueryOptions(deps)),
  head: () => ({
    meta: [
      { title: "Search salons & spas — Nexora" },
      { name: "description", content: "Find and book the best salons, spas, and barbers near you." },
    ],
  }),
  component: SearchPage,
});

const FILTERS = ["All", "Hair Salon", "Spa", "Nail Studio", "Barber Shop", "Beauty Salon", "Unisex Salon"];

function SearchPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState(search.q ?? "");
  const { data: shops } = useSuspenseQuery(shopsQueryOptions(search));

  const activeCat = search.category ?? "All";

  return (
    <div className="bg-background min-h-screen">
      <PublicHeader />

      <div className="mx-auto max-w-7xl px-4 pt-8 pb-6 md:px-6">
        <h1 className="text-heading text-3xl font-black tracking-tight md:text-4xl">
          Salons in Jaipur
        </h1>
        <p className="text-muted-foreground mt-1">
          {shops.length} {shops.length === 1 ? "result" : "results"}
          {search.q ? ` for “${search.q}”` : ""}
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ search: (s: { q?: string; category?: string }) => ({ ...s, q: q || undefined }) });
          }}
          className="bg-card border-border mt-6 flex items-center gap-2 rounded-[var(--radius-card)] border p-2 shadow-[var(--shadow-card)]"
        >
          <Search className="text-muted-foreground ml-2 h-5 w-5" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search salons, services, areas…"
            className="flex-1 bg-transparent px-1 py-2 text-sm font-medium text-heading outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            className="bg-gradient-cta text-primary-foreground rounded-[var(--radius-button)] px-5 py-2 text-sm font-semibold shadow-[var(--shadow-glow)]"
          >
            Search
          </button>
        </form>

        <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-2">
          <button className="text-muted-foreground border-border hover:text-primary hover:border-primary inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
          </button>
          {FILTERS.map((f) => {
            const active = activeCat === f;
            return (
              <Link
                key={f}
                to="/search"
                search={(s: { q?: string; category?: string }) => ({ ...s, category: f === "All" ? undefined : f })}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-gradient-cta text-primary-foreground shadow-[var(--shadow-glow)]"
                    : "bg-card border-border text-muted-foreground border hover:text-primary"
                }`}
              >
                {f}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-12 md:px-6">
        {shops.length === 0 ? (
          <div className="bg-card border-border rounded-[var(--radius-card)] border p-12 text-center">
            <p className="text-heading font-semibold">No salons match your search.</p>
            <p className="text-muted-foreground mt-1 text-sm">Try a different keyword or category.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shops.map((s) => (
              <ShopCard key={s.slug} shop={s} />
            ))}
          </div>
        )}
      </div>

      <PublicFooter />
    </div>
  );
}

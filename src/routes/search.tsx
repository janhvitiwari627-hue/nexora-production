import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { SearchResultsPage } from "@/pages/public/SearchResultsPage";
import { shopsQueryOptions } from "@/lib/shops.queries";

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  // Filter state — all optional so default URLs stay clean
  mr: z.coerce.number().int().min(1).max(5).optional(),
  md: z.coerce.number().min(0).max(100).optional(),
  pmin: z.coerce.number().min(0).max(100000).optional(),
  pmax: z.coerce.number().min(0).max(100000).optional(),
  cats: z.string().optional(),
  g: z.enum(["all", "male", "female", "unisex"]).optional(),
  on: z.coerce.number().pipe(z.literal(1)).optional(),
  vo: z.coerce.number().pipe(z.literal(1)).optional(),
  tr: z.coerce.number().pipe(z.literal(1)).optional(),
  mp: z.coerce.number().pipe(z.literal(1)).optional(),
  oo: z.coerce.number().pipe(z.literal(1)).optional(),
  hs: z.coerce.number().pipe(z.literal(1)).optional(),
  sort: z
    .enum(["relevance", "rating", "distance", "price_low", "price_high", "popular"])
    .optional(),
  view: z.enum(["grid", "map"]).optional(),
});

export const Route = createFileRoute("/search")({
  validateSearch: searchSchema,
  // Only q/category affect the underlying data query; remaining params are client-side filters.
  loaderDeps: ({ search }) => ({ q: search.q, category: search.category }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(shopsQueryOptions(deps)),
  head: () => ({
    meta: [
      { title: "Search salons & spas — Nexora" },
      {
        name: "description",
        content: "Find and book the best salons, spas, and barbers near you.",
      },
    ],
  }),
  component: SearchRoute,
});

function SearchRoute() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <SearchResultsPage
      search={search}
      onSearchChange={(next) => navigate({ search: next, replace: true })}
    />
  );
}

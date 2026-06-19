import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { SearchResultsPage } from "@/pages/public/SearchResultsPage";
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
      onSearchChange={(next) => navigate({ search: next })}
    />
  );
}

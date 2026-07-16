import { createFileRoute } from "@tanstack/react-router";
import { CustomerAppSearch } from "@/pages/customer/app/CustomerAppSearch";

export const Route = createFileRoute("/app/customer/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : "",
    category: typeof search.category === "string" ? search.category : "All",
  }),
  component: SearchPage,
});

function SearchPage() {
  const search = Route.useSearch();
  return <CustomerAppSearch initialQuery={search.q} initialCategory={search.category} />;
}

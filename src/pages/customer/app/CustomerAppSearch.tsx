import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LoaderCircle, Search } from "lucide-react";
import { listCustomerAppSalons } from "@/lib/customer-app";
import { useAuthStore } from "@/stores/authStore";
import { CustomerSalonCard } from "./CustomerSalonCard";

const CATEGORIES = ["All", "Salon", "Beauty Parlour", "Spa", "Barber Shop", "Nail Art Studio"];

export function CustomerAppSearch({
  initialQuery,
  initialCategory,
}: {
  initialQuery: string;
  initialCategory: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const gender = useAuthStore((state) =>
    state.profile?.gender === "male" || state.profile?.gender === "female"
      ? state.profile.gender
      : null,
  );
  const shops = useQuery({
    queryKey: ["customer-app", "salons", query, category, gender],
    queryFn: () =>
      listCustomerAppSalons({
        q: query || undefined,
        category: category && category !== "All" ? category : undefined,
        gender,
        limit: 50,
      }),
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
      <h1 className="text-3xl font-black">Search salons</h1>
      <label className="relative mt-5 block">
        <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Salon, spa, service or area"
          className="h-13 w-full rounded-2xl border bg-white pr-4 pl-12 text-sm outline-none focus:border-violet-500"
        />
      </label>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${
              category === item || (!category && item === "All")
                ? "bg-violet-700 text-white"
                : "border bg-white"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {shops.isLoading ? (
        <div className="grid min-h-64 place-items-center">
          <LoaderCircle className="h-6 w-6 animate-spin text-violet-700" />
        </div>
      ) : shops.data?.length ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shops.data.map((shop) => (
            <CustomerSalonCard key={shop.slug} shop={shop} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border bg-white p-8 text-center">
          <p className="font-bold">No salons found</p>
          <p className="mt-1 text-sm text-slate-500">Try another category or search term.</p>
        </div>
      )}
    </main>
  );
}

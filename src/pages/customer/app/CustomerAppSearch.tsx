import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LoaderCircle, Search } from "lucide-react";
import { useCustomerLocation } from "@/hooks/useCustomerLocation";
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
  const [radiusKm, setRadiusKm] = useState(10);
  const { location } = useCustomerLocation();
  const gender = useAuthStore((state) =>
    state.profile?.gender === "male" || state.profile?.gender === "female"
      ? state.profile.gender
      : null,
  );
  const shops = useQuery({
    queryKey: [
      "customer-app",
      "salons",
      query,
      category,
      gender,
      location?.latitude,
      location?.longitude,
      radiusKm,
    ],
    queryFn: () =>
      listCustomerAppSalons({
        q: query || undefined,
        category: category && category !== "All" ? category : undefined,
        gender,
        limit: 50,
        location: location
          ? { latitude: location.latitude, longitude: location.longitude, radiusKm }
          : null,
      }),
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
      <div>
        <h1 className="text-3xl font-black">Search salons</h1>
        <p className="mt-1 text-sm text-[#7a746a]">
          {location ? "Nearest salons first" : "Set your location from the header."}
        </p>
      </div>
      <label className="relative mt-5 block">
        <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[#8c857a]" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Salon, spa, service or area"
          className="h-13 w-full rounded-2xl border border-[#e8e0d2] bg-white pr-4 pl-12 text-sm outline-none focus:border-[#d7a93b] focus:ring-2 focus:ring-[#d7a93b]/20"
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
                ? "bg-[#0b0a08] text-[#f3cf70]"
                : "border border-[#e8e0d2] bg-white"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {location ? (
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-2">
          <span className="shrink-0 text-xs font-bold uppercase tracking-[0.12em] text-[#8a6116]">
            Distance
          </span>
          {[3, 5, 10, 15, 20, 25, 30].map((radius) => (
            <button
              key={radius}
              type="button"
              onClick={() => setRadiusKm(radius)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${
                radiusKm === radius
                  ? "bg-[#d7a93b] text-[#0b0a08]"
                  : "border border-[#e8e0d2] bg-white text-[#6f685e]"
              }`}
            >
              Within {radius} km
            </button>
          ))}
        </div>
      ) : null}

      {shops.isLoading ? (
        <div className="grid min-h-64 place-items-center">
          <LoaderCircle className="h-6 w-6 animate-spin text-[#9a6b16]" />
        </div>
      ) : shops.data?.length ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shops.data.map((shop) => (
            <CustomerSalonCard key={shop.slug} shop={shop} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-[#e8e0d2] bg-white p-8 text-center">
          <p className="font-bold">No salons found</p>
          <p className="mt-1 text-sm text-[#7a746a]">
            {location
              ? radiusKm < 30
                ? "Try a wider distance or another category."
                : "Try another category or search term."
              : "Set your location from the header, or try another category."}
          </p>
        </div>
      )}
    </main>
  );
}

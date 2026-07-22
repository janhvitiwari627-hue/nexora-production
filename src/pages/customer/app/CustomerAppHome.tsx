import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight, LoaderCircle, MapPin, RefreshCw, Search, Store } from "lucide-react";
import { useCustomerLocation } from "@/hooks/useCustomerLocation";
import { listCustomerAppSalons } from "@/lib/customer-app";
import { useAuthStore } from "@/stores/authStore";
import { CustomerLocationDialog } from "./CustomerLocationDialog";
import { CustomerSalonCard } from "./CustomerSalonCard";

const CATEGORIES = [
  "Salon",
  "Beauty Parlour",
  "Spa",
  "Barber Shop",
  "Nail Art Studio",
  "Makeup Artist",
];

export function CustomerAppHome() {
  const [locationOpen, setLocationOpen] = useState(false);
  const { location, save: saveLocation } = useCustomerLocation();
  const gender = useAuthStore((state) =>
    state.profile?.gender === "male" || state.profile?.gender === "female"
      ? state.profile.gender
      : null,
  );
  const shops = useQuery({
    queryKey: ["customer-app", "salons", "home", gender, location?.latitude, location?.longitude],
    queryFn: () =>
      listCustomerAppSalons({
        gender,
        limit: 6,
        location: location
          ? { latitude: location.latitude, longitude: location.longitude, radiusKm: 50 }
          : null,
      }),
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
      <section className="relative overflow-hidden rounded-3xl border border-[#d7a93b]/35 bg-[linear-gradient(135deg,#0b0a08_0%,#241b0d_58%,#9a6b16_100%)] p-6 text-white shadow-[0_22px_60px_rgba(53,38,11,0.24)] sm:p-10">
        <div className="pointer-events-none absolute -right-14 -top-16 h-48 w-48 rounded-full border border-[#f1cf73]/25" />
        <p className="relative text-sm font-bold text-[#f1cf73]">Beauty services near you</p>
        <h1 className="mt-2 max-w-2xl text-3xl font-black tracking-tight !text-white sm:text-5xl">
          Apna salon, service aur time choose karein.
        </h1>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/app/customer/search"
            className="flex min-h-12 flex-1 items-center gap-3 rounded-2xl bg-white px-4 text-left text-sm font-medium text-slate-500"
          >
            <Search className="h-5 w-5" /> Search salon or service
          </Link>
          <button
            type="button"
            onClick={() => setLocationOpen(true)}
            className="inline-flex min-h-12 max-w-full items-center justify-center gap-2 rounded-2xl bg-white/15 px-5 text-sm font-bold backdrop-blur sm:max-w-72"
          >
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{location?.label ?? "Set my location"}</span>
          </button>
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black">Categories</h2>
          <Link to="/app/customer/search" className="text-sm font-bold text-[#9a6b16]">
            View all
          </Link>
        </div>
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {CATEGORIES.map((category) => (
            <Link
              key={category}
              to="/app/customer/search"
              search={{ q: "", category }}
              className="shrink-0 rounded-full border border-[#e8e0d2] bg-white px-4 py-2.5 text-sm font-bold shadow-sm"
            >
              {category}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-[#9a6b16]">
              {gender ? `Recommended for ${gender === "male" ? "men" : "women"}` : "Nearby salons"}
            </p>
            <h2 className="mt-1 text-2xl font-black">Popular around you</h2>
          </div>
          <Link
            to="/app/customer/search"
            className="inline-flex items-center gap-1 text-sm font-bold"
          >
            All salons <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {shops.isLoading ? (
          <div className="grid min-h-48 place-items-center">
            <LoaderCircle className="h-6 w-6 animate-spin text-[#9a6b16]" />
          </div>
        ) : shops.isError ? (
          <div className="mt-6 flex flex-col items-center rounded-3xl border border-[#ead49b] bg-white p-8 text-center shadow-sm">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#fff0c2] text-[#9a6b16]">
              <Store className="h-6 w-6" />
            </span>
            <p className="mt-4 font-black">We couldn't refresh salons right now</p>
            <p className="mt-1 max-w-md text-sm text-[#7a746a]">
              Your app is connected. Please retry to load the latest published salons.
            </p>
            <button
              type="button"
              onClick={() => shops.refetch()}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#0b0a08] px-5 py-2.5 text-sm font-bold text-[#f3cf70]"
            >
              <RefreshCw className="h-4 w-4" /> Retry
            </button>
          </div>
        ) : shops.data?.length ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shops.data?.map((shop) => (
              <CustomerSalonCard key={shop.slug} shop={shop} />
            ))}
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center rounded-3xl border border-[#ead49b] bg-white p-8 text-center shadow-sm">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#fff0c2] text-[#9a6b16]">
              <Store className="h-6 w-6" />
            </span>
            <p className="mt-4 font-black">
              {location
                ? `No published salons within 50 km of ${location.label}`
                : "Set your location to find nearby salons"}
            </p>
            <p className="mt-1 max-w-md text-sm text-[#7a746a]">
              {location
                ? "New verified salons will appear here automatically when they publish their map location."
                : "Confirm your map pin and we will sort every published salon by distance."}
            </p>
            {location ? (
              <Link
                to="/app/customer/search"
                className="mt-4 rounded-full bg-[#0b0a08] px-5 py-2.5 text-sm font-bold text-[#f3cf70]"
              >
                Explore categories
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setLocationOpen(true)}
                className="mt-4 rounded-full bg-[#0b0a08] px-5 py-2.5 text-sm font-bold text-[#f3cf70]"
              >
                Choose location
              </button>
            )}
          </div>
        )}
      </section>

      <CustomerLocationDialog
        open={locationOpen}
        onOpenChange={setLocationOpen}
        initialLocation={location}
        onSave={saveLocation}
      />
    </main>
  );
}

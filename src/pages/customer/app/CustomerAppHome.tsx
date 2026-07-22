import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight, LoaderCircle, MapPin, Search } from "lucide-react";
import { toast } from "sonner";
import { listCustomerAppSalons } from "@/lib/customer-app";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";
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
  const [locating, setLocating] = useState(false);
  const gender = useAuthStore((state) =>
    state.profile?.gender === "male" || state.profile?.gender === "female"
      ? state.profile.gender
      : null,
  );
  const shops = useQuery({
    queryKey: ["customer-app", "salons", "home", gender],
    queryFn: () => listCustomerAppSalons({ gender, limit: 6 }),
  });

  const requestLocation = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Location is not supported on this device.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const { data } = await supabase.auth.getUser();
          if (data.user) {
            const { error } = await supabase
              .from("profiles")
              .update({
                latitude: coords.latitude,
                longitude: coords.longitude,
                location_captured_at: new Date().toISOString(),
              })
              .eq("id", data.user.id);
            if (error) throw error;
          }
          toast.success("Location enabled for nearby salons.");
        } catch {
          toast.error("Location was received but could not be saved.");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        toast.error("Location permission was not granted.");
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
    );
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
      <section className="relative overflow-hidden rounded-3xl border border-[#d7a93b]/35 bg-[linear-gradient(135deg,#0b0a08_0%,#241b0d_58%,#9a6b16_100%)] p-6 text-white shadow-[0_22px_60px_rgba(53,38,11,0.24)] sm:p-10">
        <div className="pointer-events-none absolute -right-14 -top-16 h-48 w-48 rounded-full border border-[#f1cf73]/25" />
        <p className="relative text-sm font-bold text-[#f1cf73]">Beauty services near you</p>
        <h1 className="mt-2 max-w-2xl text-3xl font-black tracking-tight sm:text-5xl">
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
            onClick={requestLocation}
            disabled={locating}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white/15 px-5 text-sm font-bold backdrop-blur"
          >
            {locating ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
            {locating ? "Finding you…" : "Use my location"}
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
          <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            Salons could not be loaded. Please try again.
          </p>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shops.data?.map((shop) => (
              <CustomerSalonCard key={shop.slug} shop={shop} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

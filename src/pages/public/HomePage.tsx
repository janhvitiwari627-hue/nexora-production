import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  MapPin,
  Sparkles,
  ShieldCheck,
  Star,
  ArrowRight,
  ArrowUpRight,
  Scissors,
  Flower2,
  Brush,
  HeartPulse,
  Palette,
  Crown,
  Hand,
  PaintBucket,
  Clock,
  IndianRupee,
  CheckCircle2,
  ChevronRight,
  Home as HomeIcon,
  Compass,
  CalendarCheck,
  User2,
  TrendingUp,
  Layers,
} from "lucide-react";
import Footer from "@/components/nexora-design/sections/Footer";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { shopsQueryOptions } from "@/lib/shops.queries";
import { getCategoryCounts, getMockBusinesses, type MockBusiness } from "@/lib/mock-businesses";
import { useAuthStore } from "@/stores/authStore";
import { DiscoveryHome } from "./sections/DiscoveryHome";

/* =========================================================
 * NEXORA SALONOS — PREMIUM HOMEPAGE (Stripe × Apple × Airbnb)
 * Light SaaS theme. All inline sections.
 * =======================================================*/

const PRIMARY = "#2563EB";
const SECONDARY = "#6D28D9";

const AREAS = [
  "Mansarovar",
  "Vaishali Nagar",
  "Malviya Nagar",
  "Jagatpura",
  "Raja Park",
  "C-Scheme",
  "Vidyadhar Nagar",
  "Tonk Road",
  "Sanganer",
  "Sodala",
  "Jhotwara",
  "Sitapura",
  "Murlipura",
];

const QUICK_FILTERS = [
  "Near Me",
  "Open Now",
  "Top Rated",
  "Price Low to High",
  "Male",
  "Female",
  "Unisex",
];

const CATEGORIES = [
  {
    name: "Salon",
    desc: "Haircuts, styling & color experts",
    Icon: Scissors,
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    name: "Beauty Parlour",
    desc: "Facials, threading & care",
    Icon: Flower2,
    gradient: "from-pink-500 to-rose-600",
  },
  {
    name: "Spa",
    desc: "Relax, recharge, rejuvenate",
    Icon: HeartPulse,
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    name: "Tattoo Studio",
    desc: "Verified artists & hygiene",
    Icon: Brush,
    gradient: "from-slate-700 to-slate-900",
  },
  {
    name: "Massage Center",
    desc: "Therapeutic & wellness",
    Icon: Hand,
    gradient: "from-amber-500 to-orange-600",
  },
  {
    name: "Nail Art Studio",
    desc: "Premium nails & extensions",
    Icon: PaintBucket,
    gradient: "from-fuchsia-500 to-purple-600",
  },
  {
    name: "Makeup Artist",
    desc: "Pro looks for every occasion",
    Icon: Palette,
    gradient: "from-violet-500 to-indigo-600",
  },
  {
    name: "Bridal Services",
    desc: "Luxury bridal packages",
    Icon: Crown,
    gradient: "from-yellow-500 to-amber-600",
  },
  {
    name: "Barber Shop",
    desc: "Sharp cuts & beard care for men",
    Icon: Scissors,
    gradient: "from-zinc-600 to-stone-800",
  },
];

const CATEGORY_IMAGES: Record<string, string> = {
  "Salon": "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&q=80",
  "Beauty Parlour": "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80",
  "Spa": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80",
  "Tattoo Studio": "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=600&q=80",
  "Massage Center": "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=600&q=80",
  "Nail Art Studio": "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80",
  "Makeup Artist": "https://images.unsplash.com/photo-1457972729786-0411a3b2b626?w=600&q=80",
  "Bridal Services": "https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=600&q=80",
  "Barber Shop": "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80",
};

/* ============= HERO ============= */
function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Gradient mesh */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full bg-gradient-to-br from-blue-200/60 to-indigo-200/40 blur-3xl" />
        <div className="absolute -top-20 right-0 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-violet-200/60 to-fuchsia-200/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[360px] w-[360px] rounded-full bg-gradient-to-br from-cyan-200/40 to-blue-100/40 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-14 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pb-28 lg:pt-24">
        {/* Left */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            India's Beauty Industry Operating System
          </span>

          <h1 className="mt-6 font-bold tracking-tight text-slate-900 text-[34px] leading-[1.05] sm:text-[44px] lg:text-[64px]">
            Book Jaipur's{" "}
            <span className="bg-gradient-to-r from-[#2563EB] via-[#4F46E5] to-[#6D28D9] bg-clip-text text-transparent">
              Trusted Beauty
            </span>{" "}
            Services in 60 Seconds
          </h1>

          <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-slate-600 sm:text-[18px]">
            Search verified salons, beauty parlours, spas, tattoo studios, massage centers and nail
            art studios near you.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/search"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-slate-900 px-6 text-sm font-semibold text-white shadow-lg shadow-slate-300 transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Explore Salons <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/owner/create-website"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300"
            >
              Create Shop Website
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
            {[
              { label: "Verified Shops", Icon: ShieldCheck },
              { label: "Real Prices", Icon: IndianRupee },
              { label: "Staff Selection", Icon: User2 },
              { label: "Fast Booking", Icon: Clock },
            ].map(({ label, Icon }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-slate-600">
                <Icon className="h-4 w-4 text-emerald-600" />
                <span className="font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right composition */}
        <HeroVisual />
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto h-[520px] w-full max-w-[560px] lg:h-[600px]">
      {/* Soft Jaipur arch silhouette */}
      <svg
        aria-hidden
        viewBox="0 0 400 220"
        className="absolute -bottom-6 left-1/2 -z-10 w-[110%] -translate-x-1/2 opacity-[0.07]"
      >
        <path
          d="M0 220 V120 Q40 80 80 120 Q120 60 160 120 Q200 50 240 120 Q280 60 320 120 Q360 80 400 120 V220 Z"
          fill="#0F172A"
        />
      </svg>

      {/* Big shop card */}
      <div className="absolute left-0 top-0 w-[78%] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_80px_-20px_rgba(15,23,42,0.25)]">
        <div className="relative h-[200px] overflow-hidden">
          <img
            alt=""
            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80"
            className="h-full w-full object-cover"
          />
          <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-emerald-700 shadow">
            <ShieldCheck className="h-3 w-3" /> Verified
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[15px] font-bold text-slate-900">Glow Studio</p>
              <p className="text-xs text-slate-500">Unisex Salon · C-Scheme, Jaipur</p>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> 4.8
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              From <span className="font-bold text-slate-900">₹499</span>
            </p>
            <span className="rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white">
              View
            </span>
          </div>
        </div>
      </div>

      {/* Booking confirmation card */}
      <div className="absolute right-0 top-[110px] w-[56%] rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_20px_50px_-15px_rgba(37,99,235,0.30)]">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-slate-900">Booking confirmed</p>
            <p className="text-[11px] text-slate-500">Tomorrow · 11:30 AM</p>
          </div>
        </div>
        <div className="mt-3 rounded-xl bg-slate-50 p-2.5 text-[11px] text-slate-600">
          Haircut + Beard · Stylist Aman
        </div>
      </div>

      {/* Service price card */}
      <div className="absolute left-[6%] top-[330px] w-[44%] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Top service</p>
        <p className="mt-1 text-[13px] font-bold text-slate-900">Hydrafacial</p>
        <div className="mt-3 flex items-end justify-between">
          <p className="text-[20px] font-bold text-slate-900">₹2,499</p>
          <span className="text-[10px] font-semibold text-emerald-600">-30%</span>
        </div>
      </div>

      {/* Map/location card */}
      <div className="absolute right-[4%] bottom-[40px] w-[48%] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="relative h-[90px] bg-gradient-to-br from-blue-50 to-violet-50">
          <div
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 30%, rgba(37,99,235,.25) 1px, transparent 1px), radial-gradient(circle at 70% 60%, rgba(109,40,217,.2) 1px, transparent 1px)",
              backgroundSize: "22px 22px, 28px 28px",
            }}
          />
          <MapPin className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-[#2563EB]" />
        </div>
        <div className="p-3">
          <p className="text-[12px] font-bold text-slate-900">2.3 km away</p>
          <p className="text-[10px] text-slate-500">Mansarovar, Jaipur</p>
        </div>
      </div>

      {/* Rating card */}
      <div className="absolute left-[2%] bottom-0 flex w-[44%] items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xl">
        <div className="flex -space-x-2">
          {["a", "b", "c"].map((k, i) => (
            <div
              key={k}
              className={`h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br ${
                i === 0
                  ? "from-pink-400 to-rose-500"
                  : i === 1
                    ? "from-blue-400 to-indigo-500"
                    : "from-amber-400 to-orange-500"
              }`}
            />
          ))}
        </div>
        <div>
          <div className="flex items-center gap-1 text-amber-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-current" />
            ))}
          </div>
          <p className="text-[10px] text-slate-500">12,400+ happy customers</p>
        </div>
      </div>
    </div>
  );
}

/* ============= FLOATING SEARCH + INLINE RESULTS ============= */
const ALL_AREAS_LABEL = "Jaipur - All areas";
const ALL_CATS_LABEL = "All categories";

/* Tiny module-level store so DiscoveryHome reacts to SearchPanel filters
 * without restructuring the 1200+ line component tree. */
type HomeFilters = { location: string; category: string };
const homeFilters: HomeFilters = { location: ALL_AREAS_LABEL, category: ALL_CATS_LABEL };
const homeFiltersListeners = new Set<() => void>();
function setHomeFilters(next: Partial<HomeFilters>) {
  if (next.location !== undefined) homeFilters.location = next.location;
  if (next.category !== undefined) homeFilters.category = next.category;
  homeFiltersListeners.forEach((l) => l());
}
function useHomeFilters(): HomeFilters {
  const [, force] = useState(0);
  useEffect(() => {
    const cb = () => force((n) => n + 1);
    homeFiltersListeners.add(cb);
    return () => {
      homeFiltersListeners.delete(cb);
    };
  }, []);
  return homeFilters;
}

function SearchPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, _setSelectedLocation] = useState<string>(ALL_AREAS_LABEL);
  const [selectedCategory, _setSelectedCategory] = useState<string>(ALL_CATS_LABEL);
  const setSelectedLocation = (v: string) => {
    _setSelectedLocation(v);
    setHomeFilters({ location: v });
  };
  const setSelectedCategory = (v: string) => {
    _setSelectedCategory(v);
    setHomeFilters({ category: v });
  };
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [activeQuickFilter, setActiveQuickFilter] = useState<string>("");
  const [hasSearched, setHasSearched] = useState(false);

  const locationRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (locationRef.current && !locationRef.current.contains(e.target as Node))
        setIsLocationOpen(false);
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node))
        setIsCategoryOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const allBusinesses = useMemo(() => getMockBusinesses(), []);

  const filteredBusinesses = useMemo(() => {
    let results = allBusinesses;
    if (selectedLocation && selectedLocation !== ALL_AREAS_LABEL) {
      results = results.filter((b) => b.area === selectedLocation);
    }
    if (selectedCategory && selectedCategory !== ALL_CATS_LABEL) {
      results = results.filter((b) => b.category === selectedCategory);
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      results = results.filter((b) => {
        const hay = `${b.name} ${b.category} ${b.area}`.toLowerCase();
        return hay.includes(q);
      });
    }
    switch (activeQuickFilter) {
      case "Open Now":
      case "Near Me":
        break;
      case "Top Rated":
        results = [...results].sort((a, b) => b.rating - a.rating);
        break;
      case "Price Low to High":
        results = [...results].sort((a, b) => a.startingPrice - b.startingPrice);
        break;
      case "Male":
        results = results.filter((b) => b.gender === "male" || b.gender === "unisex");
        break;
      case "Female":
        results = results.filter((b) => b.gender === "female" || b.gender === "unisex");
        break;
      case "Unisex":
        results = results.filter((b) => b.gender === "unisex");
        break;
    }
    return results;
  }, [allBusinesses, selectedLocation, selectedCategory, searchQuery, activeQuickFilter]);

  const scrollToResults = () => {
    setHasSearched(true);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    scrollToResults();
  };

  const pickLocation = (loc: string) => {
    setSelectedLocation(loc);
    setIsLocationOpen(false);
    scrollToResults();
  };
  const pickCategory = (cat: string) => {
    setSelectedCategory(cat);
    setIsCategoryOpen(false);
    scrollToResults();
  };
  const pickQuickFilter = (f: string) => {
    setActiveQuickFilter((prev) => (prev === f ? "" : f));
    scrollToResults();
  };

  const resultCountText = (() => {
    const n = filteredBusinesses.length;
    const loc = selectedLocation !== ALL_AREAS_LABEL ? ` in ${selectedLocation}` : "";
    const cat = selectedCategory !== ALL_CATS_LABEL ? `${selectedCategory} ` : "";
    return `${n} ${cat}${cat ? "businesses" : "businesses"} found${loc}`;
  })();

  return (
    <div className="mx-auto -mt-12 max-w-[1280px] px-5 sm:-mt-16 sm:px-8 lg:-mt-20">
      <form
        onSubmit={onSubmit}
        className="overflow-visible rounded-[28px] border border-slate-200 bg-white p-3 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.30)] sm:p-4"
      >
        <div className="grid grid-cols-1 gap-2 sm:gap-3 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
          {/* Query */}
          <FieldShell label="What are you looking for?" icon={<Search className="h-4 w-4 text-slate-400" />}>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Salon, Facial, Spa, Tattoo, Massage, Nail Art"
              className="w-full bg-transparent text-[15px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </FieldShell>

          {/* Location dropdown */}
          <div ref={locationRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setIsLocationOpen((v) => !v);
                setIsCategoryOpen(false);
              }}
              className="flex h-[72px] w-full items-center gap-3 rounded-2xl border border-transparent bg-slate-50 px-5 text-left transition hover:border-slate-200 hover:bg-white"
            >
              <span className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-white shadow-sm">
                <MapPin className="h-4 w-4 text-slate-400" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Location
                </span>
                <span className="truncate text-[15px] font-medium text-slate-900">
                  {selectedLocation}
                </span>
              </span>
              <ChevronRight
                className={`h-4 w-4 text-slate-400 transition ${isLocationOpen ? "rotate-90" : ""}`}
              />
            </button>
            {isLocationOpen && (
              <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-[320px] overflow-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
                {[ALL_AREAS_LABEL, ...AREAS].map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => pickLocation(loc)}
                    className={`block w-full rounded-xl px-4 py-2.5 text-left text-[14px] font-medium transition hover:bg-slate-100 ${
                      selectedLocation === loc ? "bg-slate-900 text-white hover:bg-slate-800" : "text-slate-800"
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category dropdown */}
          <div ref={categoryRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setIsCategoryOpen((v) => !v);
                setIsLocationOpen(false);
              }}
              className="flex h-[72px] w-full items-center gap-3 rounded-2xl border border-transparent bg-slate-50 px-5 text-left transition hover:border-slate-200 hover:bg-white"
            >
              <span className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-white shadow-sm">
                <Layers className="h-4 w-4 text-slate-400" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Category
                </span>
                <span className="truncate text-[15px] font-medium text-slate-900">
                  {selectedCategory}
                </span>
              </span>
              <ChevronRight
                className={`h-4 w-4 text-slate-400 transition ${isCategoryOpen ? "rotate-90" : ""}`}
              />
            </button>
            {isCategoryOpen && (
              <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-[320px] overflow-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
                {[ALL_CATS_LABEL, ...CATEGORIES.map((c) => c.name)].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => pickCategory(c)}
                    className={`block w-full rounded-xl px-4 py-2.5 text-left text-[14px] font-medium transition hover:bg-slate-100 ${
                      selectedCategory === c ? "bg-slate-900 text-white hover:bg-slate-800" : "text-slate-800"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="inline-flex h-[72px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#6D28D9] px-8 text-sm font-bold text-white shadow-lg shadow-blue-200/70 transition hover:-translate-y-0.5"
          >
            <Search className="h-4 w-4" /> Search
          </button>
        </div>
      </form>

      {/* Quick filter chips */}
      <div className="mt-6 flex flex-wrap gap-2.5">
        {QUICK_FILTERS.map((f) => {
          const active = activeQuickFilter === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => pickQuickFilter(f)}
              className={`rounded-full border px-4 py-2 text-[13px] font-semibold shadow-sm transition ${
                active
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-900 hover:text-slate-900"
              }`}
            >
              {f}
            </button>
          );
        })}
      </div>
      {/* Locality chips */}
      <div className="mt-3 flex flex-wrap gap-2.5">
        {AREAS.map((a) => {
          const active = selectedLocation === a;
          return (
            <button
              key={a}
              type="button"
              onClick={() => pickLocation(a)}
              className={`rounded-full px-4 py-2 text-[13px] font-medium transition ${
                active
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {a}
            </button>
          );
        })}
      </div>

      {/* Inline results */}
      {hasSearched && (
        <div ref={resultsRef} className="mt-10 scroll-mt-24">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-[20px] font-bold text-slate-900">
              {filteredBusinesses.length === 0
                ? "No businesses found"
                : resultCountText}
            </h2>
            {(selectedLocation !== ALL_AREAS_LABEL ||
              selectedCategory !== ALL_CATS_LABEL ||
              searchQuery ||
              activeQuickFilter) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedLocation(ALL_AREAS_LABEL);
                  setSelectedCategory(ALL_CATS_LABEL);
                  setSearchQuery("");
                  setActiveQuickFilter("");
                }}
                className="text-[13px] font-semibold text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
          {filteredBusinesses.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="text-[15px] font-semibold text-slate-900">
                No businesses found. Try another location or category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBusinesses.slice(0, 24).map((b) => (
                <MockBusinessCard key={b.slug} biz={b} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FieldShell({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="group flex h-[72px] items-center gap-3 rounded-2xl border border-transparent bg-slate-50 px-5 transition hover:border-slate-200 hover:bg-white">
      <span className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-white shadow-sm">
        {icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        <span className="min-w-0">{children}</span>
      </span>
    </label>
  );
}

function MockBusinessCard({ biz }: { biz: MockBusiness }) {
  return (
    <article className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-[180px] overflow-hidden">
        <img
          src={biz.cover}
          alt={biz.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        {biz.isVerified && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-emerald-700 shadow">
            <ShieldCheck className="h-3 w-3" /> Verified
          </span>
        )}
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700 shadow">
          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
          {biz.rating.toFixed(1)}
        </span>
      </div>
      <div className="p-4">
        <h3 className="truncate text-[15px] font-bold text-slate-900">{biz.name}</h3>
        <p className="mt-0.5 truncate text-[12px] text-slate-500">
          {biz.category} · {biz.area}, Jaipur
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <p className="text-[12px] text-slate-500">
            From <span className="text-[14px] font-bold text-slate-900">₹{biz.startingPrice}</span>
          </p>
          <div className="flex gap-2">
            <Link
              to="/site/$businessSlug"
              params={{ businessSlug: biz.slug }}
              className="inline-flex h-9 items-center rounded-full border border-slate-200 px-3 text-[12px] font-semibold text-slate-800 hover:border-slate-300"
            >
              View Website
            </Link>
            <Link
              to="/book/$slug"
              params={{ slug: biz.slug }}
              className="inline-flex h-9 items-center rounded-full bg-slate-900 px-3 text-[12px] font-semibold text-white hover:bg-slate-800"
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ============= CATEGORY TILES ============= */
function CategoryGrid() {
  const counts = useMemo(() => getCategoryCounts(), []);
  return (
    <Section
      eyebrow="Categories"
      title="Discover by category"
      subtitle="Premium tiles for every beauty experience in Jaipur."
    >
      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {CATEGORIES.map(({ name, desc, Icon, gradient }) => {
          const count = counts[name] ?? 0;
          const img = CATEGORY_IMAGES[name];
          return (
            <Link
              key={name}
              to="/search"
              search={{ category: name } as never}
              className="group relative overflow-hidden rounded-[24px] border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl"
            >
              <div className="relative h-[120px] w-full overflow-hidden">
                {img && (
                  <img
                    src={img}
                    alt={name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div
                  className={`absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-slate-900 shadow">
                  {count} Shops
                </span>
              </div>
              <div className="p-4 sm:p-5">
                <p className="text-[15px] font-bold text-slate-900 sm:text-[16px]">{name}</p>
                <p className="mt-1 text-[12px] text-slate-500 sm:text-[13px] line-clamp-1">{desc}</p>
                <div className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-slate-900">
                  View Shops <ArrowUpRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </Section>
  );
}


/* ============= SHOP LISTINGS ============= */
type ShopRow = {
  id: string;
  slug: string;
  name: string;
  tagline?: string | null;
  category?: string | null;
  city?: string | null;
  area?: string | null;
  cover_image?: string | null;
  rating?: number | null;
  review_count?: number | null;
  price_level?: number | null;
  is_verified?: boolean | null;
};

function ShopListings() {
  const { data, isLoading } = useQuery(shopsQueryOptions({ limit: 8 }));
  const shops = (data ?? []) as ShopRow[];
  return (
    <Section
      eyebrow="Verified"
      title="Verified beauty places in Jaipur"
      subtitle="Explore trusted salons, spas and beauty experts near you."
      action={
        <Link
          to="/search"
          className="inline-flex items-center gap-1 text-sm font-semibold text-slate-900"
        >
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      }
    >
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[440px] animate-pulse rounded-[28px] border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : shops.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {shops.map((s) => (
            <ShopCard key={s.id} shop={s} />
          ))}
        </div>
      )}
    </Section>
  );
}

function ShopCard({ shop }: { shop: ShopRow }) {
  const price = shop.price_level ? `₹${shop.price_level * 250}` : "₹499";
  return (
    <article className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-2xl">
      <div className="relative h-[240px] overflow-hidden">
        <img
          src={
            shop.cover_image ??
            "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80"
          }
          alt={shop.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
        {shop.is_verified && (
          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-emerald-700 shadow">
            <ShieldCheck className="h-3 w-3" /> Verified
          </span>
        )}
        <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white shadow">
          <span className="h-1.5 w-1.5 rounded-full bg-white" /> Open
        </span>
        <div className="absolute bottom-4 left-4 grid h-12 w-12 place-items-center rounded-2xl border border-white/40 bg-white/95 text-[13px] font-bold text-slate-900 shadow-lg">
          {shop.name.slice(0, 2).toUpperCase()}
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[17px] font-bold text-slate-900">{shop.name}</h3>
            <p className="mt-0.5 truncate text-[13px] text-slate-500">
              {shop.category ?? "Salon"} · {shop.area ?? ""}
              {shop.city ? `, ${shop.city}` : ""}
            </p>
          </div>
          <div className="flex flex-none items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[12px] font-bold text-amber-700">
            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
            {Number(shop.rating ?? 4.6).toFixed(1)}
            <span className="font-medium text-amber-600/70">({shop.review_count ?? 0})</span>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {["Haircut", "Facial", "Spa"].map((t) => (
            <span
              key={t}
              className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700"
            >
              {t}
            </span>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <p className="text-[12px] text-slate-500">
            Starting at <span className="text-[15px] font-bold text-slate-900">{price}</span>
          </p>
          <div className="flex gap-2">
            <Link
              to="/shop/$slug"
              params={{ slug: shop.slug }}
              className="inline-flex h-10 items-center rounded-full border border-slate-200 px-4 text-[13px] font-semibold text-slate-800 hover:border-slate-300"
            >
              View
            </Link>
            <Link
              to="/shop/$slug"
              params={{ slug: shop.slug }}
              search={{ book: "1" } as never}
              className="inline-flex h-10 items-center rounded-full bg-slate-900 px-4 text-[13px] font-semibold text-white hover:bg-slate-800"
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[32px] border border-dashed border-slate-300 bg-white p-12 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-500">
        <Sparkles className="h-6 w-6" />
      </div>
      <p className="mt-4 text-lg font-bold text-slate-900">No verified shops available yet.</p>
      <p className="mt-1 text-sm text-slate-500">
        Be the first salon to list and reach Jaipur customers.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          to="/owner/create-website"
          className="inline-flex h-11 items-center rounded-full bg-slate-900 px-5 text-sm font-semibold text-white"
        >
          Create Shop Website
        </Link>
        <Link
          to="/admin/login"
          className="inline-flex h-11 items-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800"
        >
          Admin: Add Demo Shop
        </Link>
      </div>
    </div>
  );
}

/* ============= AI SMART PICKS ============= */
function SmartPicks() {
  const { data } = useQuery(shopsQueryOptions({ limit: 10 }));
  const picks = useMemo(() => {
    const list = ((data ?? []) as ShopRow[]).slice();
    list.sort(
      (a, b) =>
        Number(b.rating ?? 0) * 10 +
        Number(b.review_count ?? 0) / 100 -
        (Number(a.rating ?? 0) * 10 + Number(a.review_count ?? 0) / 100),
    );
    return list.slice(0, 6);
  }, [data]);
  if (picks.length === 0) return null;
  return (
    <Section
      eyebrow={
        <span className="inline-flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5" /> AI Picks
        </span>
      }
      title="AI Smart Picks for You"
      subtitle="Personalized discovery based on rating, popularity, area and booking activity."
    >
      <div className="-mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 sm:-mx-8 sm:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {picks.map((s) => (
          <div key={s.id} className="w-[340px] flex-none snap-start sm:w-[380px]">
            <ShopCard shop={s} />
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ============= WEBSITE BUILDER ============= */
function WebsiteBuilder() {
  const templates = [
    {
      name: "Royal Luxe",
      tag: "Luxury · Black & Gold",
      img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=80",
      gradient: "from-amber-200 via-yellow-100 to-rose-100",
    },
    {
      name: "Modern Salon",
      tag: "Bold · Red & White",
      img: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80",
      gradient: "from-rose-100 via-white to-slate-100",
    },
    {
      name: "Professional Beauty",
      tag: "Soft · Pink & Rose Gold",
      img: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200&q=80",
      gradient: "from-pink-100 via-rose-50 to-white",
    },
  ];
  return (
    <Section
      eyebrow="For Shop Owners"
      title="Apne Salon Ki Website Free Banaiye"
      subtitle="Template choose karo, details add karo, publish karo aur online bookings receive karo."
      action={
        <Link
          to="/owner/create-website"
          className="inline-flex items-center gap-1 text-sm font-semibold text-slate-900"
        >
          Browse all <ArrowRight className="h-4 w-4" />
        </Link>
      }
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {templates.map((t) => (
          <div
            key={t.name}
            className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-2xl"
          >
            <div className={`relative h-[220px] overflow-hidden bg-gradient-to-br ${t.gradient}`}>
              <img
                src={t.img}
                alt={t.name}
                loading="lazy"
                className="h-full w-full object-cover mix-blend-multiply opacity-90 transition duration-700 group-hover:scale-105"
              />
            </div>
            <div className="p-6">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {t.tag}
              </p>
              <p className="mt-1 text-[20px] font-bold text-slate-900">{t.name}</p>
              <p className="mt-1 text-sm text-slate-500">
                Premium pages, booking, gallery, reviews & more.
              </p>
              <Link
                to="/owner/create-website"
                className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-slate-900 px-5 text-sm font-semibold text-white"
              >
                Preview Template <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-10 flex justify-center">
        <Link
          to="/owner/create-website"
          className="inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-[#2563EB] to-[#6D28D9] px-7 text-sm font-bold text-white shadow-lg shadow-blue-200/70"
        >
          Create Your Website <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Section>
  );
}

/* ============= MEMBERSHIP ============= */
function MembershipCards() {
  const tiers = [
    {
      name: "Silver",
      price: "₹299/mo",
      perks: ["5% off bookings", "Priority slots", "Member offers"],
      grad: "from-slate-200 via-slate-100 to-slate-300",
      text: "text-slate-900",
    },
    {
      name: "Gold",
      price: "₹599/mo",
      perks: ["10% off bookings", "Free birthday spa", "Exclusive lounges"],
      grad: "from-amber-300 via-yellow-200 to-amber-400",
      text: "text-amber-950",
    },
    {
      name: "Platinum",
      price: "₹1,299/mo",
      perks: ["15% off + cashbacks", "Premium concierge", "Bridal early access"],
      grad: "from-slate-700 via-slate-800 to-black",
      text: "text-white",
    },
  ];
  return (
    <Section
      eyebrow="Membership"
      title="Nexora Membership"
      subtitle="Premium perks built for India's beauty industry."
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={`relative overflow-hidden rounded-[28px] border border-slate-200 p-7 shadow-xl bg-gradient-to-br ${t.grad} ${t.text}`}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/30 to-transparent"
            />
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-bold uppercase tracking-[0.2em] opacity-80">
                {t.name}
              </p>
              <Sparkles className="h-5 w-5 opacity-70" />
            </div>
            <p className="mt-8 text-[34px] font-bold">{t.price}</p>
            <ul className="mt-6 space-y-2.5">
              {t.perks.map((p) => (
                <li key={p} className="flex items-center gap-2 text-[14px]">
                  <CheckCircle2 className="h-4 w-4 flex-none opacity-90" /> {p}
                </li>
              ))}
            </ul>
            <button
              className={`mt-8 inline-flex h-11 w-full items-center justify-center rounded-full text-[13px] font-bold ${
                t.name === "Platinum" ? "bg-white text-slate-900" : "bg-slate-900 text-white"
              }`}
            >
              Join {t.name}
            </button>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ============= FINAL CTA ============= */
function FinalCTA() {
  return (
    <section className="px-5 py-20 sm:px-8 lg:py-28">
      <div className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[40px] bg-gradient-to-br from-slate-900 via-[#1E1B4B] to-[#3B0764] p-10 text-center text-white sm:p-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl"
        />
        <h2 className="mx-auto max-w-3xl text-[32px] font-bold tracking-tight sm:text-[48px]">
          Salon Ja Rahe Ho?{" "}
          <span className="bg-gradient-to-r from-blue-300 to-fuchsia-300 bg-clip-text text-transparent">
            Nexora Kiya Kya?
          </span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base text-white/70 sm:text-lg">
          Find trusted beauty professionals, compare services and book faster with Nexora SalonOS.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/search"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-slate-900"
          >
            Explore Salons <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/owner/create-website"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-white/30 bg-white/5 px-6 text-sm font-bold text-white backdrop-blur"
          >
            Create Shop Website
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ============= BOTTOM NAV (Mobile) ============= */
function MobileBottomNav() {
  const items = [
    { label: "Home", to: "/", Icon: HomeIcon },
    { label: "Explore", to: "/search", Icon: Compass },
    { label: "Bookings", to: "/dashboard/bookings", Icon: CalendarCheck },
    { label: "Profile", to: "/profile", Icon: User2 },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
      <div className="grid grid-cols-4">
        {items.map(({ label, to, Icon }) => (
          <Link
            key={label}
            to={to}
            className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold text-slate-600"
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

/* ============= SECTION SHELL ============= */
function Section({
  eyebrow,
  title,
  subtitle,
  action,
  children,
}: {
  eyebrow?: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="px-5 py-14 sm:px-8 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:mb-12 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            {eyebrow && (
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-slate-900/5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                {eyebrow}
              </span>
            )}
            <h2 className="text-[28px] font-bold tracking-tight text-slate-900 sm:text-[40px]">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-3 text-[15px] text-slate-600 sm:text-[17px]">{subtitle}</p>
            )}
          </div>
          {action}
        </div>
        {children}
      </div>
    </section>
  );
}

/* ============= PAGE ============= */
export function HomePage() {
  const filters = useHomeFilters();
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 antialiased">
      <PublicHeader showBackButton={false} />
      <main className="pb-24 md:pb-0">
        <Hero />
        <SearchPanel />
        <CategoryGrid />
        <DiscoveryHome
          selectedLocation={filters.location}
          selectedCategory={filters.category}
          allAreasLabel={ALL_AREAS_LABEL}
          allCategoriesLabel={ALL_CATS_LABEL}
        />
        <ShopListings />
        <SmartPicks />
        <WebsiteBuilder />
        <MembershipCards />
        <FinalCTA />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

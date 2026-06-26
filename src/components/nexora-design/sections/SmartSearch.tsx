import { useState } from "react";
import { Search, SlidersHorizontal, MapPin, Clock, Star, Wallet, User } from "lucide-react";
import FadeIn from "../FadeIn";

const suggestions = ["Salon", "Spa", "Facial", "Tattoo", "Massage", "Nail Art"];

const filters = [
  { label: "Near Me", icon: MapPin },
  { label: "Open Now", icon: Clock },
  { label: "Top Rated", icon: Star },
  { label: "Price", icon: Wallet },
  { label: "Male", icon: User },
  { label: "Female", icon: User },
  { label: "Unisex", icon: User },
];

export default function SmartSearch() {
  const [activeFilters, setActiveFilters] = useState<string[]>(["Near Me"]);
  const [query, setQuery] = useState("");

  const toggleFilter = (label: string) => {
    setActiveFilters((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  return (
    <section id="search" className="relative z-20 -mt-10 px-4 sm:px-6 lg:px-8">
      <FadeIn>
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-2xl shadow-indigo-900/10 backdrop-blur-xl sm:p-6">
          {/* Search Bar */}
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 transition-colors focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-100">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search salons, spas, facials, tattoos..."
              className="flex-1 bg-transparent text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            <button className="hidden items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105 active:scale-95 sm:inline-flex">
              Search
            </button>
            <button className="rounded-xl p-2.5 text-slate-500 transition-colors hover:bg-slate-200 sm:hidden">
              <SlidersHorizontal className="h-5 w-5" />
            </button>
          </div>

          {/* Suggestions */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400">Popular:</span>
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => setQuery(s)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition-all hover:border-indigo-300 hover:text-indigo-700"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.map(({ label, icon: Icon }) => {
              const active = activeFilters.includes(label);
              return (
                <button
                  key={label}
                  onClick={() => toggleFilter(label)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    active
                      ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-200"
                      : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-700"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

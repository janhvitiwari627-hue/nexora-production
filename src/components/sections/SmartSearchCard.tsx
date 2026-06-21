import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MapPin, Search } from "lucide-react";
import { AdvancedSearchPanel } from "./AdvancedSearchPanel";

const PLACEHOLDERS = [
  "Luxury Spa in Malviya Nagar",
  "Haircut Near Me",
  "Bridal Makeup Jaipur",
  "Nail Art Studio Jaipur",
];

const TRENDING_CHIPS = [
  "Salon",
  "Haircut",
  "Spa",
  "Bridal Makeup",
  "Nail Art",
  "Tattoo",
  "Massage",
  "Beard",
];

export function SmartSearchCard() {
  const navigate = useNavigate();
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  const submit = (q?: string) => {
    const term = (q ?? query).trim();
    if (!term) {
      navigate({ to: "/search" });
      return;
    }
    setRecent((r) => [term, ...r.filter((x) => x !== term)].slice(0, 5));
    navigate({ to: "/search", search: { q: term } as never });
  };

  return (
    <div ref={wrapRef} className="relative mx-auto w-[95%] max-w-[1400px]">
      <div
        className="rounded-[24px] border border-[#E6EBF1] bg-white p-3 shadow-[0_10px_40px_-12px_rgba(50,50,93,0.12),0_4px_10px_-4px_rgba(10,37,64,0.06)] md:p-4"
      >
        <div className="flex flex-col gap-2 md:flex-row md:items-stretch">
          {/* Service */}
          <div className="flex flex-[2] items-center gap-3 rounded-[16px] bg-[#F6F9FC] px-4 py-3">
            <Search className="h-5 w-5 shrink-0 text-[#635BFF]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder={PLACEHOLDERS[placeholderIdx]}
              className="w-full bg-transparent text-sm font-medium text-[#0A2540] outline-none placeholder:text-[#8A95A8] md:text-base"
            />
          </div>

          {/* Location */}
          <button
            className="flex flex-1 items-center gap-3 rounded-[16px] bg-[#F6F9FC] px-4 py-3 text-left"
            type="button"
          >
            <span className="relative grid h-5 w-5 place-items-center">
              <motion.span
                className="absolute inset-0 rounded-full bg-[#635BFF]/25"
                animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              />
              <MapPin className="relative h-5 w-5 text-[#635BFF]" />
            </span>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#425466]">
                Location
              </div>
              <div className="truncate text-sm font-semibold text-[#0A2540]">Auto Detect</div>
            </div>
          </button>

          {/* CTA */}
          <button
            onClick={() => submit()}
            className="ripple relative overflow-hidden rounded-[16px] bg-gradient-to-r from-[#635BFF] to-[#7A73FF] px-7 py-4 text-sm font-bold text-white shadow-[0_10px_30px_-10px_rgba(99,91,255,0.55)] transition hover:scale-[1.02] active:scale-[0.98]"
          >
            Find Services
          </button>
        </div>

        {/* Trending chips */}
        <div className="mt-3 flex flex-wrap items-center gap-2 px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#425466]">
            Trending:
          </span>
          {TRENDING_CHIPS.map((c) => (
            <button
              key={c}
              onClick={() => submit(c)}
              className="rounded-full border border-[#E6EBF1] bg-white px-3 py-1 text-xs font-semibold text-[#425466] transition hover:border-[#635BFF] hover:text-[#635BFF]"
            >
              {c}
            </button>
          ))}
        </div>
      </div>


      <AdvancedSearchPanel
        open={focused}
        onClose={() => setFocused(false)}
        query={query}
        recent={recent}
        onRecentDelete={(s) => setRecent((r) => r.filter((x) => x !== s))}
        onRecentClear={() => setRecent([])}
        onPick={(s) => {
          setQuery(s);
          submit(s);
          setFocused(false);
        }}
      />
    </div>
  );
}

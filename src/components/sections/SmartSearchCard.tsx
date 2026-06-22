import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MapPin, Search, Mic, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { AdvancedSearchPanel } from "./AdvancedSearchPanel";
import { parseSmartQuery } from "@/lib/ai-search.functions";
import { useUserLocation } from "@/hooks/use-user-location";

const PLACEHOLDERS = [
  "best haircut under 500 near me",
  "luxury spa in Malviya Nagar",
  "top rated bridal makeup",
  "nail art studio nearby",
];

const TRENDING_CHIPS = [
  "Salon", "Haircut", "Spa", "Bridal Makeup", "Nail Art", "Tattoo", "Massage", "Beard",
];

type SpeechRecognitionLike = {
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  lang: string;
  interimResults: boolean;
  continuous: boolean;
};

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function SmartSearchCard() {
  const navigate = useNavigate();
  const parse = useServerFn(parseSmartQuery);
  const { location, requestGps } = useUserLocation();
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [listening, setListening] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const recogRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  const submit = (q?: string, category?: string) => {
    const term = (q ?? query).trim();
    if (!term && !category) {
      navigate({ to: "/search" });
      return;
    }
    if (term) setRecent((r) => [term, ...r.filter((x) => x !== term)].slice(0, 5));
    navigate({
      to: "/search",
      search: { q: term || undefined, category: category || undefined } as never,
    });
  };

  const runAiSearch = async () => {
    const term = query.trim();
    if (!term) {
      toast.message("Type a query first", { description: "e.g. 'best haircut under 500 near me'" });
      return;
    }
    setAiBusy(true);
    try {
      const parsed = await parse({ data: { query: term } });
      if (parsed.nearMe && !location) requestGps();
      toast.success("AI: " + parsed.intent, {
        description: [
          parsed.category && `Category: ${parsed.category}`,
          parsed.maxBudget && `Budget: ≤ ₹${parsed.maxBudget}`,
          parsed.minRating && `Rating: ≥ ${parsed.minRating}★`,
          parsed.area && `Area: ${parsed.area}`,
        ].filter(Boolean).join(" · ") || undefined,
      });
      submit(parsed.service || term, parsed.category ?? undefined);
    } catch (e) {
      toast.error("AI search failed", { description: e instanceof Error ? e.message : String(e) });
    } finally {
      setAiBusy(false);
    }
  };

  const toggleVoice = () => {
    const Ctor = getSpeechRecognition();
    if (!Ctor) {
      toast.error("Voice search not supported in this browser");
      return;
    }
    if (listening) {
      recogRef.current?.stop();
      return;
    }
    const recog = new Ctor();
    recog.lang = "en-IN";
    recog.interimResults = false;
    recog.continuous = false;
    recog.onresult = (e) => {
      const text = e.results[0]?.[0]?.transcript ?? "";
      if (text) setQuery(text);
    };
    recog.onerror = (e) => {
      toast.error("Voice error: " + e.error);
      setListening(false);
    };
    recog.onend = () => setListening(false);
    recogRef.current = recog;
    setListening(true);
    recog.start();
  };

  return (
    <div ref={wrapRef} className="relative mx-auto w-[95%] max-w-[1400px]">
      <div className="rounded-[24px] border border-[#E6EBF1] bg-white p-3 shadow-[0_10px_40px_-12px_rgba(50,50,93,0.12),0_4px_10px_-4px_rgba(10,37,64,0.06)] md:p-4">
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
            <button
              type="button"
              onClick={toggleVoice}
              aria-label={listening ? "Stop voice search" : "Voice search"}
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition ${
                listening ? "bg-red-500 text-white animate-pulse" : "bg-white text-[#635BFF] hover:bg-[#635BFF]/10"
              }`}
            >
              <Mic className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={runAiSearch}
              disabled={aiBusy}
              aria-label="AI smart search"
              title="AI smart search"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#635BFF] to-[#9F7AFF] text-white transition hover:scale-110 disabled:opacity-60"
            >
              {aiBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            </button>
          </div>

          {/* Location */}
          <button
            className="flex flex-1 items-center gap-3 rounded-[16px] bg-[#F6F9FC] px-4 py-3 text-left"
            type="button"
            onClick={() => !location && requestGps()}
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
              <div className="truncate text-sm font-semibold text-[#0A2540]">
                {location ? `${location.lat.toFixed(2)}, ${location.lng.toFixed(2)}` : "Auto Detect"}
              </div>
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

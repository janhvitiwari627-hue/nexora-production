import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Sparkles, TrendingUp, X } from "lucide-react";

const TRENDING = ["Balayage", "Keratin", "Bridal Makeup", "Beard Trim", "Manicure", "Facial"];
const POPULAR = [
  { name: "Haircut", icon: "✂️" },
  { name: "Spa", icon: "💆" },
  { name: "Nails", icon: "💅" },
  { name: "Makeup", icon: "💄" },
  { name: "Massage", icon: "🧖" },
  { name: "Tattoo", icon: "🎨" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  query: string;
  recent: string[];
  onRecentDelete: (s: string) => void;
  onRecentClear: () => void;
  onPick: (s: string) => void;
}

export function AdvancedSearchPanel({
  open,
  onClose,
  query,
  recent,
  onRecentDelete,
  onRecentClear,
  onPick,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div className="mt-3 rounded-[24px] border border-[#E6EBF1] bg-white p-5 shadow-[0_10px_40px_-12px_rgba(50,50,93,0.12),0_4px_10px_-4px_rgba(10,37,64,0.06)]">
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <Section title="Trending" icon={<TrendingUp className="h-4 w-4" />}>
                <div className="flex flex-wrap gap-2">
                  {TRENDING.map((t) => (
                    <Chip key={t} label={t} onClick={() => onPick(t)} />
                  ))}
                </div>
              </Section>

              <Section title="Popular Services">
                <div className="flex flex-wrap gap-2">
                  {POPULAR.map((p) => (
                    <Chip key={p.name} label={`${p.icon} ${p.name}`} onClick={() => onPick(p.name)} />
                  ))}
                </div>
              </Section>

              <Section
                title="Recent"
                icon={<Clock className="h-4 w-4" />}
                action={
                  recent.length > 0 && (
                    <button
                      onClick={onRecentClear}
                      className="text-[11px] font-semibold text-[#425466] hover:text-[#0A2540]"
                    >
                      Clear All
                    </button>
                  )
                }
              >
                {recent.length === 0 ? (
                  <p className="text-xs text-[#425466]">No recent searches.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {recent.map((r) => (
                      <li
                        key={r}
                        className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm text-[#0A2540] hover:bg-[#F6F9FC]"
                      >
                        <button onClick={() => onPick(r)} className="flex-1 text-left">
                          {r}
                        </button>
                        <button
                          onClick={() => onRecentDelete(r)}
                          aria-label={`Remove ${r}`}
                          className="rounded p-1 text-[#425466] hover:text-[#0A2540]"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              <Section
                title="AI Suggestions"
                icon={<Sparkles className="h-4 w-4 text-[#635BFF]" />}
              >
                {query.trim().length === 0 ? (
                  <p className="text-xs text-[#425466]">Start typing for smart suggestions.</p>
                ) : (
                  <div className="space-y-2">
                    {[
                      `Top "${query}" salons near you`,
                      `Best rated for "${query}"`,
                      `"${query}" under ₹999`,
                    ].map((s) => (
                      <button
                        key={s}
                        onClick={() => onPick(s)}
                        className="block w-full rounded-lg bg-gradient-to-r from-[#635BFF]/10 to-[#00D4FF]/10 px-3 py-2 text-left text-sm text-[#0A2540] hover:from-[#635BFF]/20 hover:to-[#00D4FF]/20"
                      >
                        ✨ {s}
                      </button>
                    ))}
                  </div>
                )}
              </Section>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Section({
  title,
  icon,
  action,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white/80">
          {icon}
          {title}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function Chip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:border-[#00D4FF] hover:bg-white/15 hover:shadow-[0_0_18px_rgba(0,212,255,0.4)]"
    >
      {label}
    </button>
  );
}

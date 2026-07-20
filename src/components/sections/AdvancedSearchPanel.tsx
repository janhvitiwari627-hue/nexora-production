import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Sparkles, TrendingUp, X } from "lucide-react";

const TRENDING = ["Balayage", "Keratin", "Bridal Makeup", "Beard Trim", "Manicure", "Facial"];
const POPULAR = ["Haircut", "Spa", "Nails", "Makeup", "Massage", "Tattoo"];

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
          className="relative z-50 overflow-hidden"
        >
          <div className="mt-3 rounded-[24px] border border-border bg-card p-4 shadow-[var(--shadow-float)] sm:p-5 md:p-6">
            <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-4">
              <Section title="Trending" icon={<TrendingUp className="h-4 w-4 text-primary" />}>
                <div className="flex flex-wrap gap-2">
                  {TRENDING.map((t) => (
                    <Chip key={t} label={t} onClick={() => onPick(t)} />
                  ))}
                </div>
              </Section>

              <Section title="Popular Services">
                <div className="flex flex-wrap gap-2">
                  {POPULAR.map((p) => (
                    <Chip key={p} label={p} onClick={() => onPick(p)} />
                  ))}
                </div>
              </Section>

              <Section
                title="Recent"
                icon={<Clock className="h-4 w-4 text-primary" />}
                action={
                  recent.length > 0 && (
                    <button
                      onClick={onRecentClear}
                      className="text-[11px] font-bold text-body transition duration-300 hover:text-heading"
                    >
                      Clear All
                    </button>
                  )
                }
              >
                {recent.length === 0 ? (
                  <p className="text-sm font-medium text-body">No recent searches.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {recent.map((r) => (
                      <li
                        key={r}
                        className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm font-semibold text-heading transition duration-300 hover:bg-muted"
                      >
                        <button onClick={() => onPick(r)} className="flex-1 text-left">
                          {r}
                        </button>
                        <button
                          onClick={() => onRecentDelete(r)}
                          aria-label={`Remove ${r}`}
                          className="rounded p-1 text-body transition duration-300 hover:text-heading"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              <Section title="AI Suggestions" icon={<Sparkles className="h-4 w-4 text-primary" />}>
                {query.trim().length === 0 ? (
                  <p className="text-sm font-medium text-body">
                    Start typing for smart suggestions.
                  </p>
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
                        className="block w-full rounded-lg bg-muted px-3 py-2 text-left text-sm font-semibold text-heading transition duration-300 hover:bg-primary/10"
                      >
                        {s}
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
        <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.12em] text-heading">
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
      className="rounded-full border border-border bg-card px-3.5 py-2 text-sm font-bold text-heading shadow-sm transition duration-300 hover:border-primary hover:text-primary hover:shadow-[0_8px_20px_-12px_rgba(99,91,255,0.45)]"
    >
      {label}
    </button>
  );
}

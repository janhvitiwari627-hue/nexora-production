import { useEffect, useRef, useState } from "react";
import { TrendingUp } from "lucide-react";
import { mockActivePlan } from "./mockMembership";

export function SavingsEarnedCounter() {
  const target = mockActivePlan.savingsToDate;
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        const duration = 1400;
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          setValue(Math.round(target * eased));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-emerald-50 to-teal-50 p-5 shadow-sm dark:from-emerald-950/40 dark:to-teal-950/40"
    >
      <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-emerald-400/20 blur-2xl" />
      <div className="relative flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-500 text-white">
          <TrendingUp className="h-5 w-5" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-200">
          Saved with your membership
        </p>
      </div>
      <p className="relative mt-3 text-4xl font-black tracking-tight text-emerald-900 sm:text-5xl dark:text-emerald-100">
        ₹{value.toLocaleString("en-IN")}
      </p>
      <p className="relative mt-1 text-xs text-emerald-800/80 dark:text-emerald-200/80">
        Across discounts, free services and bonus rewards.
      </p>
    </div>
  );
}

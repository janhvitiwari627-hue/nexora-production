import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  {
    title: "Book & complete services",
    body: "Earn 2 points for every ₹100 spent at any Nexora partner shop. Points are credited 24 hours after service completion.",
  },
  {
    title: "Write authentic reviews",
    body: "Get 20 bonus points for each verified review with a photo. Limit one bonus per booking.",
  },
  {
    title: "Refer friends",
    body: "Invite friends — when they complete their first booking, you both earn 100 points.",
  },
  {
    title: "Maintain tier streaks",
    body: "Book at least once a month to keep your tier active and unlock streak multipliers up to 3×.",
  },
];

export function EarningGuide() {
  const [open, setOpen] = useState(true);
  return (
    <section className="rounded-2xl border bg-card shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 p-5 text-left"
      >
        <span className="flex items-center gap-2 text-base font-bold">
          <Sparkles className="h-4 w-4 text-primary" /> How to earn more points
        </span>
        <ChevronDown
          className={cn("h-5 w-5 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="grid gap-3 px-5 pb-5 md:grid-cols-2">
          {ITEMS.map((it, i) => (
            <div key={it.title} className="rounded-xl border bg-muted/40 p-4">
              <p className="text-xs font-bold text-primary">0{i + 1}</p>
              <p className="mt-1 text-sm font-bold">{it.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{it.body}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

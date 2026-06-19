import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { mockRecommended } from "../mockDashboard";

export function RecommendedServicesSection() {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
            <Sparkles className="h-3 w-3" /> AI
          </span>
          Recommended for you
        </h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory">
        {mockRecommended.map((r) => (
          <Link
            key={r.id}
            to="/book/$slug"
            params={{ slug: r.shopSlug }}
            className="snap-start group relative min-w-[240px] overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:shadow-md"
          >
            <div className="relative h-32 w-full overflow-hidden">
              <img
                src={r.image}
                alt={r.name}
                className="h-full w-full object-cover transition group-hover:scale-105"
              />
              <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                <Sparkles className="h-3 w-3 text-fuchsia-300" /> AI Pick
              </span>
            </div>
            <div className="p-3">
              <p className="truncate text-sm font-bold">{r.name}</p>
              <p className="truncate text-xs text-muted-foreground">{r.shopName}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-black">₹{r.price}</span>
                <span className="text-[11px] text-muted-foreground">{r.reason}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

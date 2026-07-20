import { Sparkles, Crown } from "lucide-react";
import { mockPoints } from "./mockRewards";
import { mockUser } from "../mockUser";

export function RewardBalanceHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,oklch(0.32_0.16_290),oklch(0.26_0.18_320)_60%,oklch(0.22_0.14_260))] p-6 text-white shadow-[var(--shadow-float)] sm:p-8">
      {/* Particles */}
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 18 }).map((_, i) => {
          const left = (i * 53) % 100;
          const top = (i * 37) % 100;
          const dur = 4 + ((i * 7) % 5);
          const delay = (i * 0.3) % 4;
          const size = 4 + ((i * 3) % 6);
          return (
            <span
              key={i}
              className="absolute rounded-full bg-white/40 blur-[1px]"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: size,
                height: size,
                animation: `floatY ${dur}s ease-in-out ${delay}s infinite alternate`,
                opacity: 0.5,
              }}
            />
          );
        })}
      </div>
      <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-fuchsia-500/30 blur-3xl" />
      <div className="absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-indigo-500/30 blur-3xl" />

      <div className="relative flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Reward Balance
          </span>
          <h1 className="mt-3 text-5xl font-black tracking-tight sm:text-6xl">
            {mockPoints.available.toLocaleString()}
            <span className="ml-2 text-xl font-bold opacity-80">pts</span>
          </h1>
          <p className="mt-1 text-sm opacity-80">
            ≈ ₹{(mockPoints.available / 2).toLocaleString("en-IN")} value
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 px-3.5 py-1.5 text-sm font-black text-amber-950 shadow-lg">
          <Crown className="h-4 w-4" /> {mockUser.tier} Tier
        </span>
      </div>

      <style>{`@keyframes floatY { from { transform: translateY(0) } to { transform: translateY(-18px) } }`}</style>
    </section>
  );
}

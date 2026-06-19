import { Sparkles } from "lucide-react";
import { mockUser } from "../mockUser";

export function RewardProgressCard() {
  const { points, pointsToNextTier, tierProgressMax, nextTier } = mockUser;
  const pct = Math.min(100, Math.round((points / tierProgressMax) * 100));
  const r = 52;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;

  return (
    <div className="rounded-3xl border bg-gradient-to-br from-card to-muted/40 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Reward Points
          </p>
          <p className="mt-1 text-3xl font-black sm:text-4xl">
            {points.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Available to redeem
          </p>
        </div>
        <div className="relative h-32 w-32 shrink-0">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle
              cx="60"
              cy="60"
              r={r}
              stroke="currentColor"
              className="text-muted"
              strokeWidth="10"
              fill="none"
            />
            <circle
              cx="60"
              cy="60"
              r={r}
              stroke="url(#rewardGrad)"
              strokeWidth="10"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={`${dash} ${c}`}
              style={{ transition: "stroke-dasharray 0.8s ease" }}
            />
            <defs>
              <linearGradient id="rewardGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <p className="text-lg font-bold">{pct}%</p>
              <p className="text-[10px] text-muted-foreground">to {nextTier}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
        <Sparkles className="h-3.5 w-3.5" />
        {pointsToNextTier.toLocaleString()} points to {nextTier}
      </div>
    </div>
  );
}

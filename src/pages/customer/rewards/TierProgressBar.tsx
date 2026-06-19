import { mockPoints } from "./mockRewards";

export function TierProgressBar() {
  const pct = Math.min(100, Math.round((mockPoints.available / mockPoints.tierProgressMax) * 100));
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Tier Progress
          </p>
          <p className="mt-1 text-sm font-bold">
            {mockPoints.pointsToNextTier.toLocaleString()} points to {mockPoints.nextTier}
          </p>
        </div>
        <span className="text-2xl font-black text-primary">{pct}%</span>
      </div>
      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[11px] font-semibold text-muted-foreground">
        <span>0</span>
        <span>{mockPoints.tierProgressMax.toLocaleString()}</span>
      </div>
    </div>
  );
}

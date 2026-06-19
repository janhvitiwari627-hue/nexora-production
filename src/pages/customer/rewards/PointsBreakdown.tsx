import { Wallet, Clock, Gift, Trophy, type LucideIcon } from "lucide-react";
import { mockPoints } from "./mockRewards";

const STATS: { id: keyof typeof mockPoints; label: string; Icon: LucideIcon; tint: string }[] = [
  { id: "available", label: "Available", Icon: Wallet, tint: "bg-emerald-100 text-emerald-700" },
  { id: "pending", label: "Pending", Icon: Clock, tint: "bg-amber-100 text-amber-700" },
  { id: "redeemed", label: "Redeemed", Icon: Gift, tint: "bg-indigo-100 text-indigo-700" },
  { id: "lifetime", label: "Lifetime", Icon: Trophy, tint: "bg-fuchsia-100 text-fuchsia-700" },
];

export function PointsBreakdown() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {STATS.map((s) => (
        <div key={s.id} className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className={`grid h-9 w-9 place-items-center rounded-full ${s.tint}`}>
            <s.Icon className="h-4 w-4" />
          </div>
          <p className="mt-3 text-2xl font-black">
            {(mockPoints[s.id] as number).toLocaleString()}
          </p>
          <p className="text-xs font-semibold text-muted-foreground">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

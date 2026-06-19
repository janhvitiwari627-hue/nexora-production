import { AlertTriangle } from "lucide-react";
import { mockExpiring } from "./mockRewards";

export function ExpiringSoonAlert() {
  const days = Math.max(
    0,
    Math.ceil((new Date(mockExpiring.expiresOnISO).getTime() - Date.now()) / 86400000),
  );
  if (days > 30 || mockExpiring.points <= 0) return null;
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-amber-300/60 bg-amber-50 p-4 text-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-200/80 text-amber-700">
        <AlertTriangle className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold">
          {mockExpiring.points.toLocaleString()} points expiring in {days} days
        </p>
        <p className="text-xs opacity-80">
          Use them before{" "}
          {new Date(mockExpiring.expiresOnISO).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}{" "}
          or they will be forfeited.
        </p>
      </div>
      <button
        type="button"
        className="shrink-0 rounded-full bg-amber-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-amber-700"
      >
        Redeem now
      </button>
    </div>
  );
}

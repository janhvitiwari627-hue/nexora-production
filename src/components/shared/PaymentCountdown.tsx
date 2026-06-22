import { useEffect, useState } from "react";
import { AlertTriangle, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Counts down to a payment deadline. Shows red warning under 2 minutes.
 * Pass a Date or ISO string. Optional onExpire fires once when time runs out.
 */
export function PaymentCountdown({
  deadline,
  onExpire,
  className,
}: {
  deadline: Date | string;
  onExpire?: () => void;
  className?: string;
}) {
  const target = typeof deadline === "string" ? new Date(deadline) : deadline;
  const [msLeft, setMsLeft] = useState(() => Math.max(0, target.getTime() - Date.now()));

  useEffect(() => {
    const id = setInterval(() => {
      const next = Math.max(0, target.getTime() - Date.now());
      setMsLeft(next);
      if (next === 0) {
        clearInterval(id);
        onExpire?.();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [target, onExpire]);

  const expired = msLeft === 0;
  const urgent = msLeft > 0 && msLeft < 120_000;
  const mm = Math.floor(msLeft / 60_000);
  const ss = Math.floor((msLeft % 60_000) / 1000);

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold tabular-nums transition",
        expired
          ? "border-destructive/40 bg-destructive/10 text-destructive"
          : urgent
            ? "border-orange-300 bg-orange-50 text-orange-700"
            : "border-border bg-muted text-heading",
        className,
      )}
    >
      {expired ? <AlertTriangle className="h-4 w-4" /> : <Timer className="h-4 w-4" />}
      {expired
        ? "Payment window expired"
        : `Pay within ${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`}
    </div>
  );
}

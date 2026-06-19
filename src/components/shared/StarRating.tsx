import { Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function StarRating({
  value,
  max = 5,
  size = 16,
  interactive = false,
  showNumber = true,
  onChange,
  className,
}: {
  value: number;
  max?: number;
  size?: number;
  interactive?: boolean;
  showNumber?: boolean;
  onChange?: (v: number) => void;
  className?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <div className="inline-flex">
        {Array.from({ length: max }).map((_, i) => {
          const idx = i + 1;
          const fillPct = Math.max(0, Math.min(1, display - i)) * 100;
          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              onMouseEnter={() => interactive && setHover(idx)}
              onMouseLeave={() => interactive && setHover(null)}
              onClick={() => interactive && onChange?.(idx)}
              className={cn("relative", interactive ? "cursor-pointer" : "cursor-default")}
              aria-label={`${idx} star${idx > 1 ? "s" : ""}`}
            >
              <Star className="text-muted-foreground/40" style={{ width: size, height: size }} />
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillPct}%` }}
              >
                <Star className="fill-warning text-warning" style={{ width: size, height: size }} />
              </span>
            </button>
          );
        })}
      </div>
      {showNumber && (
        <span className="text-heading text-xs font-semibold">{display.toFixed(1)}</span>
      )}
    </div>
  );
}

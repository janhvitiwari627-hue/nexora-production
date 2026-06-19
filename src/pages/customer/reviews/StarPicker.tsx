import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarPicker({
  value,
  onChange,
  size = 28,
  readOnly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  readOnly?: boolean;
}) {
  return (
    <div className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => {
        const active = i <= value;
        return (
          <button
            key={i}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(i)}
            className={cn(
              "transition",
              !readOnly && "hover:scale-110 cursor-pointer",
              readOnly && "cursor-default",
            )}
            aria-label={`${i} star${i > 1 ? "s" : ""}`}
          >
            <Star
              size={size}
              className={cn(
                "transition",
                active ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

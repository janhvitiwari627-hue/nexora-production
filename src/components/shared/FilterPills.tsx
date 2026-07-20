import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function FilterPills({
  options,
  value,
  onChange,
  className,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn("scrollbar-hide -mx-2 flex items-center gap-2 overflow-x-auto px-2", className)}
      style={{ scrollbarWidth: "none" }}
    >
      {options.map((opt) => {
        const active = opt === value;
        return (
          <motion.button
            key={opt}
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange(opt)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition",
              active
                ? "bg-primary text-primary-foreground border-primary shadow-[var(--shadow-glow)]"
                : "bg-card text-muted-foreground border-border hover:border-primary hover:text-primary hover:shadow-[var(--shadow-glow)]",
            )}
          >
            {opt}
          </motion.button>
        );
      })}
    </div>
  );
}

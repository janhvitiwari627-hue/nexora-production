import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const BOOKING_STEPS = ["Services", "Staff", "Date & Time", "Payment"] as const;
export type BookingStepIndex = 0 | 1 | 2 | 3;

export function StepProgressIndicator({ active }: { active: BookingStepIndex }) {
  return (
    <ol className="mx-auto flex w-full max-w-3xl items-center gap-2 md:gap-4">
      {BOOKING_STEPS.map((label, i) => {
        const isComplete = i < active;
        const isActive = i === active;
        return (
          <li key={label} className="flex flex-1 items-center gap-2 md:gap-3">
            <div className="relative">
              {isActive && (
                <motion.span
                  className="bg-primary/30 absolute inset-0 rounded-full"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                />
              )}
              <div
                className={cn(
                  "relative grid h-9 w-9 place-items-center rounded-full text-sm font-bold transition",
                  isComplete && "bg-primary text-primary-foreground",
                  isActive && "bg-gradient-cta text-primary-foreground shadow-[var(--shadow-glow)]",
                  !isComplete && !isActive && "bg-muted text-muted-foreground",
                )}
              >
                {isComplete ? <Check className="h-4 w-4" /> : i + 1}
              </div>
            </div>
            <span
              className={cn(
                "hidden text-sm font-semibold md:inline",
                isActive || isComplete ? "text-heading" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
            {i < BOOKING_STEPS.length - 1 && (
              <div className="bg-muted relative h-0.5 flex-1 overflow-hidden rounded-full">
                <motion.span
                  className="bg-primary absolute inset-y-0 left-0"
                  initial={false}
                  animate={{ width: isComplete ? "100%" : "0%" }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

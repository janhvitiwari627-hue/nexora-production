import { Check, Clock, type LucideIcon, CalendarCheck, Scissors, Sparkles, FileCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TimelineStatus } from "./mockBookingDetail";

const STEPS: { id: TimelineStatus; label: string; Icon: LucideIcon }[] = [
  { id: "pending", label: "Pending", Icon: Clock },
  { id: "confirmed", label: "Confirmed", Icon: CalendarCheck },
  { id: "accepted", label: "Accepted", Icon: Check },
  { id: "in-service", label: "In Service", Icon: Scissors },
  { id: "completed", label: "Completed", Icon: FileCheck },
];

export function StatusTimeline({ current }: { current: TimelineStatus }) {
  const currentIdx = STEPS.findIndex((s) => s.id === current);
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <h3 className="flex items-center gap-2 text-sm font-bold">
        <Sparkles className="h-4 w-4 text-primary" /> Booking Status
      </h3>

      {/* Horizontal stepper (md+) */}
      <div className="mt-5 hidden md:block">
        <div className="relative flex justify-between">
          <div className="absolute top-5 right-5 left-5 h-1 rounded-full bg-muted" />
          <div
            className="absolute top-5 left-5 h-1 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all"
            style={{
              width: `calc(${(currentIdx / (STEPS.length - 1)) * 100}% - ${currentIdx === 0 ? 0 : 0}px)`,
              maxWidth: "calc(100% - 2.5rem)",
            }}
          />
          {STEPS.map((s, i) => {
            const done = i < currentIdx;
            const active = i === currentIdx;
            return (
              <div key={s.id} className="relative z-10 flex flex-col items-center">
                <div
                  className={cn(
                    "grid h-10 w-10 place-items-center rounded-full border-2 transition",
                    done && "border-emerald-500 bg-emerald-500 text-white",
                    active &&
                      "border-primary bg-primary text-primary-foreground shadow-[0_0_0_6px_rgba(99,102,241,0.18)] animate-pulse",
                    !done && !active && "border-border bg-card text-muted-foreground",
                  )}
                >
                  <s.Icon className="h-4 w-4" />
                </div>
                <span
                  className={cn(
                    "mt-2 text-[11px] font-semibold",
                    active ? "text-heading" : "text-muted-foreground",
                  )}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vertical stepper (mobile) */}
      <ol className="mt-4 space-y-3 md:hidden">
        {STEPS.map((s, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          return (
            <li key={s.id} className="flex items-center gap-3">
              <div
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-full border-2",
                  done && "border-emerald-500 bg-emerald-500 text-white",
                  active && "border-primary bg-primary text-primary-foreground animate-pulse",
                  !done && !active && "border-border bg-card text-muted-foreground",
                )}
              >
                <s.Icon className="h-4 w-4" />
              </div>
              <span
                className={cn(
                  "text-sm font-semibold",
                  active ? "text-heading" : done ? "text-emerald-600" : "text-muted-foreground",
                )}
              >
                {s.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

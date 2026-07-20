import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TIME_SLOTS = (() => {
  const out: string[] = [];
  for (let h = 10; h < 21; h++) {
    out.push(`${String(h).padStart(2, "0")}:00`);
    out.push(`${String(h).padStart(2, "0")}:30`);
  }
  return out;
})();

function fmtYMD(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function buildMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

// Pseudo-availability: closed Sundays, every 5th day unavailable
function isDateUnavailable(d: Date) {
  if (d.getDay() === 0) return true;
  return d.getDate() % 7 === 3;
}

// Pseudo-booked slots derived deterministically from date
function bookedSlots(dateKey: string): Set<string> {
  const hash = [...dateKey].reduce((a, c) => a + c.charCodeAt(0), 0);
  const picks = new Set<string>();
  for (let i = 0; i < 5; i++) {
    picks.add(TIME_SLOTS[(hash + i * 7) % TIME_SLOTS.length]);
  }
  return picks;
}

export function Step3DateTime({
  date,
  time,
  onPickDate,
  onPickTime,
}: {
  date: string | null;
  time: string | null;
  onPickDate: (d: string) => void;
  onPickTime: (t: string) => void;
}) {
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);
  const [view, setView] = useState(() => ({
    y: today.getFullYear(),
    m: today.getMonth(),
  }));
  const cells = useMemo(() => buildMonthGrid(view.y, view.m), [view]);
  const booked = useMemo(() => (date ? bookedSlots(date) : new Set<string>()), [date]);
  const conflictSlot = time && booked.has(time);

  const monthName = new Date(view.y, view.m, 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <header className="mb-6">
        <h2 className="text-heading text-2xl font-black md:text-3xl">Select date & time</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          We hold your slot for 10 minutes after you proceed.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
        {/* Calendar */}
        <div className="border-border bg-card rounded-[var(--radius-card-lg)] border p-4">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous month"
              className="hover:bg-muted grid h-9 w-9 place-items-center rounded-full"
              onClick={() =>
                setView((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 }))
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="text-heading text-sm font-bold">{monthName}</div>
            <button
              type="button"
              aria-label="Next month"
              className="hover:bg-muted grid h-9 w-9 place-items-center rounded-full"
              onClick={() =>
                setView((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 }))
              }
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="text-muted-foreground mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wider">
            {WEEKDAYS.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              if (!d) return <div key={i} />;
              const key = fmtYMD(d);
              const isPast = d < today;
              const unavailable = !isPast && isDateUnavailable(d);
              const selected = key === date;
              const disabled = isPast || unavailable;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={disabled}
                  onClick={() => onPickDate(key)}
                  className={cn(
                    "relative grid h-10 place-items-center rounded-lg text-sm font-semibold transition",
                    selected && "bg-primary text-primary-foreground shadow",
                    !selected && !disabled && "bg-primary/10 text-heading hover:bg-primary/20",
                    isPast && "text-muted-foreground/50 cursor-not-allowed",
                    unavailable && "text-muted-foreground cursor-not-allowed line-through",
                  )}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
          <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-3 text-[11px]">
            <Legend swatch="bg-primary/20" label="Available" />
            <Legend swatch="bg-muted" label="Unavailable" />
            <Legend swatch="bg-primary" label="Selected" />
          </div>
        </div>

        {/* Time slots */}
        <div className="border-border bg-card rounded-[var(--radius-card-lg)] border p-5">
          <h3 className="text-heading mb-1 text-base font-bold">
            {date ? `Slots for ${date}` : "Pick a date first"}
          </h3>
          <p className="text-muted-foreground mb-4 text-xs">30-minute intervals</p>
          {date && (
            <>
              <div className="grid grid-cols-3 gap-2 md:grid-cols-4">
                {TIME_SLOTS.map((slot) => {
                  const isBooked = booked.has(slot);
                  const isSelected = slot === time;
                  return (
                    <motion.button
                      key={slot}
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      disabled={isBooked}
                      onClick={() => onPickTime(slot)}
                      className={cn(
                        "rounded-[var(--radius-button)] border px-2 py-2.5 text-sm font-bold transition",
                        isSelected &&
                          "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-glow)]",
                        !isSelected &&
                          !isBooked &&
                          "border-success/30 bg-success/10 text-success hover:bg-success/20",
                        isBooked &&
                          "bg-muted text-muted-foreground/60 cursor-not-allowed line-through",
                      )}
                    >
                      {slot}
                    </motion.button>
                  );
                })}
              </div>
              {conflictSlot && (
                <div className="bg-danger/10 text-danger mt-4 flex items-center gap-2 rounded-[var(--radius-button)] px-3 py-2 text-xs font-semibold">
                  <AlertTriangle className="h-4 w-4" /> This slot was just booked. Please pick
                  another.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("h-2.5 w-2.5 rounded-full", swatch)} /> {label}
    </span>
  );
}

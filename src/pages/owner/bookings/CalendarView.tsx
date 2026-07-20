import { useMemo } from "react";
import { STATUS_META, type OwnerBooking } from "./mockOwnerBookings";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 10 }, (_, i) => 9 + i); // 9..18

function parseTime(t: string): number {
  const [hm, period] = t.split(" ");
  const [hStr, mStr] = hm.split(":");
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return h + m / 60;
}

function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = x.getDay();
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}

function fmtDateKey(d: Date) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function CalendarView({
  bookings,
  onSelect,
}: {
  bookings: OwnerBooking[];
  onSelect: (b: OwnerBooking) => void;
}) {
  const today = new Date();
  const weekStart = useMemo(() => startOfWeek(today), [today]);
  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        return d;
      }),
    [weekStart],
  );

  const grouped = useMemo(() => {
    const map: Record<string, OwnerBooking[]> = {};
    for (const b of bookings) {
      map[b.date] = map[b.date] || [];
      map[b.date].push(b);
    }
    return map;
  }, [bookings]);

  return (
    <div className="bg-card border-border overflow-x-auto rounded-xl border">
      <div className="min-w-[800px]">
        <div className="grid" style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}>
          <div className="bg-muted/50 border-border border-b p-2 text-xs" />
          {days.map((d) => {
            const isToday = fmtDateKey(d) === fmtDateKey(today);
            return (
              <div
                key={d.toISOString()}
                className={cn(
                  "bg-muted/50 border-border border-b border-l p-2 text-center text-xs font-semibold",
                  isToday && "bg-primary/10 text-primary",
                )}
              >
                <div>{d.toLocaleDateString("en-US", { weekday: "short" })}</div>
                <div className="text-heading text-base">{d.getDate()}</div>
              </div>
            );
          })}
          {HOURS.map((h) => (
            <div key={h} className="contents">
              <div className="border-border text-muted-foreground border-b p-1 text-right text-[10px]">
                {h > 12 ? h - 12 : h}
                {h >= 12 ? "PM" : "AM"}
              </div>
              {days.map((d) => {
                const key = fmtDateKey(d);
                const cellBookings = (grouped[key] || []).filter((b) => {
                  const t = parseTime(b.time);
                  return t >= h && t < h + 1;
                });
                return (
                  <div
                    key={`${key}-${h}`}
                    className="border-border relative min-h-[56px] border-b border-l p-1"
                  >
                    {cellBookings.map((b) => {
                      const m = STATUS_META[b.status];
                      return (
                        <button
                          key={b.id}
                          onClick={() => onSelect(b)}
                          className={cn(
                            "mb-1 block w-full truncate rounded-md px-1.5 py-1 text-left text-[10px] font-semibold transition hover:opacity-80",
                            m.bg,
                            m.text,
                          )}
                          title={`${b.customer} · ${b.service}`}
                        >
                          {b.time} · {b.customer.split(" ")[0]}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

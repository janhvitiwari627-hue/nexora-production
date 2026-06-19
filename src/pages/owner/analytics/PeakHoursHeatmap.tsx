import { Fragment } from "react";
import { peakHours } from "./mockAnalytics";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function PeakHoursHeatmap() {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[720px]">
        <div className="grid gap-1" style={{ gridTemplateColumns: "48px repeat(24, minmax(0, 1fr))" }}>
          <div />
          {Array.from({ length: 24 }, (_, h) => (
            <div key={h} className="text-[10px] text-muted-foreground text-center">
              {h % 3 === 0 ? `${h}` : ""}
            </div>
          ))}
          {peakHours.map((row, d) => (
            <Fragment key={d}>
              <div className="text-xs text-muted-foreground flex items-center">
                {DAYS[d]}
              </div>
              {row.map((v, h) => (
                <div
                  key={`${d}-${h}`}
                  className="aspect-square rounded-sm"
                  style={{ backgroundColor: `hsl(243, 75%, ${95 - v * 55}%)` }}
                  title={`${DAYS[d]} ${h}:00 — ${Math.round(v * 100)}%`}
                />
              ))}
            </Fragment>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <span>Less</span>
          {[0.1, 0.3, 0.5, 0.7, 0.95].map((v) => (
            <div
              key={v}
              className="h-3 w-6 rounded-sm"
              style={{ backgroundColor: `hsl(243, 75%, ${95 - v * 55}%)` }}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

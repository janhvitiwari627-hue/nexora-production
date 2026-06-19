import { funnel } from "./mockAnalytics";

export function ConversionFunnel() {
  const max = funnel[0].value;
  return (
    <div className="space-y-3">
      {funnel.map((step, i) => {
        const pct = (step.value / max) * 100;
        const conv = i > 0 ? ((step.value / funnel[i - 1].value) * 100).toFixed(1) : null;
        return (
          <div key={step.label} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{step.label}</span>
              <span className="text-muted-foreground">
                {step.value.toLocaleString()}
                {conv && <span className="ml-2 text-xs">({conv}%)</span>}
              </span>
            </div>
            <div className="h-9 rounded-md bg-muted overflow-hidden">
              <div
                className="h-full flex items-center justify-end pr-3 text-xs font-medium text-white"
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, hsl(243, 75%, 59%), hsl(280, 70%, 60%))`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

import { useState } from "react";
import { Copy, Check, Tag } from "lucide-react";
import { mockOffers } from "../mockDashboard";

function daysLeft(iso: string) {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000));
}

export function ExclusiveOffersSection() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (code: string) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied((c) => (c === code ? null : c)), 1500);
  };

  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <Tag className="h-4 w-4 text-emerald-600" />
        Exclusive Offers
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {mockOffers.map((o) => (
          <div
            key={o.id}
            className="group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-emerald-50 to-teal-50 p-4 shadow-sm dark:from-emerald-950/40 dark:to-teal-950/40"
          >
            <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-emerald-400/20 blur-2xl" />
            <div className="relative flex items-start justify-between gap-2">
              <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-black text-white">
                {o.discountLabel}
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground">
                {daysLeft(o.validUntil)}d left
              </span>
            </div>
            <h3 className="relative mt-3 text-sm font-bold">{o.title}</h3>
            <p className="relative mt-0.5 text-xs text-muted-foreground">{o.description}</p>
            <button
              type="button"
              onClick={() => copy(o.code)}
              className="relative mt-3 flex w-full items-center justify-between rounded-lg border border-dashed border-emerald-500/50 bg-white/70 px-3 py-2 text-xs font-bold backdrop-blur transition hover:bg-white dark:bg-black/30 dark:hover:bg-black/50"
            >
              <span className="tracking-wider">{o.code}</span>
              {copied === o.code ? (
                <span className="inline-flex items-center gap-1 text-emerald-600">
                  <Check className="h-3.5 w-3.5" /> Copied
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-primary">
                  <Copy className="h-3.5 w-3.5" /> Copy
                </span>
              )}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

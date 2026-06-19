import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { cn } from "@/lib/utils";
import { WalletBalanceHero } from "./wallet/WalletBalanceHero";
import { BalanceTabs } from "./wallet/BalanceTabs";
import { TransactionList } from "./wallet/TransactionList";
import { RefundStatusTracker } from "./wallet/RefundStatusTracker";
import { mockTxns, type WalletBucket, type TxnType } from "./wallet/mockWallet";

const TYPE_OPTS: { id: TxnType | "all"; label: string }[] = [
  { id: "all", label: "All Types" },
  { id: "credit", label: "Credits" },
  { id: "debit", label: "Debits" },
  { id: "refund", label: "Refunds" },
];

const RANGE_OPTS: { id: "7d" | "30d" | "90d" | "all"; label: string; days: number }[] = [
  { id: "7d", label: "7 Days", days: 7 },
  { id: "30d", label: "30 Days", days: 30 },
  { id: "90d", label: "90 Days", days: 90 },
  { id: "all", label: "All Time", days: 9999 },
];

export function WalletPage() {
  const [bucket, setBucket] = useState<WalletBucket | "all">("all");
  const [type, setType] = useState<TxnType | "all">("all");
  const [range, setRange] = useState<(typeof RANGE_OPTS)[number]["id"]>("30d");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const days = RANGE_OPTS.find((r) => r.id === range)!.days;
    const cutoff = Date.now() - days * 86400000;
    const q = query.trim().toLowerCase();
    return mockTxns.filter(
      (t) =>
        (bucket === "all" || t.bucket === bucket) &&
        (type === "all" || t.type === type) &&
        new Date(t.dateISO).getTime() >= cutoff &&
        (!q || t.description.toLowerCase().includes(q)),
    );
  }, [bucket, type, range, query]);

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 sm:py-10">
        <WalletBalanceHero />
        <BalanceTabs active={bucket} onChange={setBucket} />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <section className="space-y-4">
            <header className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold">Transactions</h2>
              <div className="relative w-56">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search transactions…"
                  className="w-full rounded-full border border-border bg-card py-2 pr-3 pl-9 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </header>

            <div className="flex flex-wrap gap-2">
              {TYPE_OPTS.map((o) => (
                <Pill key={o.id} active={type === o.id} onClick={() => setType(o.id)}>
                  {o.label}
                </Pill>
              ))}
              <span className="mx-1 h-6 w-px self-center bg-border" />
              {RANGE_OPTS.map((o) => (
                <Pill key={o.id} active={range === o.id} onClick={() => setRange(o.id)}>
                  {o.label}
                </Pill>
              ))}
            </div>

            <TransactionList items={filtered} />
          </section>

          <RefundStatusTracker />
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-heading",
      )}
    >
      {children}
    </button>
  );
}

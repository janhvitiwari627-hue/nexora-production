import { ArrowDownLeft, ArrowUpRight, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WalletTxn, TxnType } from "./mockWallet";

const ICONS: Record<TxnType, { Icon: typeof ArrowUpRight; classes: string; sign: string }> = {
  credit: { Icon: ArrowDownLeft, classes: "bg-emerald-100 text-emerald-600", sign: "+" },
  debit: { Icon: ArrowUpRight, classes: "bg-rose-100 text-rose-600", sign: "−" },
  refund: { Icon: RefreshCcw, classes: "bg-indigo-100 text-indigo-600", sign: "+" },
};

const BUCKET_LABEL: Record<string, string> = {
  reward: "Reward",
  referral: "Referral",
  cashback: "Cashback",
};

export function TransactionList({ items }: { items: WalletTxn[] }) {
  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed bg-card/60 p-10 text-center text-sm text-muted-foreground">
        No transactions match your filters.
      </div>
    );
  }
  return (
    <ul className="divide-y rounded-2xl border bg-card shadow-sm">
      {items.map((t) => {
        const cfg = ICONS[t.type];
        return (
          <li key={t.id} className="flex items-center gap-3 p-4">
            <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full", cfg.classes)}>
              <cfg.Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{t.description}</p>
              <p className="text-[11px] text-muted-foreground">
                {new Date(t.dateISO).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}{" "}
                · {BUCKET_LABEL[t.bucket]}
              </p>
            </div>
            <span
              className={cn(
                "shrink-0 font-black",
                t.type === "debit" ? "text-rose-600" : "text-emerald-600",
              )}
            >
              {cfg.sign}₹{t.amount.toLocaleString("en-IN")}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

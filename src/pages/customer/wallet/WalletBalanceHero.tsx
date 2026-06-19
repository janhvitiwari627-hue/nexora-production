import { Wallet, Plus, ArrowDownToLine } from "lucide-react";
import { mockWallet } from "./mockWallet";

export function WalletBalanceHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,oklch(0.32_0.18_265),oklch(0.24_0.16_280)_55%,oklch(0.20_0.10_250))] p-6 text-white shadow-[var(--shadow-float)] sm:p-8">
      <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-indigo-400/30 blur-3xl" />
      <div className="absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-fuchsia-400/20 blur-3xl" />

      <div className="relative flex flex-wrap items-end justify-between gap-5">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur">
            <Wallet className="h-3.5 w-3.5" /> Nexora Wallet
          </span>
          <h1 className="mt-3 text-5xl font-black tracking-tight sm:text-6xl">
            ₹{mockWallet.total.toLocaleString("en-IN")}
          </h1>
          <p className="mt-1 text-sm opacity-80">Available across all credit buckets</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-4 py-2.5 text-sm font-bold text-indigo-900 transition hover:bg-white"
          >
            <Plus className="h-4 w-4" /> Add Money
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/40 px-4 py-2.5 text-sm font-bold transition hover:bg-white/10"
          >
            <ArrowDownToLine className="h-4 w-4" /> Withdraw
          </button>
        </div>
      </div>
    </section>
  );
}

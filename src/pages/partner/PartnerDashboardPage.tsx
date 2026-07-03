import { motion } from "framer-motion";
import {
  ArrowUpRight,
  IndianRupee,
  LayoutDashboard,
  LineChart,
  Store,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { PartnerPageShell } from "./PartnerAppLayout";

const STATS = [
  { icon: Store, label: "Onboarded Shops", value: "24", delta: "+3 this week" },
  { icon: IndianRupee, label: "This Month", value: "₹38,200", delta: "+18%" },
  { icon: LineChart, label: "Active Rate", value: "92%", delta: "+4%" },
  { icon: Wallet, label: "Next Payout", value: "₹12,480", delta: "Fri" },
];

const RECENT = [
  { name: "Glow Studio", area: "Malviya Nagar", status: "Active", value: "₹2,100" },
  { name: "The Barber Loft", area: "C-Scheme", status: "Active", value: "₹1,650" },
  { name: "Blush Salon", area: "Vaishali", status: "Onboarding", value: "—" },
  { name: "Nailed It", area: "Jagatpura", status: "Active", value: "₹980" },
];

export function PartnerDashboardPage() {
  return (
    <PartnerPageShell
      title="Dashboard"
      subtitle="Aapke district ki growth ek jagah."
      icon={LayoutDashboard}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
          >
            <div className="flex items-center justify-between">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#EEF2FF] text-[#4F46E5]">
                <s.icon className="h-4 w-4" />
              </div>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#22C55E]">
                <TrendingUp className="h-3 w-3" /> {s.delta}
              </span>
            </div>
            <div className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {s.label}
            </div>
            <div className="mt-1 text-2xl font-black text-[#0B1330]">{s.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#0B1330]">Onboarding trend</h3>
              <p className="text-xs text-slate-500">Last 7 days</p>
            </div>
            <span className="text-xs font-bold text-[#22C55E]">+18%</span>
          </div>
          <div className="mt-6 flex h-40 items-end gap-2">
            {[35, 55, 40, 70, 60, 85, 95].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: 0.2 + i * 0.06, duration: 0.6, ease: "easeOut" }}
                className="flex-1 rounded-lg bg-gradient-to-t from-[#4F46E5] to-[#6366F1]"
              />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#0B1330]">Recent shops</h3>
            <a href="/partner/shops" className="inline-flex items-center gap-1 text-xs font-bold text-[#4F46E5]">
              View all <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
          <ul className="mt-4 divide-y divide-slate-100">
            {RECENT.map((r) => (
              <li key={r.name} className="flex items-center justify-between py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-[#0B1330]">{r.name}</div>
                  <div className="text-xs text-slate-500">{r.area}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-[#0B1330]">{r.value}</div>
                  <div
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      r.status === "Active" ? "text-[#22C55E]" : "text-amber-500"
                    }`}
                  >
                    {r.status}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PartnerPageShell>
  );
}

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  Clock,
  IndianRupee,
  LayoutDashboard,
  LineChart,
  Store,
  TrendingUp,
  Trophy,
  Wallet,
  Zap,
} from "lucide-react";
import type { ComponentType } from "react";
import { PartnerPageShell } from "./PartnerAppLayout";

type Kpi = {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  delta?: string;
  tone?: "indigo" | "green" | "amber" | "sky";
};

const KPIS: Kpi[] = [
  { icon: Store, label: "Total Shops Onboarded", value: "128", delta: "+6 this week", tone: "indigo" },
  { icon: BadgeCheck, label: "Verified Shops", value: "104", delta: "+4", tone: "green" },
  { icon: Zap, label: "Active Shops", value: "92", delta: "+3", tone: "green" },
  { icon: Clock, label: "Pending Shops", value: "24", delta: "In review", tone: "amber" },
  { icon: IndianRupee, label: "Today's Nexora Collection", value: "₹18,420", delta: "+12%", tone: "indigo" },
  { icon: IndianRupee, label: "Today's Partner Commission", value: "₹1,842", delta: "+12%", tone: "green" },
  { icon: LineChart, label: "This Week Commission", value: "₹12,480", delta: "6 days", tone: "sky" },
  { icon: Wallet, label: "Pending Balance", value: "₹4,220", delta: "Clearing", tone: "amber" },
  { icon: Wallet, label: "Available Balance", value: "₹8,260", delta: "Withdrawable", tone: "green" },
  { icon: CalendarClock, label: "Next Auto Payout", value: "Fri, 07 Jul", delta: "Auto", tone: "indigo" },
  { icon: Trophy, label: "Lifetime Earnings", value: "₹2,84,700", delta: "All-time", tone: "sky" },
  { icon: BadgeCheck, label: "Milestone Progress", value: "92 / 100", delta: "Tablet reward", tone: "amber" },
];

const TONE: Record<NonNullable<Kpi["tone"]>, { chip: string; icon: string; delta: string }> = {
  indigo: { chip: "bg-[#EEF2FF]", icon: "text-[#4F46E5]", delta: "text-[#4F46E5]" },
  green: { chip: "bg-[#DCFCE7]", icon: "text-[#16A34A]", delta: "text-[#16A34A]" },
  amber: { chip: "bg-[#FEF3C7]", icon: "text-[#B45309]", delta: "text-[#B45309]" },
  sky: { chip: "bg-[#DBEAFE]", icon: "text-[#1D4ED8]", delta: "text-[#1D4ED8]" },
};

const MILESTONES = [
  { count: 25, reward: "Welcome Kit", done: true },
  { count: 50, reward: "T-Shirt", done: true },
  { count: 100, reward: "Tablet", done: false, current: true },
  { count: 500, reward: "Laptop", done: false },
  { count: 1000, reward: "Car + DBP", done: false },
];

export function PartnerDashboardPage() {
  const progressPct = 92;

  return (
    <PartnerPageShell
      title="Dashboard"
      subtitle="Aapke district ki growth ek jagah."
      icon={LayoutDashboard}
    >
      {/* KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {KPIS.map((s, i) => {
          const t = TONE[s.tone ?? "indigo"];
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
            >
              <div className="flex items-center justify-between">
                <div className={`grid h-9 w-9 place-items-center rounded-xl ${t.chip} ${t.icon}`}>
                  <s.icon className="h-4 w-4" />
                </div>
                {s.delta && (
                  <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold ${t.delta}`}>
                    <TrendingUp className="h-3 w-3" /> {s.delta}
                  </span>
                )}
              </div>
              <div className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {s.label}
              </div>
              <div className="mt-1 text-2xl font-black text-[#0B1330]">{s.value}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Milestone progress + trend */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#0B1330]">Milestone progress</h3>
              <p className="text-xs text-slate-500">Next reward: Tablet at 100 active shops</p>
            </div>
            <span className="text-xs font-bold text-[#4F46E5]">{progressPct}%</span>
          </div>
          <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6]"
            />
          </div>
          <div className="mt-6 grid grid-cols-5 gap-3">
            {MILESTONES.map((m) => (
              <div
                key={m.count}
                className={`rounded-xl border p-3 text-center ${
                  m.done
                    ? "border-[#16A34A]/30 bg-[#DCFCE7]"
                    : m.current
                    ? "border-[#4F46E5]/40 bg-[#EEF2FF]"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="text-lg font-black text-[#0B1330]">{m.count}</div>
                <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {m.reward}
                </div>
                {m.done && (
                  <CheckCircle2 className="mx-auto mt-1.5 h-3.5 w-3.5 text-[#16A34A]" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#0B1330]">Onboarding trend</h3>
              <p className="text-xs text-slate-500">Last 7 days</p>
            </div>
            <a href="/partner/shops" className="inline-flex items-center gap-1 text-xs font-bold text-[#4F46E5]">
              View all <ArrowUpRight className="h-3 w-3" />
            </a>
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
      </div>
    </PartnerPageShell>
  );
}

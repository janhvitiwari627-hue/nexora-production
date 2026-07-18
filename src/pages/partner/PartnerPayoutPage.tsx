import { motion } from "framer-motion";
import { ArrowDownToLine, Building2, CalendarClock, CheckCircle2, Clock, CircleDollarSign, Download, Info, Landmark, ShieldAlert, Wallet } from "lucide-react";
import { PartnerPageShell } from "./PartnerAppLayout";

const HISTORY = [
  { date: "28 Jun 2026", cycle: "Week 26", amount: "₹12,480", ref: "PYT-2606", status: "Paid" },
  { date: "21 Jun 2026", cycle: "Week 25", amount: "₹9,840", ref: "PYT-2605", status: "Paid" },
  { date: "14 Jun 2026", cycle: "Week 24", amount: "₹11,210", ref: "PYT-2604", status: "Paid" },
  { date: "07 Jun 2026", cycle: "Week 23", amount: "₹8,300", ref: "PYT-2603", status: "Paid" },
];

const RULES = [
  { icon: CircleDollarSign, text: "Commission daily calculate hoti hai." },
  { icon: CalendarClock, text: "Eligible balance har 7 days me auto payout hoti hai." },
  { icon: Wallet, text: "Available balance ka withdrawal request kabhi bhi kar sakte ho." },
  { icon: ShieldAlert, text: "Fraud / refund / suspicious transactions payout se pehle hold hoti hain." },
];

export function PartnerPayoutPage() {
  return (
    <PartnerPageShell
      title="Payout"
      subtitle="Weekly transparent payouts aur withdrawal control."
      icon={Wallet}
    >
      {/* Balance summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <BalanceCard icon={Wallet} label="Available Balance" value="₹8,260" tone="green" />
        <BalanceCard icon={Clock} label="Pending Balance" value="₹4,220" tone="indigo" />
        <BalanceCard icon={ShieldAlert} label="Held Amount" value="₹378" tone="amber" />
        <BalanceCard icon={CalendarClock} label="This Week Payout" value="₹12,480" tone="sky" />
      </div>

      {/* Main action + next payout */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-[#0B1330] to-[#1E1B4B] p-8 text-white">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white/70">
            <CalendarClock className="h-3.5 w-3.5" /> Next Auto Payout
          </div>
          <div className="mt-3 text-4xl font-black tracking-tight" style={{ letterSpacing: "-0.02em" }}>
            Fri, 07 Jul 2026
          </div>
          <div className="mt-2 text-sm text-white/70">Cycle: Mon 01 Jul → Sun 07 Jul</div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0B1330] transition-transform hover:-translate-y-0.5">
              <ArrowDownToLine className="h-4 w-4" /> Withdraw Now
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">
              <Download className="h-4 w-4" /> Download Statement
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
              <Landmark className="h-3.5 w-3.5" /> Bank Account
            </div>
            <div className="mt-3 text-sm font-bold text-[#0B1330]">HDFC Bank •••• 4271</div>
            <div className="text-xs text-slate-500">Rahul Verma · IFSC HDFC0001234</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
              <Building2 className="h-3.5 w-3.5" /> UPI ID
            </div>
            <div className="mt-3 text-sm font-bold text-[#0B1330]">rahul@ybl</div>
            <div className="text-xs text-slate-500">Verified · Default payout method</div>
          </div>
        </div>
      </div>

      {/* Rules */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-[#4F46E5]" />
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#4F46E5]">Payout Rules</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {RULES.map((r) => (
            <div key={r.text} className="flex items-start gap-3 rounded-xl bg-[#FAFBFF] p-4 ring-1 ring-slate-200/70">
              <r.icon className="mt-0.5 h-4 w-4 shrink-0 text-[#4F46E5]" />
              <span className="text-sm font-medium text-slate-700">{r.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <h3 className="text-base font-bold text-[#0B1330]">Payout History</h3>
          <button className="text-xs font-bold text-[#4F46E5]">View all</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[640px] w-full text-sm">
            <thead className="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Cycle</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {HISTORY.map((h, i) => (
                <motion.tr
                  key={h.ref}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <td className="px-4 py-3 text-slate-600">{h.date}</td>
                  <td className="px-4 py-3 text-slate-600">{h.cycle}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{h.ref}</td>
                  <td className="px-4 py-3 text-right font-bold text-[#0B1330]">{h.amount}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#DCFCE7] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#16A34A]">
                      <CheckCircle2 className="h-3 w-3" /> {h.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PartnerPageShell>
  );
}

function BalanceCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  tone: "green" | "indigo" | "amber" | "sky";
}) {
  const map = {
    green: { chip: "bg-[#DCFCE7]", icon: "text-[#16A34A]" },
    indigo: { chip: "bg-[#EEF2FF]", icon: "text-[#4F46E5]" },
    amber: { chip: "bg-[#FEF3C7]", icon: "text-[#B45309]" },
    sky: { chip: "bg-[#DBEAFE]", icon: "text-[#1D4ED8]" },
  };
  const t = map[tone];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className={`grid h-9 w-9 place-items-center rounded-xl ${t.chip} ${t.icon}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</div>
      <div className="mt-1 text-2xl font-black text-[#0B1330]">{value}</div>
    </div>
  );
}

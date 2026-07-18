import { motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  CircleDollarSign,
  GraduationCap,
  IndianRupee,
  MessageCircle,
  PlayCircle,
  QrCode,
  ShieldAlert,
  Sparkles,
  Store,
  Wallet,
} from "lucide-react";
import { PartnerPageShell } from "./PartnerAppLayout";

const MODULES = [
  { title: "Nexora Introduction", desc: "Platform overview aur mission.", icon: Sparkles, mins: 6, done: true },
  { title: "How to explain Nexora", desc: "30-second pitch aur objection handling.", icon: MessageCircle, mins: 8, done: true },
  { title: "Shop onboarding", desc: "KYC, business setup aur verification steps.", icon: Store, mins: 12, done: true },
  { title: "Website setup", desc: "Template selection aur go-live process.", icon: BookOpen, mins: 10, done: false, current: true },
  { title: "QR / payment process", desc: "Nexora QR activation aur collection flow.", icon: QrCode, mins: 7, done: false },
  { title: "Commission rules", desc: "Activation aur recurring growth share.", icon: IndianRupee, mins: 9, done: false },
  { title: "Payout rules", desc: "Weekly cycles, withdrawal aur holds.", icon: Wallet, mins: 6, done: false },
  { title: "Fraud policy", desc: "Suspicious activity aur reversal rules.", icon: ShieldAlert, mins: 8, done: false },
  { title: "Brand policy", desc: "Nexora brand usage guidelines.", icon: CircleDollarSign, mins: 5, done: false },
];

export function PartnerTrainingPage() {
  const completed = MODULES.filter((m) => m.done).length;
  const pct = Math.round((completed / MODULES.length) * 100);

  return (
    <PartnerPageShell
      title="Training Center"
      subtitle="Sales, pitch aur product training modules."
      icon={GraduationCap}
    >
      {/* Progress hero */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-[#0B1330]">Your training progress</h3>
            <p className="text-sm text-slate-500">
              {completed} of {MODULES.length} modules complete
            </p>
          </div>
          <div className="text-2xl font-black text-[#4F46E5]">{pct}%</div>
        </div>
        <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6]"
          />
        </div>
      </div>

      {/* Modules */}
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {MODULES.map((m, i) => (
          <motion.div
            key={m.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`group rounded-2xl border p-6 transition-all hover:-translate-y-1 hover:shadow-md ${
              m.current
                ? "border-[#4F46E5]/40 bg-gradient-to-br from-white to-[#EEF2FF]"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#EEF2FF] text-[#4F46E5]">
                <m.icon className="h-5 w-5" />
              </div>
              {m.done ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#DCFCE7] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#16A34A]">
                  <CheckCircle2 className="h-3 w-3" /> Done
                </span>
              ) : m.current ? (
                <span className="rounded-full bg-[#EEF2FF] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#4F46E5]">
                  In progress
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Locked
                </span>
              )}
            </div>
            <h4 className="mt-5 text-base font-bold tracking-tight text-[#0B1330]">{m.title}</h4>
            <p className="mt-1 text-sm text-slate-600">{m.desc}</p>
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs font-bold text-slate-500">{m.mins} min</span>
              <button className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4F46E5]">
                <PlayCircle className="h-3.5 w-3.5" />
                {m.done ? "Re-watch" : m.current ? "Continue" : "Start"}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </PartnerPageShell>
  );
}

import { motion } from "framer-motion";
import { Award, BadgeCheck, CheckCircle2, Gift, Lock, Sparkles, Trophy } from "lucide-react";
import { PartnerPageShell } from "./PartnerAppLayout";

type RewardStatus =
  | "Locked"
  | "In Progress"
  | "Eligible"
  | "Under Verification"
  | "Approved"
  | "Delivered"
  | "Rejected";

const MILESTONES: {
  count: number;
  reward: string;
  icon: typeof Trophy;
  status: RewardStatus;
}[] = [
  { count: 25, reward: "Welcome Kit", icon: Gift, status: "Delivered" },
  { count: 50, reward: "Nexora T-Shirt", icon: BadgeCheck, status: "Delivered" },
  { count: 100, reward: "Tablet Reward", icon: Sparkles, status: "In Progress" },
  { count: 500, reward: "Branded Laptop", icon: Award, status: "Locked" },
  { count: 1000, reward: "DBP + Car", icon: Trophy, status: "Locked" },
];

const STATUS_TONE: Record<RewardStatus, string> = {
  Locked: "bg-slate-100 text-slate-500",
  "In Progress": "bg-[#EEF2FF] text-[#4F46E5]",
  Eligible: "bg-[#DBEAFE] text-[#1D4ED8]",
  "Under Verification": "bg-[#FEF3C7] text-[#B45309]",
  Approved: "bg-[#CCFBF1] text-[#0F766E]",
  Delivered: "bg-[#DCFCE7] text-[#16A34A]",
  Rejected: "bg-[#FEE2E2] text-[#B91C1C]",
};

const ACTIVE_SHOPS = 92;
const NEXT_MILESTONE =
  MILESTONES.find((m) => m.status === "In Progress" || m.status === "Eligible") ?? MILESTONES[0];
const PROGRESS = Math.min(100, Math.round((ACTIVE_SHOPS / NEXT_MILESTONE.count) * 100));

export function PartnerMilestonesPage() {
  return (
    <PartnerPageShell
      title="Milestones"
      subtitle="Tier unlocks, badges aur reward journey."
      icon={Trophy}
    >
      {/* Hero progress */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-[#0B1330] to-[#1E1B4B] p-8 text-white">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70">
              Current Active Shops
            </div>
            <div
              className="mt-2 text-6xl font-black tracking-tight"
              style={{ letterSpacing: "-0.02em" }}
            >
              {ACTIVE_SHOPS}
            </div>
            <div className="mt-2 text-sm text-white/70">
              {NEXT_MILESTONE.count - ACTIVE_SHOPS} more active shops → {NEXT_MILESTONE.reward}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70">
              Next Milestone
            </div>
            <div className="mt-2 text-2xl font-black">{NEXT_MILESTONE.count} shops</div>
            <div className="text-sm text-white/70">{NEXT_MILESTONE.reward}</div>
          </div>
        </div>

        <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${PROGRESS}%` }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-[#22C55E] to-[#4F46E5]"
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-white/60">
          <span>0</span>
          <span className="font-bold text-white">{PROGRESS}% complete</span>
          <span>{NEXT_MILESTONE.count}</span>
        </div>
      </div>

      {/* Milestone timeline */}
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {MILESTONES.map((m, i) => {
          const locked = m.status === "Locked";
          return (
            <motion.div
              key={m.count}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`relative overflow-hidden rounded-2xl border p-6 ${
                locked
                  ? "border-slate-200 bg-slate-50"
                  : "border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`grid h-11 w-11 place-items-center rounded-xl ${
                    locked ? "bg-slate-200 text-slate-400" : "bg-[#EEF2FF] text-[#4F46E5]"
                  }`}
                >
                  {locked ? <Lock className="h-5 w-5" /> : <m.icon className="h-5 w-5" />}
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${STATUS_TONE[m.status]}`}
                >
                  {m.status}
                </span>
              </div>
              <div
                className="mt-5 text-3xl font-black tracking-tight text-[#0B1330]"
                style={{ letterSpacing: "-0.02em" }}
              >
                {m.count}
              </div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Active Shops
              </div>
              <div className="mt-3 text-sm font-bold text-[#0B1330]">{m.reward}</div>

              {m.status === "Delivered" && (
                <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#16A34A]">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Received
                </div>
              )}
              {m.status === "In Progress" && (
                <button className="mt-4 inline-flex text-xs font-bold text-[#4F46E5]">
                  {ACTIVE_SHOPS} / {m.count} shops →
                </button>
              )}
              {m.status === "Eligible" && (
                <button className="mt-4 inline-flex rounded-lg bg-[#0B1330] px-3 py-1.5 text-xs font-bold text-white">
                  Claim reward
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </PartnerPageShell>
  );
}

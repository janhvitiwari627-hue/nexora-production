import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { CalendarPlus, QrCode, Gift, UserPlus, Crown } from "lucide-react";

const actions = [
  { label: "Book Service", icon: CalendarPlus, to: "/search", color: "from-indigo-500 to-violet-500" },
  { label: "Scan QR", icon: QrCode, to: "/dashboard", color: "from-sky-500 to-cyan-500" },
  { label: "Redeem Rewards", icon: Gift, to: "/dashboard", color: "from-amber-500 to-orange-500" },
  { label: "Invite Friends", icon: UserPlus, to: "/referrals", color: "from-rose-500 to-pink-500" },
  { label: "Membership", icon: Crown, to: "/membership", color: "from-fuchsia-500 to-purple-500" },
] as const;

export function QuickActionsRow() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {actions.map(({ label, icon: Icon, to, color }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          whileHover={{ scale: 1.04 }}
          className="group"
        >
          <Link
            to={to}
            className="flex h-full flex-col items-center justify-center gap-2 rounded-2xl border bg-card p-4 text-center shadow-sm transition-shadow hover:shadow-lg"
          >
            <div
              className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${color} text-white shadow-md transition-shadow group-hover:shadow-[0_8px_30px_rgba(99,102,241,0.35)]`}
            >
              <Icon className="h-6 w-6" />
            </div>
            <span className="text-xs font-semibold sm:text-sm">{label}</span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

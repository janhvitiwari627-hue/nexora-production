import { Star, Wallet, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { mockUser, tierGradient } from "../mockUser";
import { useAuthStore } from "@/stores/authStore";
import { getCustomerAvatarUrl } from "@/lib/customer-avatar";

function computeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

export function ProfileHeaderWidget() {
  const [greeting, setGreeting] = useState<string | null>(null);
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);

  useEffect(() => {
    setGreeting(computeGreeting());
  }, []);

  const displayName =
    profile?.full_name ||
    profile?.username ||
    (user?.email ? user.email.split("@")[0] : user ? "Member" : "Guest");
  const avatar = user
    ? getCustomerAvatarUrl({
        avatarUrl: profile?.avatar_url,
        gender: profile?.gender,
        defaultAvatarKey: profile?.default_avatar_key,
      })
    : mockUser.avatar;
  const initials =
    displayName
      .split(" ")
      .map((s) => s[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-3xl border bg-card p-5 shadow-sm sm:grid-cols-[auto_minmax(0,1fr)_auto]"
    >
      {avatar ? (
        <img
          src={avatar}
          alt={displayName}
          className="h-[60px] w-[60px] shrink-0 rounded-full object-cover ring-2 ring-primary/30"
        />
      ) : (
        <div className="bg-gradient-cta grid h-[60px] w-[60px] shrink-0 place-items-center rounded-full text-lg font-bold text-primary-foreground ring-2 ring-primary/30">
          {initials}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground" suppressHydrationWarning>
          {greeting ?? "Welcome"},
        </p>
        <h1 className="truncate text-xl font-bold sm:text-2xl">{displayName}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${tierGradient[mockUser.tier]} px-3 py-1 text-xs font-semibold text-white shadow-sm`}
          >
            <Crown className="h-3.5 w-3.5" /> {mockUser.tier} Member
          </span>
        </div>
      </div>
      <div className="col-span-2 flex flex-wrap gap-2 sm:col-span-1">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-900 dark:bg-amber-500/15 dark:text-amber-300">
          <Star className="h-4 w-4 fill-current" />
          {mockUser.points.toLocaleString()} pts
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-300">
          <Wallet className="h-4 w-4" />₹{mockUser.walletBalance.toLocaleString()}
        </div>
      </div>
    </motion.div>
  );
}

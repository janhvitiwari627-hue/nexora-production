import { Link } from "@tanstack/react-router";
import { Crown, Gift, Sparkles, Users } from "lucide-react";

const ITEMS = [
  {
    icon: Gift,
    title: "Rewards",
    text: "Earned points, history and eligible benefits.",
    to: "/dashboard/rewards",
  },
  {
    icon: Users,
    title: "Refer friends",
    text: "Share your referral and track successful joins.",
    to: "/dashboard/referrals",
  },
  {
    icon: Crown,
    title: "Membership",
    text: "View current plan, benefits and membership rules.",
    to: "/dashboard/membership",
  },
] as const;

export function CustomerAppRewards() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
      <section className="rounded-3xl border border-[#d7a93b]/35 bg-[linear-gradient(135deg,#0b0a08_0%,#241b0d_62%,#9a6b16_100%)] p-7 text-white shadow-[0_22px_60px_rgba(53,38,11,0.2)]">
        <Sparkles className="h-8 w-8" />
        <p className="mt-10 text-sm font-bold text-[#f1cf73]">Nexora benefits</p>
        <h1 className="mt-2 text-3xl font-black">Rewards, referrals and membership.</h1>
        <p className="mt-3 text-sm leading-6 text-white/75">
          Eligible benefits आपके account और completed activity के आधार पर दिखाई देंगे.
        </p>
      </section>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {ITEMS.map((item) => (
          <Link
            key={item.title}
            to={item.to}
            className="rounded-2xl border border-[#e8e0d2] bg-white p-6 shadow-sm"
          >
            <item.icon className="h-6 w-6 text-[#9a6b16]" />
            <h2 className="mt-4 font-bold">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[#7a746a]">{item.text}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}

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
      <section className="rounded-3xl bg-gradient-to-br from-fuchsia-600 to-violet-800 p-7 text-white">
        <Sparkles className="h-8 w-8" />
        <p className="mt-10 text-sm font-bold text-violet-100">Nexora benefits</p>
        <h1 className="mt-2 text-3xl font-black">Rewards, referrals and membership.</h1>
        <p className="mt-3 text-sm leading-6 text-white/75">
          Eligible benefits आपके account और completed activity के आधार पर दिखाई देंगे.
        </p>
      </section>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {ITEMS.map((item) => (
          <Link key={item.title} to={item.to} className="rounded-2xl border bg-white p-6 shadow-sm">
            <item.icon className="h-6 w-6 text-violet-700" />
            <h2 className="mt-4 font-bold">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{item.text}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}

import { Link } from "@tanstack/react-router";
import {
  ChevronRight,
  Crown,
  Heart,
  LifeBuoy,
  LogIn,
  Settings,
  UserRound,
  Users,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

const LINKS = [
  { icon: Heart, label: "Favourite salons", to: "/dashboard/favorites" },
  { icon: Crown, label: "Membership", to: "/dashboard/membership" },
  { icon: Users, label: "Referral", to: "/dashboard/referrals" },
  { icon: LifeBuoy, label: "Support ticket", to: "/app/customer/support" },
  { icon: Settings, label: "Profile & settings", to: "/dashboard/settings" },
] as const;

export function CustomerAppProfile() {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);

  if (!user) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <LogIn className="mx-auto h-10 w-10 text-violet-700" />
        <h1 className="mt-4 text-2xl font-black">Login or create account</h1>
        <p className="mt-2 text-sm text-slate-500">
          Save favourites, manage bookings and access rewards.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/login"
            className="rounded-full bg-violet-700 px-5 py-2.5 text-sm font-bold text-white"
          >
            Login
          </Link>
          <Link to="/signup" className="rounded-full border bg-white px-5 py-2.5 text-sm font-bold">
            Signup
          </Link>
        </div>
      </main>
    );
  }

  const name = profile?.full_name || user.email?.split("@")[0] || "Nexora customer";
  return (
    <main className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <section className="flex items-center gap-4 rounded-3xl border bg-white p-6">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-violet-100 text-violet-700">
          <UserRound className="h-8 w-8" />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-black">{name}</h1>
          <p className="truncate text-sm text-slate-500">{user.email || profile?.mobile}</p>
        </div>
      </section>
      <div className="mt-6 overflow-hidden rounded-2xl border bg-white">
        {LINKS.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className="flex items-center gap-3 border-b p-4 last:border-b-0"
          >
            <item.icon className="h-5 w-5 text-violet-700" />
            <span className="flex-1 font-bold">{item.label}</span>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </Link>
        ))}
      </div>
    </main>
  );
}

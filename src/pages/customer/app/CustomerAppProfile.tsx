import { Link } from "@tanstack/react-router";
import { Camera, ChevronRight, Crown, Heart, LifeBuoy, LogIn, Settings, Users } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { CustomerAppInstallPanel } from "@/pages/customer/settings/CustomerAppInstallPanel";
import { CustomerAvatar } from "./CustomerAvatar";

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
        <LogIn className="mx-auto h-10 w-10 text-[#9a6b16]" />
        <h1 className="mt-4 text-2xl font-black">Login or create account</h1>
        <p className="mt-2 text-sm text-[#7a746a]">
          Save favourites, manage bookings and access rewards.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/login"
            className="rounded-full bg-[#0b0a08] px-5 py-2.5 text-sm font-bold text-[#f3cf70]"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="rounded-full border border-[#e8e0d2] bg-white px-5 py-2.5 text-sm font-bold"
          >
            Signup
          </Link>
        </div>
      </main>
    );
  }

  const currentProfile = profile?.id === user.id ? profile : null;
  const metadataName =
    typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name.trim() : "";
  const name =
    metadataName || currentProfile?.full_name || user.email?.split("@")[0] || "Nexora customer";
  return (
    <main className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <section className="flex items-center gap-4 rounded-3xl border border-[#e8e0d2] bg-white p-6 shadow-sm">
        <CustomerAvatar className="h-16 w-16 text-xl" iconClassName="h-8 w-8" />
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-black">{name}</h1>
          <p className="truncate text-sm text-[#7a746a]">{user.email || currentProfile?.mobile}</p>
          <p className="mt-1 truncate text-xs font-bold text-[#9a6b16]">
            Nexora member{currentProfile?.nexora_id ? ` · ID ${currentProfile.nexora_id}` : ""}
          </p>
          <p className="mt-1 text-xs capitalize text-[#7a746a]">
            {currentProfile?.gender
              ? `${currentProfile.gender} recommendations`
              : "Add gender for personalised salons"}
          </p>
        </div>
      </section>
      <Link
        to="/dashboard/settings"
        className="mt-3 flex items-center justify-center gap-2 rounded-2xl border border-[#e8e0d2] bg-white px-4 py-3 text-sm font-bold text-[#9a6b16]"
      >
        <Camera className="h-4 w-4" />
        {currentProfile?.avatar_url ? "Change profile photo" : "Choose profile photo"}
      </Link>
      <div className="mt-6">
        <CustomerAppInstallPanel />
      </div>
      <div className="mt-6 overflow-hidden rounded-2xl border border-[#e8e0d2] bg-white">
        {LINKS.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className="flex items-center gap-3 border-b p-4 last:border-b-0"
          >
            <item.icon className="h-5 w-5 text-[#9a6b16]" />
            <span className="flex-1 font-bold">{item.label}</span>
            <ChevronRight className="h-4 w-4 text-[#9b9489]" />
          </Link>
        ))}
      </div>
    </main>
  );
}

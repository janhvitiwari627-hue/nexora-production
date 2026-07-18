import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  ChevronRight,
  CircleHelp,
  Image,
  MessageSquareText,
  Scissors,
  Settings,
  Store,
  Users,
  UserRoundCog,
  WalletCards,
  WandSparkles,
} from "lucide-react";
import { useOwnerContext } from "@/hooks/use-owner-context";
import { useAuthStore } from "@/stores/authStore";

const MODULES = [
  {
    label: "Business profile",
    description: "Salon details, contact & branding",
    to: "/owner/settings",
    icon: Store,
  },
  {
    label: "Services",
    description: "Add, edit and remove services",
    to: "/owner/services",
    icon: Scissors,
  },
  { label: "Staff", description: "Team and availability", to: "/owner/staff", icon: UserRoundCog },
  { label: "Customers", description: "Customer list and history", to: "/owner/crm", icon: Users },
  {
    label: "Reviews",
    description: "Read and reply to reviews",
    to: "/owner/reviews",
    icon: MessageSquareText,
  },
  {
    label: "Payouts",
    description: "Withdrawals and settlement history",
    to: "/app/owner/wallet",
    icon: WalletCards,
  },
  {
    label: "Template selection",
    description: "Choose your shop template",
    to: "/owner/templates",
    icon: WandSparkles,
  },
  {
    label: "Gallery upload",
    description: "Salon photos and video",
    to: "/owner/gallery",
    icon: Image,
  },
  {
    label: "Analytics",
    description: "Bookings and revenue insights",
    to: "/owner/analytics",
    icon: BarChart3,
  },
  {
    label: "Settings",
    description: "Profile, security and notifications",
    to: "/dashboard/settings",
    icon: Settings,
  },
  {
    label: "Support",
    description: "Help centre and support ticket",
    to: "/app/owner/support",
    icon: CircleHelp,
  },
] as const;

export function OwnerAppProfile() {
  const profile = useAuthStore((state) => state.profile);
  const { activeSalon } = useOwnerContext();

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <section className="rounded-3xl bg-gradient-to-br from-violet-700 to-indigo-700 p-6 text-white">
        <p className="text-xs font-bold uppercase tracking-wider text-violet-200">Owner profile</p>
        <h1 className="mt-2 text-2xl font-black">{activeSalon?.name || "Your salon"}</h1>
        <p className="mt-1 text-sm text-violet-100">
          {profile?.full_name || "Salon owner"}
          {profile?.nexora_id ? ` · ID ${profile.nexora_id}` : ""}
        </p>
      </section>

      <div className="mt-5 overflow-hidden rounded-2xl border bg-white">
        {MODULES.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className="flex items-center gap-3 border-b p-4 last:border-b-0"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-700">
              <item.icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold">{item.label}</span>
              <span className="block truncate text-xs text-slate-500">{item.description}</span>
            </span>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </Link>
        ))}
      </div>
    </main>
  );
}

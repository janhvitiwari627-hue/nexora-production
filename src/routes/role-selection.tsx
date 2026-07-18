import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BriefcaseBusiness, Store, Target, Truck, UserRound } from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

const ROLES = [
  { icon: UserRound, title: "Customer", text: "Find salons and manage bookings.", to: "/login" },
  {
    icon: Store,
    title: "Shop Owner",
    text: "Manage salon setup, services and bookings.",
    to: "/owner-signup",
  },
  {
    icon: Target,
    title: "Growth Partner",
    text: "Onboard salons and track partner work.",
    to: "/growth-partner",
  },
  {
    icon: Truck,
    title: "Brand / Distributor",
    text: "Open the beauty trade portal.",
    to: "/portal",
  },
  {
    icon: BriefcaseBusiness,
    title: "Jobs",
    text: "Find jobs or hire beauty professionals.",
    to: "/jobs",
  },
] as const;

export const Route = createFileRoute("/role-selection")({
  head: () => ({ meta: [{ title: "Choose your Nexora app" }] }),
  component: RoleSelectionPage,
});

function RoleSelectionPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader />
      <main className="mx-auto max-w-5xl px-4 py-14 sm:py-20">
        <p className="text-sm font-bold text-violet-700">Login / Role Selection</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
          Aap Nexora kaise use karna chahte hain?
        </h1>
        <p className="mt-4 max-w-2xl text-slate-600">
          सही app चुनें. Login के बाद आपको केवल अपने role का dashboard दिखाई देगा.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {ROLES.map((role) => (
            <Link
              key={role.title}
              to={role.to}
              className="group rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md"
            >
              <role.icon className="h-7 w-7 text-violet-700" />
              <h2 className="mt-4 text-xl font-bold">{role.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{role.text}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-violet-700">
                Continue <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

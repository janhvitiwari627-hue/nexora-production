import {
  LayoutDashboard,
  Search,
  FileText,
  Settings,
  CreditCard,
  Crown,
  Gift,
  Megaphone,
  Users,
  Store,
  Bell,
  ShieldCheck,
  BarChart3,
} from "lucide-react";
import FadeIn from "../FadeIn";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Search, label: "Search" },
  { icon: FileText, label: "Reports" },
  { icon: CreditCard, label: "Payments" },
  { icon: Crown, label: "Memberships" },
  { icon: Gift, label: "Rewards" },
  { icon: Megaphone, label: "Advertisements" },
  { icon: Settings, label: "Settings" },
];

const stats = [
  { label: "Active Shops", value: "4,281", icon: Store, color: "bg-indigo-500" },
  { label: "Registered Users", value: "1,24,900", icon: Users, color: "bg-violet-500" },
  { label: "Monthly GMV", value: "₹9.2 Cr", icon: BarChart3, color: "bg-blue-500" },
  { label: "Pending Verifications", value: "86", icon: ShieldCheck, color: "bg-amber-500" },
];

export default function AdminPanel() {
  return (
    <section className="bg-white px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <FadeIn>
          <div className="mb-12 text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
              Admin Control Center
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Built to scale India's beauty economy.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500">
              One powerful back office to manage listings, payments, ads and growth
              across every city.
            </p>
          </div>
        </FadeIn>

        <FadeIn>
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-2xl shadow-indigo-900/10">
            <div className="grid lg:grid-cols-[240px_1fr]">
              {/* Sidebar */}
              <aside className="hidden bg-slate-900 p-5 lg:block">
                <div className="flex items-center gap-2 text-white">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
                    <LayoutDashboard className="h-4 w-4" />
                  </div>
                  <span className="font-bold">Nexora Admin</span>
                </div>
                <nav className="mt-8 space-y-1">
                  {sidebarItems.map((item) => (
                    <a
                      key={item.label}
                      href="#"
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                        item.active
                          ? "bg-indigo-600 text-white"
                          : "text-slate-400 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </a>
                  ))}
                </nav>
                <div className="mt-8 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-4 text-white">
                  <p className="text-xs opacity-80">Platform Health</p>
                  <p className="mt-1 text-2xl font-bold">99.98%</p>
                  <p className="mt-1 text-[10px] opacity-70">All systems operational</p>
                </div>
              </aside>

              {/* Main */}
              <div className="p-6 lg:p-8">
                {/* Top bar */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Dashboard</h3>
                    <p className="text-sm text-slate-500">Welcome back, Super Admin</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative hidden sm:block">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search anything..."
                        className="h-10 w-64 rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm text-slate-700 focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-50"
                      />
                    </div>
                    <button className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:text-indigo-700">
                      <Bell className="h-5 w-5" />
                      <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
                    </button>
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600" />
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color} text-white`}
                      >
                        <stat.icon className="h-5 w-5" />
                      </div>
                      <p className="mt-4 text-2xl font-bold text-slate-900">
                        {stat.value}
                      </p>
                      <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Content grid */}
                <div className="mt-6 grid gap-6 lg:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
                    <h4 className="font-bold text-slate-900">City Growth</h4>
                    <div className="mt-5 flex h-40 items-end justify-between gap-2">
                      {[35, 55, 42, 68, 74, 58, 82, 66, 90, 78, 85, 96].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t-md bg-indigo-100 transition-all hover:bg-indigo-300"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                    <div className="mt-3 flex justify-between text-xs text-slate-400">
                      <span>Jaipur</span>
                      <span>Delhi</span>
                      <span>Mumbai</span>
                      <span>Bangalore</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h4 className="font-bold text-slate-900">Quick Actions</h4>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {["Approve Shops", "Run Payouts", "Push Ads", "Export Data"].map(
                        (action) => (
                          <button
                            key={action}
                            className="rounded-xl border border-slate-200 bg-slate-50 py-3 text-xs font-bold text-slate-700 transition-colors hover:border-indigo-300 hover:text-indigo-700"
                          >
                            {action}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

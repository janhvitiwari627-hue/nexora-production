import {
  IndianRupee,
  CalendarCheck,
  Users,
  MessageSquare,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import FadeIn from "../FadeIn";

const kpis = [
  { label: "Revenue", value: "₹2,84,000", change: "+12.5%", up: true, icon: IndianRupee },
  { label: "Bookings", value: "1,248", change: "+8.2%", up: true, icon: CalendarCheck },
  { label: "Customers", value: "892", change: "+5.1%", up: true, icon: Users },
  { label: "Reviews", value: "4.9", change: "+0.3", up: true, icon: MessageSquare },
  { label: "Payouts", value: "₹1,92,400", change: "-2.4%", up: false, icon: Wallet },
];

const chartData = [45, 62, 38, 74, 56, 88, 72, 94, 68, 84, 58, 96];

const transactions = [
  { id: "#TRX-9821", customer: "Aanya Sharma", service: "Bridal Makeup", amount: "₹8,500", status: "Completed" },
  { id: "#TRX-9820", customer: "Rohit Meena", service: "Haircut + Beard", amount: "₹650", status: "Completed" },
  { id: "#TRX-9819", customer: "Priya Gupta", service: "Spa Therapy", amount: "₹2,400", status: "Upcoming" },
  { id: "#TRX-9818", customer: "Kunal Singh", service: "Tattoo Session", amount: "₹4,000", status: "Completed" },
];

export default function ShopOwnerDashboard() {
  return (
    <section id="dashboard" className="bg-slate-50 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <FadeIn>
          <div className="mb-12 text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
              For Shop Owners
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Your business command center.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500">
              Track revenue, manage bookings, and grow faster with Stripe-inspired
              analytics built for India's beauty industry.
            </p>
          </div>
        </FadeIn>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {kpis.map((kpi, i) => (
            <FadeIn key={kpi.label} delay={i * 0.06}>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <kpi.icon className="h-5 w-5" />
                  </div>
                  <span
                    className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-bold ${
                      kpi.up
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-rose-50 text-rose-600"
                    }`}
                  >
                    {kpi.up ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {kpi.change}
                  </span>
                </div>
                <p className="mt-4 text-2xl font-bold text-slate-900">{kpi.value}</p>
                <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Chart + Table */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <FadeIn className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Revenue Overview</h3>
                  <p className="text-sm text-slate-500">Monthly performance</p>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
                  <TrendingUp className="h-3.5 w-3.5" />
                  +22% YoY
                </div>
              </div>
              <div className="flex h-56 items-end justify-between gap-2">
                {chartData.map((h, i) => (
                  <div key={i} className="group relative flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-indigo-600 to-violet-500 transition-all duration-500 group-hover:from-indigo-500 group-hover:to-violet-400"
                      style={{ height: `${h}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between text-xs font-medium text-slate-400">
                <span>Jan</span>
                <span>Dec</span>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">Recent Transactions</h3>
              <div className="mt-5 space-y-4">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 transition-colors hover:bg-white hover:shadow-sm"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-400">{tx.id}</p>
                      <p className="text-sm font-bold text-slate-900">{tx.customer}</p>
                      <p className="text-xs text-slate-500">{tx.service}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">{tx.amount}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          tx.status === "Completed"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-5 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:border-indigo-300 hover:text-indigo-700">
                View all transactions
              </button>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

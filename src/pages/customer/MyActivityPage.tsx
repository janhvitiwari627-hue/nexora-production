import {
  Activity,
  CalendarHeart,
  HeartHandshake,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ACTIVITY_STATS,
  CATEGORY_SHARE,
  MONTHLY_SPEND,
  SERVICE_PREFS,
  TOP_SHOPS,
  VISIT_DAYS,
} from "./activity/mockActivity";

const fmtINR = (n: number) =>
  `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export function MyActivityPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Activity className="size-6 text-primary" /> My Activity
        </h1>
        <p className="text-sm text-muted-foreground">
          A look at how you use Nexora — your bookings, spending, and favourite places.
        </p>
      </header>

      {/* Stats */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
        <StatCard icon={CalendarHeart} label="Total Bookings" value={String(ACTIVITY_STATS.totalBookings)} tint="from-indigo-500 to-violet-500" />
        <StatCard icon={Wallet} label="Total Spending" value={fmtINR(ACTIVITY_STATS.totalSpending)} tint="from-emerald-500 to-teal-500" />
        <StatCard icon={Sparkles} label="Total Rewards" value={`${ACTIVITY_STATS.totalRewards} pts`} tint="from-amber-500 to-orange-500" />
        <StatCard icon={HeartHandshake} label="Favorite Category" value={ACTIVITY_STATS.favoriteCategory} tint="from-pink-500 to-rose-500" />
        <StatCard icon={TrendingUp} label="Visits This Month" value={String(ACTIVITY_STATS.visitsThisMonth)} tint="from-sky-500 to-cyan-500" />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Monthly Spending" subtitle="Last 12 months" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_SPEND} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => fmtINR(v)}
                />
                <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Category Breakdown" subtitle="By bookings">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={CATEGORY_SHARE} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {CATEGORY_SHARE.map((c) => <Cell key={c.name} fill={c.color} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Heatmap + Top shops */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Visit Heatmap" subtitle="This month" className="lg:col-span-2">
          <VisitHeatmap />
        </Card>

        <Card title="Top Favorite Shops" subtitle="By visits">
          <ul className="space-y-3">
            {TOP_SHOPS.map((s, i) => (
              <li key={s.id} className="flex items-center gap-3">
                <span className="grid place-items-center size-7 rounded-full bg-primary/10 text-primary font-bold text-sm">
                  {i + 1}
                </span>
                <img src={s.thumbnail} alt="" className="size-11 rounded-lg object-cover bg-muted" loading="lazy" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.visits} visits · {fmtINR(s.spend)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Service preferences */}
      <Card title="Service Preferences" subtitle="Top services you book">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={SERVICE_PREFS}
              layout="vertical"
              margin={{ top: 4, right: 20, left: 10, bottom: 0 }}
            >
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
              <YAxis dataKey="service" type="category" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} width={110} />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon, label, value, tint,
}: {
  icon: typeof Activity; label: string; value: string; tint: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <span className={`grid place-items-center size-9 rounded-lg text-white bg-gradient-to-br ${tint}`}>
        <Icon className="size-4" />
      </span>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground mt-3">{label}</p>
      <p className="text-lg font-bold text-foreground mt-0.5">{value}</p>
    </div>
  );
}

function Card({
  title, subtitle, children, className = "",
}: {
  title: string; subtitle?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-border bg-card p-4 sm:p-5 ${className}`}>
      <header className="mb-4">
        <h2 className="font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}

function VisitHeatmap() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthName = now.toLocaleString("en-IN", { month: "long", year: "numeric" });
  const firstDayOffset = new Date(year, month, 1).getDay(); // 0 = Sun
  const cells: Array<{ key: string; date?: string; count?: number; empty?: boolean }> = [];
  for (let i = 0; i < firstDayOffset; i++) cells.push({ key: `e${i}`, empty: true });
  for (const d of VISIT_DAYS) cells.push({ key: d.date, date: d.date, count: d.count });

  const intensity = (c: number) => {
    if (!c) return "bg-muted/60 text-muted-foreground";
    if (c === 1) return "bg-primary/25 text-foreground";
    if (c === 2) return "bg-primary/55 text-primary-foreground";
    return "bg-primary text-primary-foreground";
  };

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-2">{monthName}</p>
      <div className="grid grid-cols-7 gap-1 text-[10px] text-muted-foreground mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i} className="text-center">{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((c) =>
          c.empty ? (
            <span key={c.key} />
          ) : (
            <div
              key={c.key}
              title={`${c.date}: ${c.count} visit${c.count === 1 ? "" : "s"}`}
              className={`aspect-square rounded-md text-[10px] grid place-items-center font-medium ${intensity(c.count ?? 0)}`}
            >
              {Number(c.date!.slice(-2))}
            </div>
          ),
        )}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
        <span>Less</span>
        <span className="size-3 rounded bg-muted/60" />
        <span className="size-3 rounded bg-primary/25" />
        <span className="size-3 rounded bg-primary/55" />
        <span className="size-3 rounded bg-primary" />
        <span>More</span>
      </div>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Award,
  BadgeCheck,
  Building2,
  Calendar,
  Car,
  CheckCircle2,
  Clock,
  Crown,
  Gift,
  IndianRupee,
  Laptop,
  Lock,
  Medal,
  Shirt,
  Sparkles,
  Store,
  Tablet,
  Target,
  TrendingUp,
  Trophy,
  Wallet,
} from "lucide-react";

// ---------- MOCK DATA ----------
const PARTNER = {
  name: "Rajesh Kumar",
  district: "Mumbai West",
  joined: "Mar 2025",
  badge: "Growth Builder",
  hallRank: 7,
  districtRank: 1,
};

const STATS = {
  totalShops: 142,
  activeShops: 119,
  revenue: 1850000,
  nexoraEarnings: 185000,
  yourEarnings: 18500,
  pendingEarnings: 4200,
  weekPayout: 6800,
  monthPayout: 24500,
  lifetime: 142300,
};

const NEXT_MILESTONE = { current: 119, target: 500, label: "Platinum Growth Partner", reward: "Branded Laptop" };

const shopsGrowth = Array.from({ length: 12 }).map((_, i) => ({
  m: ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"][i],
  shops: 8 + i * 11 + (i % 2 ? 4 : 0),
  active: 6 + i * 9,
}));

const revenueTrend = Array.from({ length: 8 }).map((_, i) => ({
  w: `W${i + 1}`,
  revenue: 120000 + i * 28000 + (i % 3) * 18000,
  earnings: 1200 + i * 280,
}));

const monthlyPerf = Array.from({ length: 6 }).map((_, i) => ({
  m: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"][i],
  shops: 12 + i * 6,
  payout: 8500 + i * 3200,
}));

const leaderboard = {
  partners: [
    { name: "Vikas Singh", district: "Delhi North", shops: 487, earnings: 412000 },
    { name: "Anita Rao", district: "Bangalore South", shops: 421, earnings: 388000 },
    { name: "Mohammed Iqbal", district: "Hyderabad Central", shops: 376, earnings: 341000 },
    { name: "Priya Nair", district: "Kochi", shops: 318, earnings: 296000 },
    { name: "Suresh Patel", district: "Ahmedabad", shops: 287, earnings: 264000 },
  ],
  revenue: [
    { name: "Vikas Singh", value: "₹62L" },
    { name: "Anita Rao", value: "₹58L" },
    { name: "Mohammed Iqbal", value: "₹51L" },
    { name: "Priya Nair", value: "₹44L" },
  ],
  networks: [
    { name: "Delhi North", value: "487 shops" },
    { name: "Bangalore South", value: "421 shops" },
    { name: "Hyderabad Central", value: "376 shops" },
    { name: "Kochi", value: "318 shops" },
  ],
  growth: [
    { name: "Karan Mehta", value: "+82% MoM" },
    { name: "Sneha Joshi", value: "+71% MoM" },
    { name: "Imran Khan", value: "+65% MoM" },
    { name: "Divya Reddy", value: "+58% MoM" },
  ],
};

const milestoneTiers = [
  { shops: 25, label: "Welcome Tier", icon: Gift, reward: "Welcome Kit + Certificate" },
  { shops: 50, label: "Recognition Tier", icon: Shirt, reward: "Nexora T-Shirt + Badge" },
  { shops: 100, label: "Growth Builder", icon: Tablet, reward: "Tablet + Builder Badge" },
  { shops: 500, label: "Platinum Partner", icon: Laptop, reward: "Branded Laptop" },
  { shops: 1000, label: "District Business Partner", icon: Car, reward: "Car Reward + Hall of Fame" },
];

const rewardHistory = [
  { date: "12 Mar 2026", reward: "Tablet", milestone: "100 Active Shops", status: "Delivered" },
  { date: "05 Jan 2026", reward: "Nexora T-Shirt + Badge", milestone: "50 Active Shops", status: "Delivered" },
  { date: "18 Nov 2025", reward: "Welcome Kit + Certificate", milestone: "25 Active Shops", status: "Delivered" },
];

const hallOfFame = [
  { name: "Vikas Singh", district: "Delhi North", shops: 1247, revenue: "₹1.62Cr", story: "From local distributor to district authority in 14 months.", badge: "District Authority" },
  { name: "Anita Rao", district: "Bangalore South", shops: 1042, revenue: "₹1.41Cr", story: "Built India's strongest salon network across 18 zones.", badge: "Founder Recognition" },
  { name: "Mohammed Iqbal", district: "Hyderabad Central", shops: 876, revenue: "₹1.18Cr", story: "Transformed Hyderabad's beauty industry digitally.", badge: "Leadership Circle" },
];

// ---------- COMPONENT ----------
export function DistrictPartnerDashboardPage() {
  const progressPct = Math.min(100, Math.round((NEXT_MILESTONE.current / NEXT_MILESTONE.target) * 100));

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 md:p-6">
      {/* HEADER */}
      <header className="rounded-3xl border border-amber-200/60 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-6 dark:border-amber-900/40 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-rose-950/20 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-4 ring-amber-300/60">
              <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-lg font-bold text-white">
                {PARTNER.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold md:text-3xl">{PARTNER.name}</h1>
                <Badge className="bg-amber-600 hover:bg-amber-600"><Crown className="mr-1 h-3 w-3" />{PARTNER.badge}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{PARTNER.district} District · Joined {PARTNER.joined}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className="rounded-2xl border border-amber-200 bg-white/80 px-5 py-3 text-center backdrop-blur dark:border-amber-900/40 dark:bg-white/5">
              <div className="text-xs uppercase text-muted-foreground">Hall of Fame</div>
              <div className="mt-0.5 flex items-center justify-center gap-1 text-2xl font-extrabold text-amber-700 dark:text-amber-300"><Trophy className="h-5 w-5" />#{PARTNER.hallRank}</div>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-white/80 px-5 py-3 text-center backdrop-blur dark:border-amber-900/40 dark:bg-white/5">
              <div className="text-xs uppercase text-muted-foreground">District Rank</div>
              <div className="mt-0.5 flex items-center justify-center gap-1 text-2xl font-extrabold text-emerald-700 dark:text-emerald-300"><Medal className="h-5 w-5" />#{PARTNER.districtRank}</div>
            </div>
          </div>
        </div>
      </header>

      {/* KPI CARDS */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {[
          { l: "Total Shops Added", v: STATS.totalShops, icon: Store, tone: "text-blue-600" },
          { l: "Active Shops", v: STATS.activeShops, icon: CheckCircle2, tone: "text-emerald-600" },
          { l: "Revenue Generated", v: `₹${(STATS.revenue / 100000).toFixed(1)}L`, icon: TrendingUp, tone: "text-violet-600" },
          { l: "Nexora Earnings", v: `₹${(STATS.nexoraEarnings / 1000).toFixed(0)}k`, icon: Building2, tone: "text-orange-600" },
          { l: "Your Earnings", v: `₹${STATS.yourEarnings.toLocaleString("en-IN")}`, icon: IndianRupee, tone: "text-emerald-700", highlight: true },
          { l: "Pending Earnings", v: `₹${STATS.pendingEarnings.toLocaleString("en-IN")}`, icon: Clock, tone: "text-amber-600" },
          { l: "This Week Payout", v: `₹${STATS.weekPayout.toLocaleString("en-IN")}`, icon: Wallet, tone: "text-cyan-600" },
          { l: "This Month Payout", v: `₹${STATS.monthPayout.toLocaleString("en-IN")}`, icon: Calendar, tone: "text-rose-600" },
        ].map((k) => (
          <Card key={k.l} className={k.highlight ? "border-2 border-emerald-300 bg-emerald-50/40 dark:border-emerald-800 dark:bg-emerald-950/20" : ""}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{k.l}</p>
                  <p className={`mt-1 text-xl font-extrabold md:text-2xl ${k.tone}`}>{k.v}</p>
                </div>
                <k.icon className={`h-5 w-5 ${k.tone} opacity-70`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* LIFETIME + NEXT MILESTONE */}
      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-sm text-white/70"><Sparkles className="h-4 w-4" /> Lifetime Earnings</div>
            <div className="mt-2 text-4xl font-extrabold">₹{STATS.lifetime.toLocaleString("en-IN")}</div>
            <div className="mt-1 text-xs text-white/60">Across all milestones and growth share</div>
          </CardContent>
        </Card>
        <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 dark:border-amber-700 dark:from-amber-950/30 dark:to-orange-950/20 lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm text-amber-900 dark:text-amber-200"><Target className="h-4 w-4" /> Next Milestone</div>
                <div className="mt-1 text-2xl font-bold text-amber-900 dark:text-amber-100">{NEXT_MILESTONE.label}</div>
                <div className="text-sm text-amber-800/80 dark:text-amber-200/80">Reward: {NEXT_MILESTONE.reward}</div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-extrabold text-amber-700 dark:text-amber-300">{NEXT_MILESTONE.current}<span className="text-base text-muted-foreground">/{NEXT_MILESTONE.target}</span></div>
                <div className="text-xs text-muted-foreground">active shops</div>
              </div>
            </div>
            <Progress value={progressPct} className="mt-4 h-3" />
            <div className="mt-2 text-right text-xs text-muted-foreground">{NEXT_MILESTONE.target - NEXT_MILESTONE.current} more to unlock</div>
          </CardContent>
        </Card>
      </section>

      {/* CHARTS */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Active Shops Growth</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={shopsGrowth}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="m" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Area type="monotone" dataKey="shops" stroke="hsl(var(--primary))" fill="url(#g1)" />
                <Area type="monotone" dataKey="active" stroke="#10b981" fill="#10b98122" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Revenue & Earnings Trend</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="w" className="text-xs" />
                <YAxis yAxisId="left" className="text-xs" />
                <YAxis yAxisId="right" orientation="right" className="text-xs" />
                <Tooltip />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="earnings" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Monthly Performance</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyPerf}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="m" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="shops" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="payout" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Milestone Progress</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {milestoneTiers.map((t) => {
              const pct = Math.min(100, Math.round((STATS.activeShops / t.shops) * 100));
              const unlocked = STATS.activeShops >= t.shops;
              return (
                <div key={t.shops}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 font-medium">
                      {unlocked ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
                      {t.shops}+ Shops · {t.label}
                    </div>
                    <span className="text-xs text-muted-foreground">{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>

      {/* LEADERBOARD */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold"><Trophy className="h-5 w-5 text-amber-600" /> Leaderboard</h2>
        <Tabs defaultValue="partners">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="partners">Top Partners</TabsTrigger>
            <TabsTrigger value="revenue">Top Revenue</TabsTrigger>
            <TabsTrigger value="networks">Top Networks</TabsTrigger>
            <TabsTrigger value="growth">Top Growth</TabsTrigger>
          </TabsList>

          <TabsContent value="partners" className="mt-4">
            <Card><CardContent className="p-0">
              {leaderboard.partners.map((p, i) => (
                <div key={p.name} className="flex items-center justify-between border-b border-border p-4 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${i === 0 ? "bg-amber-500 text-white" : i === 1 ? "bg-slate-400 text-white" : i === 2 ? "bg-orange-600 text-white" : "bg-muted"}`}>#{i + 1}</div>
                    <div>
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.district}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{p.shops} shops</div>
                    <div className="text-xs text-emerald-600">₹{(p.earnings / 1000).toFixed(0)}k earned</div>
                  </div>
                </div>
              ))}
            </CardContent></Card>
          </TabsContent>

          {(["revenue", "networks", "growth"] as const).map((key) => (
            <TabsContent key={key} value={key} className="mt-4">
              <Card><CardContent className="p-0">
                {leaderboard[key].map((p, i) => (
                  <div key={p.name} className="flex items-center justify-between border-b border-border p-4 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${i === 0 ? "bg-amber-500 text-white" : "bg-muted"}`}>#{i + 1}</div>
                      <span className="font-semibold">{p.name}</span>
                    </div>
                    <span className="font-bold text-amber-700 dark:text-amber-300">{p.value}</span>
                  </div>
                ))}
              </CardContent></Card>
            </TabsContent>
          ))}
        </Tabs>
      </section>

      {/* REWARDS */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold"><Gift className="h-5 w-5 text-emerald-600" /> Rewards</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-emerald-600" /> Unlocked Rewards</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {milestoneTiers.filter((t) => STATS.activeShops >= t.shops).map((t) => (
                <div key={t.shops} className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white"><t.icon className="h-5 w-5" /></div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{t.reward}</div>
                    <div className="text-xs text-muted-foreground">{t.shops}+ shops · {t.label}</div>
                  </div>
                  <Badge variant="outline" className="border-emerald-600 text-emerald-700">Unlocked</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4 text-amber-600" /> Upcoming Rewards</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {milestoneTiers.filter((t) => STATS.activeShops < t.shops).map((t) => (
                <div key={t.shops} className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground"><t.icon className="h-5 w-5" /></div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{t.reward}</div>
                    <div className="text-xs text-muted-foreground">{t.shops - STATS.activeShops} more shops to unlock</div>
                  </div>
                  <Badge variant="outline">{t.shops}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-4">
          <CardHeader><CardTitle className="text-base">Reward History</CardTitle></CardHeader>
          <CardContent className="p-0">
            {rewardHistory.map((r) => (
              <div key={r.date} className="flex items-center justify-between border-b border-border p-4 last:border-0">
                <div>
                  <div className="font-semibold">{r.reward}</div>
                  <div className="text-xs text-muted-foreground">{r.milestone} · {r.date}</div>
                </div>
                <Badge className="bg-emerald-600 hover:bg-emerald-600">{r.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* HALL OF FAME */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold"><Trophy className="h-5 w-5 text-amber-600" /> Hall of Fame</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {hallOfFame.map((h, i) => (
            <Card key={h.name} className="relative overflow-hidden border-2 border-amber-200 dark:border-amber-900/40">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 opacity-20 blur-2xl" />
              <CardContent className="relative p-6 text-center">
                <Avatar className="mx-auto h-20 w-20 ring-4 ring-amber-300">
                  <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-xl font-bold text-white">
                    {h.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="mt-3 flex items-center justify-center gap-1 text-xs text-amber-600"><Trophy className="h-3.5 w-3.5" /> Rank #{i + 1}</div>
                <h3 className="mt-1 text-lg font-bold">{h.name}</h3>
                <p className="text-xs text-muted-foreground">{h.district}</p>
                <Badge className="mt-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-600"><Award className="mr-1 h-3 w-3" />{h.badge}</Badge>
                <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-lg bg-muted/50 p-2">
                    <div className="text-lg font-extrabold text-amber-700 dark:text-amber-300">{h.shops}</div>
                    <div className="text-[10px] uppercase text-muted-foreground">Shops</div>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-2">
                    <div className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300">{h.revenue}</div>
                    <div className="text-[10px] uppercase text-muted-foreground">Revenue</div>
                  </div>
                </div>
                <p className="mt-4 text-xs italic text-muted-foreground">"{h.story}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* DISCLOSURE */}
      <p className="rounded-2xl border border-border bg-muted/30 p-4 text-center text-xs text-muted-foreground">
        Dashboard shows revenue generated, Nexora earnings, partner earnings, payouts and milestones only. Internal shop/salon profit and private financial data is never exposed.
      </p>
    </div>
  );
}

export default DistrictPartnerDashboardPage;

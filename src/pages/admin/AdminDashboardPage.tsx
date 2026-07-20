import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ArrowRight,
  Ban,
  Briefcase,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Crown,
  IndianRupee,
  Loader2,
  MapPin,
  MessageSquare,
  Star,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  REVENUE_TREND,
  BOOKING_VOLUME,
  USER_GROWTH,
  PENDING_ACTIONS,
  RECENT_ACTIVITY,
  CITY_HEATMAP,
} from "./mockAdmin";
import { supabase } from "@/integrations/supabase/client";

const ICONS: Record<string, typeof CheckCircle2> = {
  Building2,
  Users,
  CalendarCheck,
  IndianRupee,
  Crown,
  AlertCircle,
  CheckCircle2,
  Ban,
  MessageSquare,
  XCircle,
  UserPlus,
};

export function AdminDashboardPage() {
  const kpiQ = useQuery({
    queryKey: ["admin", "dashboard-kpis"],
    queryFn: async () => {
      const head = { count: "exact" as const, head: true };
      const [users, salons, bookings, jobs, reviews, pendingOwners, pendingBookings, revenueRow] =
        await Promise.all([
          supabase.from("profiles").select("*", head),
          supabase.from("salons").select("*", head),
          supabase.from("bookings").select("*", head),
          supabase.from("jobs").select("*", head),
          supabase.from("reviews").select("*", head),
          supabase.from("owner_requests").select("*", head).eq("status", "pending"),
          supabase.from("bookings").select("*", head).eq("status", "pending"),
          supabase.from("payments").select("amount").eq("status", "SUCCESS"),
        ]);
      const revenue = (revenueRow.data ?? []).reduce((s, r) => s + Number(r.amount ?? 0), 0);
      return {
        users: users.count ?? 0,
        salons: salons.count ?? 0,
        bookings: bookings.count ?? 0,
        jobs: jobs.count ?? 0,
        reviews: reviews.count ?? 0,
        pendingOwners: pendingOwners.count ?? 0,
        pendingBookings: pendingBookings.count ?? 0,
        revenue,
      };
    },
    staleTime: 30_000,
  });

  const k = kpiQ.data;
  const KPIS = [
    { label: "Total Users", value: k?.users, icon: Users, color: "text-indigo-600" },
    { label: "Businesses", value: k?.salons, icon: Building2, color: "text-fuchsia-600" },
    { label: "Bookings", value: k?.bookings, icon: CalendarCheck, color: "text-emerald-600" },
    {
      label: "Revenue",
      value: k ? `₹${k.revenue.toLocaleString("en-IN")}` : undefined,
      icon: IndianRupee,
      color: "text-amber-600",
    },
    { label: "Active Jobs", value: k?.jobs, icon: Briefcase, color: "text-blue-600" },
    { label: "Reviews", value: k?.reviews, icon: Star, color: "text-rose-600" },
    { label: "Pending Owners", value: k?.pendingOwners, icon: UserPlus, color: "text-amber-600" },
    {
      label: "Pending Bookings",
      value: k?.pendingBookings,
      icon: AlertCircle,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Platform Overview</h1>
          <p className="text-sm text-muted-foreground">
            Live snapshot across all businesses and users.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/partner-applications">
              <UserPlus className="mr-1.5 h-4 w-4" />
              Partner Applications
            </Link>
          </Button>
          <Badge
            variant="secondary"
            className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
          >
            ● All systems normal
          </Badge>
        </div>
      </div>

      {/* KPIs — real counts */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        {KPIS.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              <div className="text-2xl font-bold mt-2">
                {kpiQ.isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  (kpi.value ?? "—")
                )}
              </div>
              <div className="text-xs text-muted-foreground">{kpi.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Revenue Trend (₹ Cr)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={REVENUE_TREND}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Booking Volume</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={BOOKING_VOLUME}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">User Growth</CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={USER_GROWTH}>
                <defs>
                  <linearGradient id="usrG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="hsl(var(--primary))"
                  fill="url(#usrG)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* City heatmap placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" /> City Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="rounded-md bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-dashed h-28 grid place-items-center text-xs text-muted-foreground">
              Google Maps heatmap (placeholder)
            </div>
            {CITY_HEATMAP.slice(0, 6).map((c) => (
              <div key={c.city} className="flex items-center gap-2 text-xs">
                <span className="w-20 truncate">{c.city}</span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-pink-500"
                    style={{ width: `${c.activity}%` }}
                  />
                </div>
                <span className="w-7 text-right tabular-nums">{c.activity}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Pending actions + activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" /> Pending Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {PENDING_ACTIONS.map((p) => (
              <Link
                key={p.label}
                to={p.to}
                className="flex items-center justify-between py-3 group hover:bg-muted/50 -mx-2 px-2 rounded transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      p.severity === "high"
                        ? "bg-red-500"
                        : p.severity === "medium"
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                    }`}
                  />
                  <span className="text-sm">{p.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{p.count}</Badge>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Activity</CardTitle>
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {RECENT_ACTIVITY.map((a) => {
              const Icon = ICONS[a.icon] || CheckCircle2;
              return (
                <div key={a.id} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted grid place-items-center shrink-0">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">
                      <b>{a.actor}</b> <span className="text-muted-foreground">{a.action}</span>{" "}
                      <span className="font-medium">{a.target}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{a.time}</div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

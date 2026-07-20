import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  Loader2,
  IndianRupee,
  CalendarCheck,
  Users,
  Repeat,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getMyOwnedSalons } from "@/lib/owner.functions";
import { getOwnerAnalytics } from "@/lib/analytics.functions";

const RANGES = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
];

function formatINR(v: number) {
  return `₹${new Intl.NumberFormat("en-IN").format(v)}`;
}

export function OwnerAnalyticsPage() {
  const fetchSalons = useServerFn(getMyOwnedSalons);
  const fetchAnalytics = useServerFn(getOwnerAnalytics);

  const [days, setDays] = useState(30);
  const [salonId, setSalonId] = useState<string | null>(null);

  const salonsQuery = useQuery({
    queryKey: ["owner", "salons"],
    queryFn: () => fetchSalons(),
  });

  const salons = salonsQuery.data ?? [];
  const activeSalonId = salonId ?? salons[0]?.salon?.id ?? null;

  const analyticsQuery = useQuery({
    queryKey: ["owner", "analytics", activeSalonId, days],
    queryFn: () => fetchAnalytics({ data: { salonId: activeSalonId!, days } }),
    enabled: !!activeSalonId,
  });

  const a = analyticsQuery.data;

  const kpis = useMemo(() => {
    if (!a) return [];
    return [
      { label: "Revenue", value: formatINR(a.kpis.revenue), icon: IndianRupee },
      { label: "Bookings", value: String(a.kpis.bookings), icon: CalendarCheck },
      { label: "New customers", value: String(a.kpis.newCustomers), icon: Users },
      { label: "Repeat rate", value: `${Math.round(a.kpis.repeatRate * 100)}%`, icon: Repeat },
    ];
  }, [a]);

  return (
    <div className="container mx-auto max-w-7xl space-y-6 px-4 py-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Live performance from bookings — revenue, bookings, and customer trends.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {salons.length > 1 ? (
            <Select value={activeSalonId ?? undefined} onValueChange={(v) => setSalonId(v)}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Choose salon" />
              </SelectTrigger>
              <SelectContent>
                {salons.map((s) =>
                  s.salon ? (
                    <SelectItem key={s.salon.id} value={s.salon.id}>
                      {s.salon.name}
                    </SelectItem>
                  ) : null,
                )}
              </SelectContent>
            </Select>
          ) : null}
          <div className="inline-flex rounded-lg border bg-card p-1">
            {RANGES.map((r) => (
              <button
                key={r.days}
                onClick={() => setDays(r.days)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  days === r.days ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {salonsQuery.isLoading ? (
        <div className="grid h-40 place-items-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : salons.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            No approved salons linked to your account yet.
          </CardContent>
        </Card>
      ) : analyticsQuery.isError ? (
        <Card>
          <CardContent className="p-6 text-sm text-rose-600">
            {(analyticsQuery.error as Error).message}
          </CardContent>
        </Card>
      ) : !a ? (
        <div className="grid h-40 place-items-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : (
        <>
          {/* AI summary */}
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="flex items-start gap-3 p-4">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  AI Summary
                </p>
                <p className="text-sm text-heading">
                  {a.aiSummary ?? "Not enough activity in this window to generate a summary yet."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* KPI tiles */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {kpis.map((k) => (
              <Card key={k.label}>
                <CardContent className="p-4">
                  <div className="mb-1 flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">{k.label}</div>
                    <k.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold">{k.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Completion / cancellation badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-600" />
              Completion {Math.round(a.kpis.completionRate * 100)}%
            </Badge>
            <Badge variant="outline" className="gap-1">
              <TrendingDown className="h-3 w-3 text-rose-600" />
              Cancellation {Math.round(a.kpis.cancellationRate * 100)}%
            </Badge>
          </div>

          {/* Revenue */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Revenue trend</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={a.revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip formatter={(v: number) => formatINR(v)} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(243, 75%, 59%)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Bookings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bookings per day</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={a.bookingsTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="bookings" fill="hsl(243, 75%, 59%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Customers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">New vs returning customers</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={a.customerTrend}>
                  <defs>
                    <linearGradient id="newG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(243, 75%, 59%)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="hsl(243, 75%, 59%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="retG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(280, 70%, 60%)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="hsl(280, 70%, 60%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area
                    type="monotone"
                    dataKey="new"
                    stroke="hsl(243, 75%, 59%)"
                    fill="url(#newG)"
                  />
                  <Area
                    type="monotone"
                    dataKey="returning"
                    stroke="hsl(280, 70%, 60%)"
                    fill="url(#retG)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top services */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top services by revenue</CardTitle>
            </CardHeader>
            <CardContent>
              {a.topServices.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No completed bookings in this window.
                </p>
              ) : (
                <div className="divide-y">
                  {a.topServices.map((s) => (
                    <div key={s.name} className="flex items-center justify-between py-2.5">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-heading">{s.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {s.bookings} booking{s.bookings === 1 ? "" : "s"}
                        </p>
                      </div>
                      <span className="font-mono text-sm font-semibold">
                        {formatINR(s.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

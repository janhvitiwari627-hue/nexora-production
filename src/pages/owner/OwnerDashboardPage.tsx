import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Settings,
  Upload,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  X,
  Plus,
  UserPlus,
  Tag,
  Share2,
  QrCode,
  BarChart3,
  Star,
  Reply,
  Trophy,
  Sparkles,
  Globe,
  UserCircle2,
  LayoutDashboard,
  Store,
  CalendarDays,
  Scissors,
  WalletCards,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useOwnerContext } from "@/hooks/use-owner-context";
import { useAuthStore } from "@/stores/authStore";
import {
  ownerDashboardMetricsQuery,
  ownerAnalyticsQuery,
  ownerBookingsQuery,
} from "@/lib/owner.queries";
import { updateOwnerBookingStatus, getMyOwnerApprovalStatus } from "@/lib/owner.functions";
import { getMyEventStats } from "@/lib/analytics-events.functions";
import {
  ownerBusiness,
  kpis as mockKpis,
  revenueDaily,
  revenueWeekly,
  revenueMonthly,
  calendarDensity,
  calendarFirstWeekday,
  calendarMonthLabel,
  recentBookings as mockRecentBookings,
  pendingApprovals as mockPending,
  customerInsights,
  topPerformer,
  recentReviews,
  type BookingStatus,
} from "./mockOwner";

const fmtINR = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const initials = (s: string) =>
  s
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "GU";
const fmtTime = (t: string | null | undefined) => {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hh = Number(h);
  const ampm = hh >= 12 ? "PM" : "AM";
  const h12 = ((hh + 11) % 12) + 1;
  return `${h12}:${m} ${ampm}`;
};

const BRAND = "#635BFF";

function TopBar({
  open,
  onToggle,
  showWebsiteActions = true,
}: {
  open: boolean;
  onToggle: (v: boolean) => void;
  showWebsiteActions?: boolean;
}) {
  return (
    <header className="border-b border-border bg-card/90">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3">
        {showWebsiteActions && (
          <label className="group relative grid h-11 w-11 cursor-pointer place-items-center overflow-hidden rounded-xl border border-dashed border-border bg-muted text-muted-foreground hover:border-primary hover:text-primary">
            <Upload className="h-4 w-4" />
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </label>
        )}
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-heading">{ownerBusiness.name}</div>
          <div className="text-xs text-muted-foreground">Owner Dashboard</div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium",
              open
                ? "border-success/30 bg-success/10 text-success"
                : "border-danger/30 bg-danger/10 text-danger",
            )}
          >
            <span className={cn("h-2 w-2 rounded-full", open ? "bg-success" : "bg-danger")} />
            {open ? "Open" : "Closed"}
            <Switch checked={open} onCheckedChange={onToggle} className="ml-1" />
          </div>
          {showWebsiteActions && (
            <>
              <Button variant="ghost" size="sm" className="hidden gap-1.5 md:inline-flex" asChild>
                <a href="/owner/templates">
                  <Globe className="h-4 w-4" /> Website
                </a>
              </Button>
              <Button variant="outline" size="sm" className="hidden gap-1.5 md:inline-flex" asChild>
                <a href="/owner/website">
                  <Settings className="h-4 w-4" /> Edit Website
                </a>
              </Button>
            </>
          )}
          {showWebsiteActions && (
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
            </Button>
          )}
          <Button variant="ghost" size="icon" aria-label="Settings" asChild>
            <a href="/dashboard/settings">
              <Settings className="h-5 w-5" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}

const OWNER_PORTAL_ITEMS = [
  {
    label: "Dashboard",
    description: "Aaj ki bookings aur earnings",
    to: "/owner/welcome",
    icon: LayoutDashboard,
  },
  {
    label: "Salon Setup",
    description: "Salon ki basic details update karein",
    to: "/owner/edit-shop",
    icon: Store,
  },
  {
    label: "Bookings",
    description: "Appointments confirm ya reject karein",
    to: "/owner/bookings",
    icon: CalendarDays,
  },
  {
    label: "Services",
    description: "Services, price aur duration manage karein",
    to: "/owner/services",
    icon: Scissors,
  },
  {
    label: "Wallet",
    description: "Earnings aur withdrawals dekhein",
    to: "/owner/payments",
    icon: WalletCards,
  },
  {
    label: "Settings",
    description: "Profile, security aur notifications",
    to: "/dashboard/settings",
    icon: Settings,
  },
] as const;

function OwnerPortalNavigation() {
  const navigate = useNavigate();

  return (
    <Card className="p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {OWNER_PORTAL_ITEMS.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => navigate({ to: item.to })}
            className="flex min-h-20 items-center gap-3 rounded-xl border border-border p-3 text-left transition hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <item.icon className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-heading">{item.label}</span>
              <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                {item.description}
              </span>
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
}

function KPICards() {
  const { activeSalonId } = useOwnerContext();
  const { data: m } = useQuery(ownerDashboardMetricsQuery(activeSalonId ?? ""));
  const liveKpis =
    m && activeSalonId
      ? [
          {
            label: "Today's Revenue",
            value: fmtINR(m.today.revenue),
            delta: 0,
            positive: true,
            suffix: `${m.today.count} bookings today`,
          },
          {
            label: "Today's Bookings",
            value: String(m.today.count),
            delta: 0,
            positive: true,
            suffix: "scheduled today",
          },
          {
            label: "Pending Approvals",
            value: String(m.pendingCount),
            delta: 0,
            positive: m.pendingCount === 0,
            suffix: "awaiting confirmation",
          },
          {
            label: "30-day Revenue",
            value: fmtINR(m.month.revenue),
            delta: 0,
            positive: true,
            suffix: `${m.month.count} bookings`,
          },
        ]
      : null;
  const data = liveKpis ?? mockKpis;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {data.map((k) => (
        <Card key={k.label} className="p-5">
          <div className="text-xs font-medium text-muted-foreground">{k.label}</div>
          <div className="mt-2 flex items-baseline justify-between gap-3">
            <div className="text-2xl font-bold text-heading">{k.value}</div>
            {k.delta !== 0 && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold",
                  k.positive ? "bg-success/10 text-success" : "bg-danger/10 text-danger",
                )}
              >
                {k.positive ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {Math.abs(k.delta)}%
              </span>
            )}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">{k.suffix}</div>
        </Card>
      ))}
    </div>
  );
}

function RevenueChart() {
  const [range, setRange] = useState<"daily" | "weekly" | "monthly">("daily");
  const { activeSalonId } = useOwnerContext();
  const days = range === "daily" ? 14 : range === "weekly" ? 56 : 180;
  const { data: series } = useQuery(ownerAnalyticsQuery(activeSalonId ?? "", days));
  const liveData = useMemo(() => {
    if (!series || !activeSalonId) return null;
    if (range === "daily") {
      return series.slice(-14).map((d) => ({
        label: new Date(d.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        revenue: d.revenue,
      }));
    }
    if (range === "weekly") {
      const out: { label: string; revenue: number }[] = [];
      for (let i = 0; i < series.length; i += 7) {
        const chunk = series.slice(i, i + 7);
        out.push({
          label: `W${Math.floor(i / 7) + 1}`,
          revenue: chunk.reduce((a, c) => a + c.revenue, 0),
        });
      }
      return out;
    }
    const byMonth = new Map<string, number>();
    for (const d of series) {
      const k = d.date.slice(0, 7);
      byMonth.set(k, (byMonth.get(k) ?? 0) + d.revenue);
    }
    return Array.from(byMonth.entries()).map(([k, v]) => ({
      label: new Date(k + "-01").toLocaleDateString("en-IN", { month: "short" }),
      revenue: v,
    }));
  }, [series, range, activeSalonId]);
  const data =
    liveData ??
    (range === "daily" ? revenueDaily : range === "weekly" ? revenueWeekly : revenueMonthly);
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-heading">Revenue Trend</div>
          <div className="text-xs text-muted-foreground">Gross revenue over time</div>
        </div>
        <div className="inline-flex rounded-lg border border-border bg-muted p-0.5 text-xs">
          {(["daily", "weekly", "monthly"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "rounded-md px-3 py-1.5 capitalize transition",
                range === r ? "bg-card text-heading shadow-sm" : "text-muted-foreground",
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={BRAND} stopOpacity={0.35} />
                <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid hsl(var(--border))",
                fontSize: 12,
              }}
              formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={BRAND}
              strokeWidth={2.5}
              fill="url(#rev)"
            />
            <Line type="monotone" dataKey="revenue" stroke={BRAND} strokeWidth={0} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function densityDots(count: number) {
  const level = count === 0 ? 0 : count < 4 ? 1 : count < 9 ? 2 : 3;
  return Array.from({ length: level }, (_, i) => i);
}

function BookingCalendarWidget() {
  const blanks = Array.from({ length: calendarFirstWeekday });
  // Compute "today" on the client only — server and user TZ can land on different dates.
  const [today, setToday] = useState<number | null>(null);
  useEffect(() => {
    setToday(new Date().getDate());
  }, []);
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-heading">{calendarMonthLabel}</div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary/40" />
          Low
          <span className="h-1.5 w-1.5 rounded-full bg-primary/70" />
          Med
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          High
        </div>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1.5 text-center text-[10px] uppercase text-muted-foreground">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={`${d}${i}`}>{d}</div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1.5">
        {blanks.map((_, i) => (
          <div key={`b${i}`} />
        ))}
        {calendarDensity.map(({ day, count }) => (
          <div
            key={day}
            className={cn(
              "flex aspect-square flex-col items-center justify-center rounded-lg border text-xs",
              day === today
                ? "border-primary bg-primary/10 font-semibold text-primary"
                : "border-border bg-card text-body",
            )}
          >
            <span className="leading-none">{day}</span>
            <div className="mt-0.5 flex items-center gap-0.5">
              {densityDots(count).map((i) => (
                <span key={i} className="h-1 w-1 rounded-full bg-primary" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function statusChip(s: BookingStatus) {
  const map: Record<BookingStatus, string> = {
    confirmed: "bg-success/10 text-success",
    pending: "bg-warning/10 text-warning",
    completed: "bg-primary/10 text-primary",
    cancelled: "bg-danger/10 text-danger",
  };
  return <Badge className={cn("border-0 capitalize", map[s])}>{s}</Badge>;
}

function RecentBookingsList() {
  const { activeSalonId } = useOwnerContext();
  const qc = useQueryClient();
  const updateStatus = useServerFn(updateOwnerBookingStatus);
  const { data: bookings } = useQuery(ownerBookingsQuery(activeSalonId ?? ""));
  const mutate = useMutation({
    mutationFn: (vars: { booking_id: string; status: "confirmed" | "cancelled" }) =>
      updateStatus({ data: vars }),
    onSuccess: (_d, v) => {
      toast.success(v.status === "confirmed" ? "Booking confirmed" : "Booking rejected");
      if (activeSalonId) {
        qc.invalidateQueries({ queryKey: ["owner", "bookings", activeSalonId] });
        qc.invalidateQueries({ queryKey: ["owner", "metrics", activeSalonId] });
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const liveList =
    bookings && activeSalonId
      ? bookings.slice(0, 5).map((b) => ({
          id: b.id,
          customer: `Customer ${b.user_id.slice(0, 4)}`,
          avatar: initials(b.user_id),
          service: b.service_name,
          time: `${b.booking_date} · ${fmtTime(b.booking_time)}`,
          status: b.status as BookingStatus,
        }))
      : null;
  const list = liveList ?? mockRecentBookings;
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-heading">Recent Bookings</div>
          <div className="text-xs text-muted-foreground">Last 5 appointments</div>
        </div>
        <Button variant="ghost" size="sm" className="text-primary">
          View all
        </Button>
      </div>
      <div className="mt-4 space-y-2">
        {list.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            No bookings yet.
          </div>
        )}
        {list.map((b) => (
          <div key={b.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {b.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-heading">{b.customer}</div>
              <div className="truncate text-xs text-muted-foreground">
                {b.service} · {b.time}
              </div>
            </div>
            {statusChip(b.status)}
            {b.status === "pending" && liveList && (
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 text-success"
                  aria-label="Confirm booking"
                  disabled={mutate.isPending}
                  onClick={() => mutate.mutate({ booking_id: b.id, status: "confirmed" })}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 text-danger"
                  aria-label="Cancel booking"
                  disabled={mutate.isPending}
                  onClick={() => mutate.mutate({ booking_id: b.id, status: "cancelled" })}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function PendingApprovalsWidget() {
  const { activeSalonId } = useOwnerContext();
  const qc = useQueryClient();
  const updateStatus = useServerFn(updateOwnerBookingStatus);
  const { data: bookings } = useQuery(ownerBookingsQuery(activeSalonId ?? ""));
  const mutate = useMutation({
    mutationFn: (vars: { booking_id: string; status: "confirmed" | "cancelled" }) =>
      updateStatus({ data: vars }),
    onSuccess: (_d, v) => {
      toast.success(v.status === "confirmed" ? "Accepted" : "Rejected");
      if (activeSalonId) {
        qc.invalidateQueries({ queryKey: ["owner", "bookings", activeSalonId] });
        qc.invalidateQueries({ queryKey: ["owner", "metrics", activeSalonId] });
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const livePending =
    bookings && activeSalonId
      ? bookings
          .filter((b) => b.status === "pending")
          .slice(0, 5)
          .map((b) => ({
            id: b.id,
            customer: `Customer ${b.user_id.slice(0, 4)}`,
            service: b.service_name,
            time: `${b.booking_date} · ${fmtTime(b.booking_time)}`,
          }))
      : null;
  const list = livePending ?? mockPending;
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-heading">Pending Approvals</div>
        <Badge className="border-0 bg-warning/10 text-warning">{list.length} waiting</Badge>
      </div>
      <div className="mt-3 space-y-2">
        {list.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            All caught up — no pending requests.
          </div>
        )}
        {list.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
          >
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-heading">{p.customer}</div>
              <div className="truncate text-xs text-muted-foreground">
                {p.service} · {p.time}
              </div>
            </div>
            <div className="flex gap-1.5">
              <Button
                size="sm"
                className="h-8 gap-1 bg-success text-white hover:bg-success/90"
                disabled={!livePending || mutate.isPending}
                onClick={() =>
                  livePending && mutate.mutate({ booking_id: p.id, status: "confirmed" })
                }
              >
                <Check className="h-4 w-4" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1 text-danger"
                disabled={!livePending || mutate.isPending}
                onClick={() =>
                  livePending && mutate.mutate({ booking_id: p.id, status: "cancelled" })
                }
              >
                <X className="h-4 w-4" />
                Reject
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function CustomerInsightsWidget() {
  return (
    <Card className="p-5">
      <div className="text-sm font-semibold text-heading">Customer Insights</div>
      <div className="text-xs text-muted-foreground">New vs Returning · last 4 weeks</div>
      <div className="mt-4 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={customerInsights} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid hsl(var(--border))",
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="new" name="New" fill={BRAND} radius={[6, 6, 0, 0]} />
            <Bar dataKey="returning" name="Returning" fill="#A5A0FF" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function StaffPerformanceSnapshot() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-br from-primary to-primary-dark p-5 text-primary-foreground">
        <div className="flex items-center gap-2 text-xs font-medium opacity-90">
          <Trophy className="h-4 w-4" /> Top Performer This Week
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Avatar className="h-14 w-14 ring-2 ring-white/30">
            <AvatarFallback className="bg-white/15 text-white">
              {topPerformer.avatar}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-lg font-bold">{topPerformer.name}</div>
            <div className="text-xs opacity-80">{topPerformer.role}</div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 divide-x divide-border">
        <div className="p-4">
          <div className="text-xs text-muted-foreground">Bookings</div>
          <div className="text-xl font-bold text-heading">{topPerformer.bookings}</div>
        </div>
        <div className="p-4">
          <div className="text-xs text-muted-foreground">Revenue</div>
          <div className="text-xl font-bold text-heading">{topPerformer.revenue}</div>
        </div>
      </div>
    </Card>
  );
}

function RecentReviewsWidget() {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-heading">Recent Reviews</div>
        <Button variant="ghost" size="sm" className="text-primary">
          All reviews
        </Button>
      </div>
      <div className="mt-3 space-y-3">
        {recentReviews.map((r) => (
          <div key={r.id} className="rounded-xl border border-border p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-heading">{r.author}</span>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-3.5 w-3.5",
                        i < r.rating ? "fill-warning text-warning" : "text-muted",
                      )}
                    />
                  ))}
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-primary">
                <Reply className="h-3.5 w-3.5" />
                Reply
              </Button>
            </div>
            <p className="mt-1.5 text-xs text-body">{r.text}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function QuickActionsRow() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const roles = useAuthStore((s) => s.roles);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const isOwner = roles.includes("owner" as any);

  const requireOwner = (label: string, target: string, run?: () => void) => {
    if (!isInitialized) {
      toast.info("Loading your account…");
      return;
    }
    if (!user) {
      // Stash the intended destination so /login restores it after sign-in.
      try {
        sessionStorage.setItem("nexora:postLoginRedirect", target);
      } catch {
        /* storage unavailable */
      }
      toast.error("Please sign in to continue", {
        description: `Sign in as a shop owner to use "${label}". We'll bring you right back.`,
        action: {
          label: "Sign in",
          onClick: () => navigate({ to: "/login" }),
        },
      });
      return;
    }
    if (!isOwner) {
      toast.error("Owner access required", {
        description: `"${label}" is only available for shop owner accounts.`,
        action: {
          label: "Become an owner",
          onClick: () => navigate({ to: "/owner-signup" as any }),
        },
      });
      return;
    }
    (run ?? (() => navigate({ to: target as any })))();
  };

  const handleShare = () =>
    requireOwner("Share Website", "/owner/website", async () => {
      const url = `${window.location.origin}/owner/website`;
      try {
        if (navigator.share) {
          await navigator.share({ title: "My Salon Website", url });
        } else {
          await navigator.clipboard.writeText(url);
          toast.success("Website link copied to clipboard");
        }
      } catch {
        /* user cancelled */
      }
    });

  const actions: { icon: typeof Plus; label: string; onClick: () => void }[] = [
    { icon: Plus, label: "Add Service", onClick: () => requireOwner("Add Service", "/owner/services") },
    { icon: UserPlus, label: "Add Staff", onClick: () => requireOwner("Add Staff", "/owner/staff") },
    { icon: Tag, label: "Create Offer", onClick: () => requireOwner("Create Offer", "/owner/marketing") },
    { icon: Share2, label: "Share Website", onClick: handleShare },
    { icon: QrCode, label: "Generate QR", onClick: () => requireOwner("Generate QR", "/owner/website") },
    { icon: BarChart3, label: "View Analytics", onClick: () => requireOwner("View Analytics", "/owner/analytics") },
  ];
  return (
    <Card className="p-4">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {actions.map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={a.onClick}
            className="group flex flex-col items-center gap-2 rounded-xl p-3 text-center transition hover:bg-primary/5"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
              <a.icon className="h-5 w-5" />
            </span>
            <span className="text-xs font-medium text-body">{a.label}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}
function ExitCustomerModeCard() {
  const fetchStats = useServerFn(getMyEventStats);
  const { data, isLoading } = useQuery({
    queryKey: ["owner", "analytics", "exit-customer-mode", 7],
    queryFn: () => fetchStats({ data: { event_name: "owner.exit_customer_mode", days: 7 } }),
    staleTime: 60_000,
  });
  const total = data?.total ?? 0;
  const daily = data?.daily ?? [];
  const max = Math.max(1, ...daily.map((d) => d.count));
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-medium text-muted-foreground">Exits from customer mode</div>
          <div className="mt-1 text-2xl font-bold text-heading">{isLoading ? "—" : total}</div>
          <div className="text-[11px] text-muted-foreground">last 7 days</div>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
          <UserCircle2 className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-4 flex h-12 items-end gap-1">
        {daily.map((d) => (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-sm bg-primary/70"
              style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count > 0 ? 2 : 0 }}
              title={`${d.date}: ${d.count}`}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-1 text-[10px] text-muted-foreground">
        {daily.map((d) => (
          <div key={d.date} className="flex-1 text-center">
            {new Date(d.date).toLocaleDateString(undefined, { weekday: "narrow" })}
          </div>
        ))}
      </div>
    </Card>
  );
}

export function OwnerDashboardPage({ ownerPortalOnly = false }: { ownerPortalOnly?: boolean }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(ownerBusiness.isOpen);
  const { activeSalon, isLoading: ctxLoading } = useOwnerContext();
  const fetchApprovalStatus = useServerFn(getMyOwnerApprovalStatus);
  const { data: approvalStatus } = useQuery({
    queryKey: ["owner", "approval-status"],
    queryFn: () => fetchApprovalStatus(),
    enabled: !ctxLoading && !activeSalon, // only check when there's no approved salon
  });
  // Pending owner (has a salon link but not yet approved) → redirect.
  useEffect(() => {
    if (approvalStatus?.hasAnyLink && !approvalStatus.hasApprovedLink) {
      navigate({ to: "/owner/pending" });
    }
  }, [approvalStatus, navigate]);

  // Mandatory onboarding: redirect approved owners with no website yet to template gallery.
  const needsWebsite = !!activeSalon && activeSalon.website_created === false;
  useEffect(() => {
    if (!ownerPortalOnly && needsWebsite) navigate({ to: "/owner/templates" });
  }, [needsWebsite, navigate, ownerPortalOnly]);

  // Compute greeting on the client only to avoid SSR/CSR hydration mismatch
  // (server's hour can differ from the user's local hour).
  const [greeting, setGreeting] = useState("Welcome");
  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
  }, []);
  const displayName = activeSalon?.name ?? ownerBusiness.name;
  return (
    <div className="min-h-screen bg-background">
      <TopBar open={open} onToggle={setOpen} showWebsiteActions={!ownerPortalOnly} />
      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6">
        {!ownerPortalOnly && needsWebsite && (
          <Card className="p-5 border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-base font-semibold text-heading">🚀 Create Your Website</div>
                  <div className="text-sm text-muted-foreground">
                    Choose a template and launch your online booking website in minutes.
                  </div>
                </div>
              </div>
              <Button onClick={() => navigate({ to: "/owner/templates" })}>Create Website</Button>
            </div>
          </Card>
        )}

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-heading">
              {greeting}, {displayName.split(" ")[0]} 👋
            </h1>
            <p className="text-sm text-muted-foreground">
              Here's what's happening at your business today.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                try {
                  sessionStorage.setItem("nexora:browseAsCustomer", "1");
                } catch {
                  /* ignore */
                }
                navigate({ to: "/" });
              }}
            >
              <UserCircle2 className="h-4 w-4" />
              Browse as customer
            </Button>
            {!ctxLoading &&
              (activeSalon ? (
                <Badge className="border-0 bg-success/10 text-success gap-1.5">
                  <Sparkles className="h-3 w-3" /> Live data · {activeSalon.name}
                </Badge>
              ) : (
                <Badge className="border-0 bg-warning/10 text-warning">
                  Demo data — no salon linked yet
                </Badge>
              ))}
          </div>
        </div>

        {ownerPortalOnly && <OwnerPortalNavigation />}
        <KPICards />
        {!ownerPortalOnly && <QuickActionsRow />}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <RevenueChart />
          <BookingCalendarWidget />
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <RecentBookingsList />
          <div className="space-y-6">
            <PendingApprovalsWidget />
            <ExitCustomerModeCard />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CustomerInsightsWidget />
          </div>
          <StaffPerformanceSnapshot />
        </div>

        <RecentReviewsWidget />
      </main>
    </div>
  );
}

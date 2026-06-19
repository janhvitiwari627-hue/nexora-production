import { useState } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Download, FileSpreadsheet, TrendingUp, TrendingDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  revenueTrend, revenueByCategory, bookingsTrend, customerTrend,
  kpiTiles, rateMeters,
} from "./analytics/mockAnalytics";
import { PeakHoursHeatmap } from "./analytics/PeakHoursHeatmap";
import { ConversionFunnel } from "./analytics/ConversionFunnel";
import { StaffPerformanceTable, ServicePerformanceTable } from "./analytics/PerformanceTables";

const RANGES = ["Today", "7 Days", "30 Days", "3 Months", "12 Months"] as const;

export function OwnerAnalyticsPage() {
  const [range, setRange] = useState<(typeof RANGES)[number]>("30 Days");
  const [customDate, setCustomDate] = useState<Date | undefined>();

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-sm text-muted-foreground">Track revenue, bookings, and customer performance.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Download className="h-4 w-4" /> Export PDF</Button>
          <Button variant="outline" size="sm"><FileSpreadsheet className="h-4 w-4" /> Export Excel</Button>
        </div>
      </div>

      {/* Date range selector */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg border bg-card p-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-md transition-colors",
                range === r ? "bg-primary text-primary-foreground" : "hover:bg-muted",
              )}
            >
              {r}
            </button>
          ))}
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <CalendarIcon className="h-4 w-4" />
              {customDate ? customDate.toLocaleDateString() : "Custom"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={customDate} onSelect={setCustomDate} className={cn("p-3 pointer-events-auto")} />
          </PopoverContent>
        </Popover>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiTiles.map((k) => (
          <Card key={k.label}>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">{k.label}</div>
              <div className="text-2xl font-bold mt-1">{k.value}</div>
              <div className={cn("text-xs mt-1 flex items-center gap-1", k.positive ? "text-emerald-600" : "text-rose-600")}>
                {k.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {k.delta}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue */}
      <section className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Revenue Trend</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="label" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="hsl(243, 75%, 59%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Revenue by Category</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={revenueByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85}>
                  {revenueByCategory.map((c) => <Cell key={c.name} fill={c.color} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      {/* Bookings */}
      <section className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Bookings Trend</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingsTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Bar dataKey="bookings" fill="hsl(243, 75%, 59%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Rate Meters</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {rateMeters.map((m) => (
              <div key={m.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{m.label}</span>
                  <span className="font-semibold">{m.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${m.value}%`, backgroundColor: m.color }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Customers */}
      <Card>
        <CardHeader><CardTitle className="text-base">Customer Acquisition — New vs Returning</CardTitle></CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={customerTrend}>
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
              <Area type="monotone" dataKey="new" stroke="hsl(243, 75%, 59%)" fill="url(#newG)" />
              <Area type="monotone" dataKey="returning" stroke="hsl(280, 70%, 60%)" fill="url(#retG)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance tables */}
      <section className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Staff Performance</CardTitle></CardHeader>
          <CardContent><StaffPerformanceTable /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Service Performance</CardTitle></CardHeader>
          <CardContent><ServicePerformanceTable /></CardContent>
        </Card>
      </section>

      {/* Heatmap + funnel */}
      <section className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Peak Hours Heatmap</CardTitle></CardHeader>
          <CardContent><PeakHoursHeatmap /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Conversion Funnel</CardTitle></CardHeader>
          <CardContent><ConversionFunnel /></CardContent>
        </Card>
      </section>
    </div>
  );
}

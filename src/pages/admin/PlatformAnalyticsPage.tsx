import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

const RANGES = ["7D", "30D", "3M", "12M"] as const;
type Range = (typeof RANGES)[number];

const revenue = Array.from({ length: 12 }).map((_, i) => ({
  m: `M${i + 1}`,
  value: 240 + i * 32 + (i % 3) * 18,
}));
const users = Array.from({ length: 12 }).map((_, i) => ({
  m: `M${i + 1}`,
  new: 1200 + i * 180,
  churn: 80 + i * 12,
}));
const bookings = Array.from({ length: 12 }).map((_, i) => ({
  m: `M${i + 1}`,
  value: 4800 + i * 320,
}));
const membership = Array.from({ length: 6 }).map((_, i) => ({
  tier: ["Silver", "Gold", "Platinum"][i % 3],
  value: 12000 - i * 1500,
}));
const partner = [
  { name: "Growth", value: 42 },
  { name: "District", value: 31 },
  { name: "Distributor", value: 27 },
];
const ads = Array.from({ length: 7 }).map((_, i) => ({
  d: `Day ${i + 1}`,
  impr: 12000 + i * 1500,
  clicks: 380 + i * 42,
}));

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--muted-foreground))",
  "hsl(var(--destructive))",
];

export function PlatformAnalyticsPage() {
  const [range, setRange] = useState<Range>("30D");

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-heading text-2xl font-bold">Platform Analytics</h1>
          <p className="text-muted-foreground text-sm">All key metrics across the platform</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-muted flex rounded-lg p-1">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`rounded-md px-3 py-1 text-sm ${range === r ? "bg-background shadow" : "text-muted-foreground"}`}
              >
                {r}
              </button>
            ))}
          </div>
          <Button variant="outline" onClick={() => toast.success("PDF export queued")}>
            <Download className="h-4 w-4" /> PDF
          </Button>
          <Button variant="outline" onClick={() => toast.success("Excel export queued")}>
            <FileSpreadsheet className="h-4 w-4" /> Excel
          </Button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { l: "Revenue MTD", v: "₹3.42Cr", d: "+18.7%" },
          { l: "New Users", v: "24,381", d: "+12.3%" },
          { l: "Bookings", v: "1.84L", d: "+9.2%" },
          { l: "Active Memberships", v: "94,512", d: "+3.2%" },
        ].map((k) => (
          <Card key={k.l}>
            <CardContent className="p-4">
              <div className="text-muted-foreground text-xs">{k.l}</div>
              <div className="text-heading text-xl font-bold">{k.v}</div>
              <Badge variant="outline" className="mt-1 text-emerald-600">
                {k.d}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer>
              <LineChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="m" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Growth vs Churn</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer>
              <AreaChart data={users}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="m" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="new"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary)/0.3)"
                />
                <Area
                  type="monotone"
                  dataKey="churn"
                  stroke="hsl(var(--destructive))"
                  fill="hsl(var(--destructive)/0.2)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Booking Volume</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer>
              <BarChart data={bookings}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="m" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Membership Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer>
              <BarChart data={membership}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tier" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--accent))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Partner Revenue Mix</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={partner} dataKey="value" nameKey="name" outerRadius={80} label>
                  {partner.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Advertising Performance</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer>
              <LineChart data={ads}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="d" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="impr" stroke="hsl(var(--primary))" />
                <Line type="monotone" dataKey="clicks" stroke="hsl(var(--accent))" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

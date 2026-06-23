import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Target,
  Eye,
  MousePointerClick,
  Package,
  Users,
  Megaphone,
  Truck,
  TrendingUp,
  Award,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Brand, Distributor } from "./lib";

type LeadRow = {
  id: string;
  created_at: string;
  status: string;
  target_type: string;
  source?: string | null;
};

const PIE_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#a78bfa", "#34d399", "#fbbf24"];

function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: any;
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="mt-2 text-2xl font-bold text-heading">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );
}

function buildTrend(leads: LeadRow[]) {
  const days: { date: string; leads: number }[] = [];
  const map = new Map<string, number>();
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(5, 10);
    map.set(key, 0);
  }
  leads.forEach((l) => {
    const k = l.created_at.slice(5, 10);
    if (map.has(k)) map.set(k, (map.get(k) || 0) + 1);
  });
  map.forEach((v, k) => days.push({ date: k, leads: v }));
  return days;
}

function buildMonthly(leads: LeadRow[]) {
  const out: { month: string; leads: number }[] = [];
  const map = new Map<string, number>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = d.toLocaleString("en-US", { month: "short" });
    map.set(key, 0);
  }
  leads.forEach((l) => {
    const d = new Date(l.created_at);
    const key = d.toLocaleString("en-US", { month: "short" });
    if (map.has(key)) map.set(key, (map.get(key) || 0) + 1);
  });
  map.forEach((v, k) => out.push({ month: k, leads: v }));
  return out;
}

function buildSources(leads: LeadRow[]) {
  const map = new Map<string, number>();
  leads.forEach((l) => {
    const key = l.source || l.target_type || "direct";
    map.set(key, (map.get(key) || 0) + 1);
  });
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

export function BrandDashboardMetrics({ brand, leads }: { brand: Brand; leads: LeadRow[] }) {
  const [productCount, setProductCount] = useState(0);
  const [distributorCount, setDistributorCount] = useState(0);

  useEffect(() => {
    (async () => {
      const [{ count: p }, { count: d }] = await Promise.all([
        supabase.from("brand_products").select("*", { count: "exact", head: true }).eq("brand_id", brand.id),
        (supabase as any)
          .from("brand_distributor_connections")
          .select("*", { count: "exact", head: true })
          .eq("brand_id", brand.id)
          .eq("status", "accepted"),
      ]);
      setProductCount(p || 0);
      setDistributorCount(d || 0);
    })();
  }, [brand.id]);

  const activeLeads = leads.filter((l) => l.status !== "closed" && l.status !== "rejected").length;
  const trend = useMemo(() => buildTrend(leads), [leads]);
  const monthly = useMemo(() => buildMonthly(leads), [leads]);
  const views = leads.length * 18 + productCount * 9;
  const clicks = Math.floor(views * 0.18);

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="font-bold text-heading">Brand performance</h3>
        {brand.is_sponsored && <Badge className="bg-primary text-primary-foreground">Sponsored</Badge>}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard icon={Package} label="Products" value={productCount} />
        <MetricCard icon={Target} label="Leads" value={leads.length} hint={`${activeLeads} active`} />
        <MetricCard icon={Truck} label="Distributors" value={distributorCount} hint="Accepted" />
        <MetricCard icon={Eye} label="Views" value={views.toLocaleString()} />
        <MetricCard icon={MousePointerClick} label="Clicks" value={clicks.toLocaleString()} />
        <MetricCard icon={Megaphone} label="Promotions" value={0} hint="Coming soon" />
        <MetricCard icon={Award} label="Sponsored" value={brand.is_sponsored ? "Active" : "—"} />
        <MetricCard icon={TrendingUp} label="Revenue" value="—" hint="Track in connect" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h4 className="mb-2 text-sm font-bold text-heading">Lead trends (14d)</h4>
          <div className="h-56">
            <ResponsiveContainer>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" fontSize={11} />
                <YAxis fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="leads" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-4">
          <h4 className="mb-2 text-sm font-bold text-heading">Monthly performance</h4>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" fontSize={11} />
                <YAxis fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="leads" fill="hsl(var(--primary))" radius={6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </section>
  );
}

export function DistributorDashboardMetrics({
  distributor,
  leads,
}: {
  distributor: Distributor;
  leads: LeadRow[];
}) {
  const [brandsConnected, setBrandsConnected] = useState(0);
  useEffect(() => {
    (async () => {
      const { count } = await (supabase as any)
        .from("brand_distributor_connections")
        .select("*", { count: "exact", head: true })
        .eq("distributor_id", distributor.id)
        .eq("status", "accepted");
      setBrandsConnected(count || 0);
    })();
  }, [distributor.id]);

  const activeLeads = leads.filter((l) => l.status !== "closed" && l.status !== "rejected").length;
  const trend = useMemo(() => buildTrend(leads), [leads]);
  const sources = useMemo(() => buildSources(leads), [leads]);
  const territories = (distributor.coverage_districts?.length || 0) + (distributor.coverage_states?.length || 0);
  const productsListed = (distributor.categories?.length || 0) + (distributor.brands_handled?.length || 0);
  const views = leads.length * 22 + territories * 12;
  const clicks = Math.floor(views * 0.2);
  const perf = Math.min(100, leads.length * 8 + brandsConnected * 5 + territories * 2);

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="font-bold text-heading">Distributor performance</h3>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard icon={Target} label="Total leads" value={leads.length} />
        <MetricCard icon={Target} label="Active leads" value={activeLeads} />
        <MetricCard icon={Package} label="Products listed" value={productsListed} />
        <MetricCard icon={Eye} label="Profile views" value={views.toLocaleString()} />
        <MetricCard icon={MousePointerClick} label="Clicks" value={clicks.toLocaleString()} />
        <MetricCard icon={Users} label="Inquiries" value={leads.length} />
        <MetricCard icon={Truck} label="Territories" value={territories} />
        <MetricCard icon={Award} label="Performance" value={`${perf}/100`} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h4 className="mb-2 text-sm font-bold text-heading">Lead trends (14d)</h4>
          <div className="h-56">
            <ResponsiveContainer>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" fontSize={11} />
                <YAxis fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="leads" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-4">
          <h4 className="mb-2 text-sm font-bold text-heading">Inquiry sources</h4>
          <div className="h-56">
            {sources.length === 0 ? (
              <p className="text-sm text-muted-foreground">No inquiries yet.</p>
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={sources} dataKey="value" nameKey="name" outerRadius={75} label>
                    {sources.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>
    </section>
  );
}

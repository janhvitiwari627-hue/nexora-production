import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin } from "lucide-react";

const STATS = { areas: 18, total: 142, active: 119, inactive: 23 };
const TEAM = Array.from({ length: 8 }).map((_, i) => ({
  id: `gp${i}`, name: `Growth Partner ${i + 1}`, area: ["Andheri", "Bandra", "Powai", "Thane"][i % 4],
  shops: 12 + (i * 5) % 40, revenue: 28000 + i * 7400,
}));
const PERF = Array.from({ length: 7 }).map((_, i) => ({ d: `Day ${i + 1}`, v: 18000 + (i * 3200) + (i % 2 ? 4000 : 0) }));

export function DistrictPartnerDashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header>
        <h1 className="text-heading text-2xl font-bold">District Partner Dashboard</h1>
        <p className="text-muted-foreground text-sm">Mumbai West Territory</p>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { l: "Covered Areas", v: STATS.areas },
          { l: "Total Shops", v: STATS.total },
          { l: "Active Shops", v: STATS.active },
          { l: "Inactive Shops", v: STATS.inactive },
        ].map(s => (
          <Card key={s.l}><CardContent className="p-4">
            <div className="text-muted-foreground text-xs">{s.l}</div>
            <div className="text-heading text-2xl font-bold">{s.v}</div>
          </CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Territory Map</CardTitle></CardHeader>
        <CardContent>
          <div className="bg-muted relative grid h-80 place-items-center overflow-hidden rounded-lg">
            <iframe
              title="Territory Map"
              className="absolute inset-0 h-full w-full"
              src="https://www.openstreetmap.org/export/embed.html?bbox=72.78%2C19.05%2C72.92%2C19.18&layer=mapnik"
              loading="lazy"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Growth Partners (Team)</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Partner</TableHead><TableHead>Area</TableHead><TableHead>Shops</TableHead><TableHead>Revenue</TableHead></TableRow></TableHeader>
              <TableBody>{TEAM.map(t => (
                <TableRow key={t.id}>
                  <TableCell><div className="flex items-center gap-2"><Avatar className="h-8 w-8"><AvatarFallback>{t.name.slice(0, 2)}</AvatarFallback></Avatar>{t.name}</div></TableCell>
                  <TableCell><Badge variant="outline">{t.area}</Badge></TableCell>
                  <TableCell>{t.shops}</TableCell>
                  <TableCell>₹{t.revenue.toLocaleString("en-IN")}</TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Revenue Summary</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">This Month</span><span className="font-semibold">₹4.82L</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Last Month</span><span>₹4.19L</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Your Cut (12%)</span><span className="text-emerald-600 font-semibold">₹57,840</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Pending</span><span>₹8,200</span></div>
            <div className="border-t pt-2 flex justify-between"><span className="font-semibold">Lifetime Earnings</span><span className="font-bold">₹6.42L</span></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Weekly Performance</CardTitle></CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer><LineChart data={PERF}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="d" /><YAxis /><Tooltip /><Line type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={2} /></LineChart></ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

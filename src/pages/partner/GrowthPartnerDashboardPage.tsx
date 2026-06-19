import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { Award, Copy, IndianRupee, Share2, TrendingUp, Trophy, Users } from "lucide-react";
import { toast } from "sonner";

const LEVELS = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"] as const;
const PARTNER = { name: "Rohit Verma", level: "Gold", referralLink: "https://nexora.app/r/ROHIT2026" };
const KPIS = [
  { label: "Total Referrals", value: "84", icon: Users },
  { label: "Active Shops", value: "67", icon: TrendingUp },
  { label: "Weekly Earnings", value: "₹14,250", icon: IndianRupee },
  { label: "Pending Rewards", value: "₹3,400", icon: Award },
  { label: "Lifetime Earnings", value: "₹2.84L", icon: Trophy },
];
const WEEKLY = [
  { d: "Mon", v: 1200 }, { d: "Tue", v: 1800 }, { d: "Wed", v: 2100 }, { d: "Thu", v: 1450 },
  { d: "Fri", v: 2800 }, { d: "Sat", v: 3200 }, { d: "Sun", v: 1700 },
];
const REFERRALS = Array.from({ length: 6 }).map((_, i) => ({
  id: `s${i}`, name: `Shop ${i + 1}`, date: `Jun ${18 - i}`,
  status: ["Active", "Active", "Pending", "Active"][i % 4], commission: 850 + i * 220,
}));
const MILESTONES = [
  { count: 25, reward: "₹1,000 bonus" }, { count: 50, reward: "₹2,500 bonus" },
  { count: 100, reward: "₹6,000 bonus" }, { count: 500, reward: "₹40,000 bonus" },
  { count: 1000, reward: "₹1L bonus + trip" },
];

export function GrowthPartnerDashboardPage() {
  const current = 84;
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-heading text-2xl font-bold">Welcome back, {PARTNER.name}</h1>
          <div className="mt-1 flex items-center gap-2">
            <Badge className="bg-amber-500 text-white">{PARTNER.level} Partner</Badge>
            <span className="text-muted-foreground text-sm">Level: {LEVELS.indexOf(PARTNER.level as typeof LEVELS[number]) + 1}/{LEVELS.length}</span>
          </div>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {KPIS.map(k => (
          <Card key={k.label}><CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs">{k.label}</span>
              <k.icon className="text-primary h-4 w-4" />
            </div>
            <div className="text-heading mt-1 text-xl font-bold">{k.value}</div>
          </CardContent></Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Weekly Earnings</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer><BarChart data={WEEKLY}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="d" /><YAxis /><Tooltip /><Bar dataKey="v" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Your Referral Link</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input value={PARTNER.referralLink} readOnly />
            <div className="flex gap-2">
              <Button className="flex-1" variant="outline" onClick={() => { navigator.clipboard?.writeText(PARTNER.referralLink); toast.success("Copied"); }}><Copy className="h-4 w-4" /> Copy</Button>
              <Button className="flex-1" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(PARTNER.referralLink)}`, "_blank")}><Share2 className="h-4 w-4" /> WhatsApp</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Milestone Rewards</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-5">
          {MILESTONES.map(m => {
            const pct = Math.min(100, (current / m.count) * 100);
            const done = current >= m.count;
            return (
              <div key={m.count} className={`rounded-xl border p-4 ${done ? "border-emerald-500 bg-emerald-500/10" : ""}`}>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{m.count}</div>
                  {done && <Badge className="bg-emerald-500">Unlocked</Badge>}
                </div>
                <div className="text-muted-foreground text-xs">referrals</div>
                <Progress value={pct} className="my-2" />
                <div className="text-xs font-medium">{m.reward}</div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Referred Shops</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Shop</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead>Commission</TableHead></TableRow></TableHeader>
              <TableBody>{REFERRALS.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="text-muted-foreground">{r.date}</TableCell>
                  <TableCell><Badge variant={r.status === "Active" ? "default" : "secondary"}>{r.status}</Badge></TableCell>
                  <TableCell>₹{r.commission}</TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="text-amber-500 h-5 w-5" /> Leaderboard</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-gradient-to-r from-amber-100 to-amber-50 rounded-lg p-4 text-center">
              <div className="text-muted-foreground text-xs">Your Rank</div>
              <div className="text-3xl font-bold">#7</div>
              <div className="text-xs">out of 248 partners</div>
            </div>
            {[
              { rank: 6, name: "Anita D.", refs: 87, you: false },
              { rank: 7, name: PARTNER.name, refs: 84, you: true },
              { rank: 8, name: "Karan K.", refs: 79, you: false },
            ].map(p => (
              <div key={p.rank} className={`flex items-center gap-3 rounded-lg p-2 ${p.you ? "bg-primary/10" : ""}`}>
                <span className="w-6 text-sm font-semibold">#{p.rank}</span>
                <Avatar className="h-8 w-8"><AvatarFallback>{p.name.slice(0, 2)}</AvatarFallback></Avatar>
                <span className="flex-1 text-sm">{p.name}{p.you && <Badge className="ml-2" variant="outline">You</Badge>}</span>
                <span className="text-sm font-semibold">{p.refs}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const CAMPAIGNS = [
  { id: "c1", name: "Summer Sale Drive", status: "Active", impr: 84200, clicks: 3120, spend: 28000, leads: 142 },
  { id: "c2", name: "Brand Awareness Q2", status: "Active", impr: 142000, clicks: 5840, spend: 56000, leads: 312 },
  { id: "c3", name: "Reactivation Push", status: "Paused", impr: 24800, clicks: 920, spend: 12000, leads: 38 },
];

type Lead = { id: string; name: string; mobile: string; stage: "New" | "Contacted" | "Converted" };
const INITIAL_LEADS: Lead[] = Array.from({ length: 9 }).map((_, i) => ({
  id: `l${i}`, name: ["Aarav M.", "Priya S.", "Rohan I.", "Sneha R."][i % 4] + ` ${i + 1}`,
  mobile: `+91 9${String(800000000 + i * 13579).slice(0, 9)}`,
  stage: (["New", "Contacted", "Converted"] as const)[i % 3],
}));

export function DistributorDashboardPage() {
  const [leads, setLeads] = useState(INITIAL_LEADS);
  const [createOpen, setCreateOpen] = useState(false);
  const [newC, setNewC] = useState({ name: "", budget: "" });

  const advance = (id: string) => setLeads(p => p.map(l => l.id === id ? {
    ...l, stage: l.stage === "New" ? "Contacted" : "Converted",
  } : l));

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16"><AvatarFallback>LX</AvatarFallback></Avatar>
            <div>
              <h1 className="text-heading text-2xl font-bold">L'Oréal Professionnel</h1>
              <p className="text-muted-foreground text-sm">Distributor · Verified Brand Partner</p>
            </div>
          </div>
          <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> Create Campaign</Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { l: "Active Campaigns", v: "2" },
          { l: "Total Leads", v: "492" },
          { l: "Conversion Rate", v: "18.4%" },
          { l: "Spend MTD", v: "₹96,000" },
        ].map(k => (
          <Card key={k.l}><CardContent className="p-4">
            <div className="text-muted-foreground text-xs">{k.l}</div>
            <div className="text-heading text-2xl font-bold">{k.v}</div>
          </CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Active Campaigns</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Campaign</TableHead><TableHead>Status</TableHead><TableHead>Impr.</TableHead><TableHead>Clicks</TableHead><TableHead>CTR</TableHead><TableHead>Spend</TableHead><TableHead>Leads</TableHead></TableRow></TableHeader>
            <TableBody>{CAMPAIGNS.map(c => {
              const ctr = (c.clicks / c.impr) * 100;
              return (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell><Badge variant={c.status === "Active" ? "default" : "secondary"}>{c.status}</Badge></TableCell>
                  <TableCell>{c.impr.toLocaleString("en-IN")}</TableCell>
                  <TableCell>{c.clicks}</TableCell>
                  <TableCell><span className="inline-flex items-center gap-1 text-emerald-600"><TrendingUp className="h-3 w-3" />{ctr.toFixed(2)}%</span></TableCell>
                  <TableCell>₹{c.spend.toLocaleString("en-IN")}</TableCell>
                  <TableCell>{c.leads}</TableCell>
                </TableRow>
              );
            })}</TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Leads Management</CardTitle></CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All ({leads.length})</TabsTrigger>
              <TabsTrigger value="New">New</TabsTrigger>
              <TabsTrigger value="Contacted">Contacted</TabsTrigger>
              <TabsTrigger value="Converted">Converted</TabsTrigger>
            </TabsList>
            {(["all", "New", "Contacted", "Converted"] as const).map(stage => (
              <TabsContent key={stage} value={stage}>
                <Table>
                  <TableHeader><TableRow><TableHead>Lead</TableHead><TableHead>Mobile</TableHead><TableHead>Stage</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                  <TableBody>{leads.filter(l => stage === "all" || l.stage === stage).map(l => (
                    <TableRow key={l.id}>
                      <TableCell>{l.name}</TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">{l.mobile}</TableCell>
                      <TableCell><Badge variant={l.stage === "Converted" ? "default" : l.stage === "Contacted" ? "secondary" : "outline"}>{l.stage}</Badge></TableCell>
                      <TableCell className="text-right">{l.stage !== "Converted" && <Button size="sm" variant="outline" onClick={() => advance(l.id)}>Move →</Button>}</TableCell>
                    </TableRow>
                  ))}</TableBody>
                </Table>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Billing Summary</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4 text-sm">
          <div><div className="text-muted-foreground">Current Balance</div><div className="text-xl font-bold">₹48,200</div></div>
          <div><div className="text-muted-foreground">Spent This Month</div><div className="text-xl font-bold">₹96,000</div></div>
          <div><div className="text-muted-foreground">Last Invoice</div><div className="text-xl font-bold">₹1.42L</div></div>
          <div className="flex items-end"><Button variant="outline" className="w-full">Top Up</Button></div>
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Campaign</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Campaign Name</Label><Input value={newC.name} onChange={e => setNewC({ ...newC, name: e.target.value })} /></div>
            <div><Label>Budget (₹)</Label><Input type="number" value={newC.budget} onChange={e => setNewC({ ...newC, budget: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button><Button onClick={() => { setCreateOpen(false); toast.success("Campaign created"); }}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

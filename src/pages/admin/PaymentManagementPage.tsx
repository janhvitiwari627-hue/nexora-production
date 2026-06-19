import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Check, Plus, QrCode, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";

type PM = { id: string; label: string; upi: string; qrUrl: string; enabled: boolean; isDefault: boolean };
type Pending = { id: string; user: string; amount: number; date: string; screenshot: string; method: string };
type Settle = { id: string; date: string; count: number; gross: number; fees: number; net: number; status: string };
type Txn = { id: string; user: string; shop: string; amount: number; status: string; date: string; method: string };

const initialPMs: PM[] = [
  { id: "p1", label: "Primary UPI", upi: "nexora@hdfc", qrUrl: "", enabled: true, isDefault: true },
  { id: "p2", label: "Backup UPI", upi: "nexora2@ybl", qrUrl: "", enabled: true, isDefault: false },
  { id: "p3", label: "Old QR", upi: "old@paytm", qrUrl: "", enabled: false, isDefault: false },
];

const PENDING: Pending[] = Array.from({ length: 6 }).map((_, i) => ({
  id: `pv${i + 1}`, user: ["Aarav", "Priya", "Rohan", "Sneha"][i % 4],
  amount: 499 + i * 230, date: `${i + 1}h ago`, screenshot: "", method: "UPI",
}));

const SETTLES: Settle[] = Array.from({ length: 8 }).map((_, i) => ({
  id: `s${i + 1}`, date: `2026-06-${String(18 - i).padStart(2, "0")}`,
  count: 120 + i * 14, gross: 142000 + i * 8400, fees: 14200 + i * 840,
  net: 127800 + i * 7560, status: i === 0 ? "Processing" : "Settled",
}));

const TXNS: Txn[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `BK${10000 + i}`, user: ["Aarav", "Priya", "Rohan"][i % 3],
  shop: ["Luxe Hair", "Glow Spa", "QuickCuts"][i % 3], amount: 599 + i * 110,
  status: ["Captured", "Captured", "Refunded", "Failed"][i % 4],
  date: `Jun ${18 - (i % 18)}`, method: ["UPI", "Card", "Wallet"][i % 3],
}));

export function PaymentManagementPage() {
  const [pms, setPms] = useState(initialPMs);
  const [pending, setPending] = useState(PENDING);
  const [addOpen, setAddOpen] = useState(false);
  const [newPM, setNewPM] = useState({ label: "", upi: "" });

  const toggle = (id: string) => setPms(p => p.map(x => x.id === id ? { ...x, enabled: !x.enabled } : x));
  const setDefault = (id: string) => setPms(p => p.map(x => ({ ...x, isDefault: x.id === id })));
  const remove = (id: string) => { setPms(p => p.filter(x => x.id !== id)); toast.success("Removed"); };

  const add = () => {
    if (!newPM.label || !newPM.upi) return;
    setPms(p => [...p, { id: `p${Date.now()}`, ...newPM, qrUrl: "", enabled: true, isDefault: false }]);
    setNewPM({ label: "", upi: "" });
    setAddOpen(false);
    toast.success("Payment method added");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header>
        <h1 className="text-heading text-2xl font-bold">Payment Management</h1>
        <p className="text-muted-foreground text-sm">Payment methods, verifications, settlements & transactions</p>
      </header>

      <Tabs defaultValue="methods">
        <TabsList>
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="verify">Verification</TabsTrigger>
          <TabsTrigger value="settle">Settlement History</TabsTrigger>
          <TabsTrigger value="txn">All Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="methods" className="space-y-3">
          <div className="flex justify-end">
            <Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> Add Method</Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pms.map(p => (
              <Card key={p.id}>
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 font-semibold">{p.label}{p.isDefault && <Badge>Default</Badge>}</div>
                      <div className="text-muted-foreground text-sm">{p.upi}</div>
                    </div>
                    <Switch checked={p.enabled} onCheckedChange={() => toggle(p.id)} />
                  </div>
                  <div className="bg-muted grid h-32 place-items-center rounded-lg"><QrCode className="text-muted-foreground h-16 w-16" /></div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" disabled={p.isDefault} onClick={() => setDefault(p.id)}><Star className="h-3.5 w-3.5" /> Default</Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="text-destructive h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="verify" className="space-y-3">
          <div className="grid gap-4 md:grid-cols-2">
            {pending.map(p => (
              <Card key={p.id}>
                <CardHeader className="pb-2"><CardTitle className="text-base">{p.user} · ₹{p.amount}</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-muted grid h-40 place-items-center rounded-lg text-xs">Payment screenshot preview</div>
                  <div className="text-muted-foreground flex justify-between text-xs"><span>{p.method}</span><span>{p.date}</span></div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" onClick={() => { setPending(prev => prev.filter(x => x.id !== p.id)); toast.success("Approved"); }}><Check className="h-4 w-4" /> Approve</Button>
                    <Button size="sm" variant="destructive" className="flex-1" onClick={() => { setPending(prev => prev.filter(x => x.id !== p.id)); toast.success("Rejected"); }}><X className="h-4 w-4" /> Reject</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settle">
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Txns</TableHead><TableHead>Gross</TableHead><TableHead>Fees</TableHead><TableHead>Net</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>{SETTLES.map(s => (
                <TableRow key={s.id}>
                  <TableCell>{s.date}</TableCell><TableCell>{s.count}</TableCell>
                  <TableCell>₹{s.gross.toLocaleString("en-IN")}</TableCell>
                  <TableCell className="text-muted-foreground">₹{s.fees.toLocaleString("en-IN")}</TableCell>
                  <TableCell className="font-semibold">₹{s.net.toLocaleString("en-IN")}</TableCell>
                  <TableCell><Badge variant={s.status === "Settled" ? "default" : "secondary"}>{s.status}</Badge></TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="txn">
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Booking ID</TableHead><TableHead>User</TableHead><TableHead>Shop</TableHead><TableHead>Amount</TableHead><TableHead>Method</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
              <TableBody>{TXNS.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs">{t.id}</TableCell>
                  <TableCell>{t.user}</TableCell><TableCell>{t.shop}</TableCell>
                  <TableCell>₹{t.amount}</TableCell><TableCell>{t.method}</TableCell>
                  <TableCell><Badge variant={t.status === "Captured" ? "default" : t.status === "Failed" ? "destructive" : "secondary"}>{t.status}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{t.date}</TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Payment Method</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Label</Label><Input value={newPM.label} onChange={e => setNewPM({ ...newPM, label: e.target.value })} /></div>
            <div><Label>UPI ID</Label><Input value={newPM.upi} onChange={e => setNewPM({ ...newPM, upi: e.target.value })} placeholder="name@bank" /></div>
          </div>
          <DialogFooter><Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button><Button onClick={add}>Add</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

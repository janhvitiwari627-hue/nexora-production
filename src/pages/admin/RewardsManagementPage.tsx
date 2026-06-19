import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Gift, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

type Rule = { id: string; name: string; value: number; unit: string };
const initialRules: Rule[] = [
  { id: "r1", name: "Points per ₹100 spent", value: 5, unit: "pts" },
  { id: "r2", name: "Signup bonus", value: 100, unit: "pts" },
  { id: "r3", name: "Referral bonus", value: 250, unit: "pts" },
  { id: "r4", name: "Birthday bonus", value: 500, unit: "pts" },
  { id: "r5", name: "Review reward", value: 20, unit: "pts" },
  { id: "r6", name: "Points expiry", value: 365, unit: "days" },
];

type Audit = { id: string; user: string; points: number; reason: string; date: string; flagged: boolean };
const AUDIT: Audit[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `a${i + 1}`,
  user: ["Aarav", "Priya", "Rohan", "Sneha"][i % 4] + " M.",
  points: [100, 250, 500, -100, 1000][i % 5],
  reason: ["Booking", "Referral", "Birthday", "Manual adjustment", "Review"][i % 5],
  date: `Jun ${18 - i}`,
  flagged: i % 4 === 0,
}));

export function RewardsManagementPage() {
  const [rules, setRules] = useState(initialRules);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header>
        <h1 className="text-heading text-2xl font-bold">Rewards Management</h1>
        <p className="text-muted-foreground text-sm">Configure rules and monitor reward activity</p>
      </header>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Gift className="h-5 w-5" /> Reward Rules</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rules.map(r => (
              <div key={r.id} className="space-y-1.5">
                <Label className="text-xs">{r.name}</Label>
                <div className="flex gap-2">
                  <Input type="number" value={r.value} onChange={e => setRules(p => p.map(x => x.id === r.id ? { ...x, value: Number(e.target.value) } : x))} />
                  <span className="bg-muted grid w-16 place-items-center rounded-md text-sm">{r.unit}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end"><Button onClick={() => toast.success("Rules saved")}>Save Rules</Button></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Reward Activity Monitor</CardTitle>
          {selected.size > 0 && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => { toast.success(`Reversed ${selected.size} entries`); setSelected(new Set()); }}>Bulk Reverse</Button>
              <Button size="sm" variant="destructive" onClick={() => { toast.success(`Voided ${selected.size}`); setSelected(new Set()); }}>Bulk Void</Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead className="w-10"></TableHead><TableHead>User</TableHead><TableHead>Points</TableHead><TableHead>Reason</TableHead><TableHead>Date</TableHead><TableHead>Flag</TableHead></TableRow></TableHeader>
            <TableBody>{AUDIT.map(a => (
              <TableRow key={a.id} className={a.flagged ? "border-l-4 border-l-destructive" : ""}>
                <TableCell><Checkbox checked={selected.has(a.id)} onCheckedChange={() => toggle(a.id)} /></TableCell>
                <TableCell>{a.user}</TableCell>
                <TableCell className={a.points < 0 ? "text-destructive" : "text-emerald-600"}>{a.points > 0 ? "+" : ""}{a.points}</TableCell>
                <TableCell>{a.reason}</TableCell>
                <TableCell className="text-muted-foreground">{a.date}</TableCell>
                <TableCell>{a.flagged && <Badge variant="destructive" className="gap-1"><ShieldAlert className="h-3 w-3" /> Audit</Badge>}</TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

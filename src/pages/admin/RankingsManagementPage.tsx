import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { GripVertical, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = ["Salon", "Spa", "Tattoo", "Barber", "Bridal"];

type Factor = { id: string; label: string; weight: number };
const initialFactors: Factor[] = [
  { id: "rating", label: "Average Rating", weight: 30 },
  { id: "bookings", label: "Booking Volume", weight: 25 },
  { id: "reviews", label: "Review Count", weight: 15 },
  { id: "recency", label: "Recent Activity", weight: 15 },
  { id: "completion", label: "Completion Rate", weight: 10 },
  { id: "response", label: "Response Time", weight: 5 },
];

type Shop = { id: string; name: string; score: number };
const initialShops = (cat: string): Shop[] => Array.from({ length: 8 }).map((_, i) => ({
  id: `${cat}-${i}`, name: `${cat} Studio ${i + 1}`, score: 95 - i * 5,
}));

export function RankingsManagementPage() {
  const [tab, setTab] = useState(CATEGORIES[0]);
  const [factors, setFactors] = useState(initialFactors);
  const [shops, setShops] = useState<Record<string, Shop[]>>(() =>
    Object.fromEntries(CATEGORIES.map(c => [c, initialShops(c)]))
  );
  const [resetOpen, setResetOpen] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);

  const total = factors.reduce((a, b) => a + b.weight, 0);

  const onDrop = (overId: string) => {
    if (!dragId || dragId === overId) return;
    const list = [...shops[tab]];
    const from = list.findIndex(x => x.id === dragId);
    const to = list.findIndex(x => x.id === overId);
    const [item] = list.splice(from, 1);
    list.splice(to, 0, item);
    setShops({ ...shops, [tab]: list });
    setDragId(null);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-heading text-2xl font-bold">Rankings Management</h1>
          <p className="text-muted-foreground text-sm">Tune ranking factors and manual overrides</p>
        </div>
        <Button variant="outline" onClick={() => setResetOpen(true)}><RefreshCw className="h-4 w-4" /> Reset Weekly Trending</Button>
      </header>

      <Card>
        <CardHeader><CardTitle>Ranking Factor Weights <Badge variant={total === 100 ? "default" : "destructive"} className="ml-2">{total}%</Badge></CardTitle></CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          {factors.map(f => (
            <div key={f.id} className="space-y-2">
              <div className="flex justify-between"><Label>{f.label}</Label><span className="text-sm font-medium">{f.weight}%</span></div>
              <Slider value={[f.weight]} max={100} step={5} onValueChange={([v]) => setFactors(p => p.map(x => x.id === f.id ? { ...x, weight: v } : x))} />
            </div>
          ))}
          <div className="md:col-span-2 flex justify-end"><Button onClick={() => toast.success("Weights saved")}>Save Weights</Button></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Manual Ranking Override</CardTitle></CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>{CATEGORIES.map(c => <TabsTrigger key={c} value={c}>{c}</TabsTrigger>)}</TabsList>
            {CATEGORIES.map(c => (
              <TabsContent key={c} value={c} className="space-y-2">
                {shops[c].map((s, idx) => (
                  <div
                    key={s.id}
                    draggable
                    onDragStart={() => setDragId(s.id)}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => onDrop(s.id)}
                    className="bg-muted/40 hover:bg-muted flex items-center gap-3 rounded-lg border p-3"
                  >
                    <GripVertical className="text-muted-foreground h-4 w-4 cursor-grab" />
                    <span className="w-8 text-sm font-semibold">#{idx + 1}</span>
                    <span className="flex-1 font-medium">{s.name}</span>
                    <Badge variant="outline">Score {s.score}</Badge>
                  </div>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reset Weekly Trending?</DialogTitle></DialogHeader>
          <p className="text-muted-foreground text-sm">This clears the current trending leaderboard and starts a fresh 7-day window across all categories.</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setResetOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { setResetOpen(false); toast.success("Trending reset"); }}>Reset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, EyeOff, Flag, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Review = {
  id: string; user: string; shop: string; rating: number; text: string;
  date: string; fakeScore: number; status: "pending" | "approved" | "hidden";
};
const REVIEWS: Review[] = Array.from({ length: 14 }).map((_, i) => ({
  id: `rv${i + 1}`,
  user: ["Aarav", "Priya", "Rohan", "Sneha", "Vikram"][i % 5] + " M.",
  shop: ["Luxe Hair", "Glow Spa", "QuickCuts", "Bridal Bliss"][i % 4],
  rating: (i % 5) + 1,
  text: ["Amazing experience, staff was great!", "Not worth the money.", "Best salon in town!!! 5 stars!!!", "Average service."][i % 4],
  date: `${i + 1}d ago`,
  fakeScore: (i * 17) % 100,
  status: "pending" as const,
}));

const scoreColor = (s: number) =>
  s < 30 ? "bg-emerald-500" : s < 60 ? "bg-amber-500" : s < 80 ? "bg-orange-500" : "bg-red-500";

export function ReviewModerationPage() {
  const [reviews, setReviews] = useState(REVIEWS);
  const [tab, setTab] = useState<"pending" | "approved" | "hidden">("pending");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = reviews.filter(r => r.status === tab);
  const toggle = (id: string) => { const s = new Set(selected); s.has(id) ? s.delete(id) : s.add(id); setSelected(s); };

  const setStatus = (ids: string[], status: Review["status"]) => {
    setReviews(p => p.map(r => ids.includes(r.id) ? { ...r, status } : r));
    setSelected(new Set());
    toast.success(`${ids.length} review(s) ${status}`);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header>
        <h1 className="text-heading text-2xl font-bold">Review Moderation</h1>
        <p className="text-muted-foreground text-sm">AI-assisted fake review detection</p>
      </header>

      <div className="flex items-center justify-between">
        <Tabs value={tab} onValueChange={v => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="hidden">Hidden</TabsTrigger>
          </TabsList>
        </Tabs>
        {selected.size > 0 && (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setStatus([...selected], "approved")}><Check className="h-4 w-4" /> Approve {selected.size}</Button>
            <Button size="sm" variant="destructive" onClick={() => setStatus([...selected], "hidden")}><EyeOff className="h-4 w-4" /> Hide {selected.size}</Button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {filtered.map(r => (
          <Card key={r.id}>
            <CardContent className="flex gap-4 p-4">
              <Checkbox checked={selected.has(r.id)} onCheckedChange={() => toggle(r.id)} className="mt-1" />
              <Avatar><AvatarFallback>{r.user.slice(0, 2)}</AvatarFallback></Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{r.user} <span className="text-muted-foreground font-normal">on {r.shop}</span></div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />)}</div>
                      <span className="text-muted-foreground">· {r.date}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="text-muted-foreground text-xs">AI Fake Score</div>
                    <div className="flex items-center gap-2">
                      <div className="bg-muted h-2 w-24 overflow-hidden rounded-full">
                        <div className={`h-full ${scoreColor(r.fakeScore)}`} style={{ width: `${r.fakeScore}%` }} />
                      </div>
                      <span className="w-8 text-right text-sm font-medium">{r.fakeScore}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm">{r.text}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setStatus([r.id], "approved")}><Check className="h-3.5 w-3.5" /> Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => setStatus([r.id], "hidden")}><EyeOff className="h-3.5 w-3.5" /> Hide</Button>
                  <Button size="sm" variant="ghost"><Flag className="h-3.5 w-3.5" /> Flag</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setReviews(p => p.filter(x => x.id !== r.id)); toast.success("Deleted"); }}><Trash2 className="text-destructive h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && <Card><CardContent className="text-muted-foreground p-12 text-center">No reviews in this queue</CardContent></Card>}
      </div>
    </div>
  );
}

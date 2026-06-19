import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, Plus, Trash2, Trophy, X } from "lucide-react";
import { toast } from "sonner";

type Partner = { id: string; name: string; region: string; commission: number; revenue: number; status: "active" | "pending" };
const seed = (prefix: string): Partner[] => Array.from({ length: 6 }).map((_, i) => ({
  id: `${prefix}-${i}`, name: `${prefix} Partner ${i + 1}`,
  region: ["Mumbai", "Pune", "Bengaluru", "Delhi"][i % 4],
  commission: 8 + (i % 5),
  revenue: 28000 + i * 14200,
  status: i % 4 === 0 ? "pending" : "active",
}));

type Hero = { id: string; name: string; stat: string };

export function PartnerManagementPage() {
  const [growth, setGrowth] = useState(seed("Growth"));
  const [district, setDistrict] = useState(seed("District"));
  const [distrib, setDistrib] = useState(seed("Distributor"));
  const [hof, setHof] = useState<Hero[]>([
    { id: "h1", name: "Rohit Verma", stat: "₹12.4L revenue · 84 shops" },
    { id: "h2", name: "Anita Desai", stat: "₹9.8L revenue · 67 shops" },
    { id: "h3", name: "Karan Kapoor", stat: "₹8.2L revenue · 59 shops" },
  ]);
  const [newHero, setNewHero] = useState({ name: "", stat: "" });

  const renderTable = (data: Partner[], setData: React.Dispatch<React.SetStateAction<Partner[]>>) => (
    <Table>
      <TableHeader><TableRow><TableHead>Partner</TableHead><TableHead>Region</TableHead><TableHead>Commission</TableHead><TableHead>Revenue</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
      <TableBody>{data.map(p => (
        <TableRow key={p.id}>
          <TableCell className="font-medium">{p.name}</TableCell>
          <TableCell>{p.region}</TableCell>
          <TableCell>
            <Input type="number" value={p.commission} onChange={e => setData(prev => prev.map(x => x.id === p.id ? { ...x, commission: Number(e.target.value) } : x))} className="h-8 w-20" />
          </TableCell>
          <TableCell>₹{p.revenue.toLocaleString("en-IN")}</TableCell>
          <TableCell><Badge variant={p.status === "active" ? "default" : "secondary"}>{p.status}</Badge></TableCell>
          <TableCell className="text-right">
            {p.status === "pending" ? (
              <div className="flex justify-end gap-1">
                <Button size="sm" variant="outline" onClick={() => { setData(prev => prev.map(x => x.id === p.id ? { ...x, status: "active" } : x)); toast.success("Approved"); }}><Check className="h-3.5 w-3.5" /></Button>
                <Button size="sm" variant="outline" onClick={() => { setData(prev => prev.filter(x => x.id !== p.id)); toast.success("Rejected"); }}><X className="h-3.5 w-3.5" /></Button>
              </div>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => toast.success("Saved")}>Save</Button>
            )}
          </TableCell>
        </TableRow>
      ))}</TableBody>
    </Table>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header>
        <h1 className="text-heading text-2xl font-bold">Partner Management</h1>
        <p className="text-muted-foreground text-sm">Growth, district and distributor partners</p>
      </header>

      <Tabs defaultValue="growth">
        <TabsList>
          <TabsTrigger value="growth">Growth Partners</TabsTrigger>
          <TabsTrigger value="district">District Partners</TabsTrigger>
          <TabsTrigger value="distrib">Distributors</TabsTrigger>
        </TabsList>
        <TabsContent value="growth"><Card><CardContent className="p-0">{renderTable(growth, setGrowth)}</CardContent></Card></TabsContent>
        <TabsContent value="district"><Card><CardContent className="p-0">{renderTable(district, setDistrict)}</CardContent></Card></TabsContent>
        <TabsContent value="distrib"><Card><CardContent className="p-0">{renderTable(distrib, setDistrib)}</CardContent></Card></TabsContent>
      </Tabs>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="text-amber-500 h-5 w-5" /> Hall of Fame</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            {hof.map(h => (
              <div key={h.id} className="bg-muted/40 flex items-center gap-3 rounded-lg border p-3">
                <Avatar><AvatarFallback>{h.name.slice(0, 2)}</AvatarFallback></Avatar>
                <div className="flex-1">
                  <div className="font-medium">{h.name}</div>
                  <div className="text-muted-foreground text-xs">{h.stat}</div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setHof(p => p.filter(x => x.id !== h.id))}><Trash2 className="text-destructive h-4 w-4" /></Button>
              </div>
            ))}
          </div>
          <div className="grid gap-2 md:grid-cols-[1fr_2fr_auto]">
            <Input placeholder="Name" value={newHero.name} onChange={e => setNewHero({ ...newHero, name: e.target.value })} />
            <Input placeholder="Stat (e.g. ₹5L revenue · 40 shops)" value={newHero.stat} onChange={e => setNewHero({ ...newHero, stat: e.target.value })} />
            <Button onClick={() => {
              if (!newHero.name) return;
              setHof(p => [...p, { id: `h${Date.now()}`, ...newHero }]);
              setNewHero({ name: "", stat: "" });
              toast.success("Added to Hall of Fame");
            }}><Plus className="h-4 w-4" /> Add</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

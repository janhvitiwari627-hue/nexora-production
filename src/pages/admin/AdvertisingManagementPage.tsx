import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, TrendingDown, TrendingUp } from "lucide-react";
import { toast } from "sonner";

type Campaign = {
  id: string;
  name: string;
  type: string;
  budget: number;
  impressions: number;
  clicks: number;
  status: string;
};

const seedCampaigns = (type: string): Campaign[] =>
  Array.from({ length: 5 }).map((_, i) => ({
    id: `${type}-${i}`,
    name: `${type === "listing" ? "Listing" : "Video"} Campaign ${i + 1}`,
    type,
    budget: 5000 + i * 1500,
    impressions: 10000 + i * 4200,
    clicks: 320 + i * 110,
    status: ["Active", "Active", "Paused", "Completed"][i % 4],
  }));

export function AdvertisingManagementPage() {
  const [listings, setListings] = useState(seedCampaigns("listing"));
  const [videos, setVideos] = useState(seedCampaigns("video"));

  const CampaignTable = ({ data }: { data: Campaign[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Campaign</TableHead>
          <TableHead>Budget</TableHead>
          <TableHead>Impr.</TableHead>
          <TableHead>Clicks</TableHead>
          <TableHead>CTR</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((c) => {
          const ctr = (c.clicks / c.impressions) * 100;
          return (
            <TableRow key={c.id}>
              <TableCell className="font-medium">{c.name}</TableCell>
              <TableCell>₹{c.budget.toLocaleString("en-IN")}</TableCell>
              <TableCell>{c.impressions.toLocaleString("en-IN")}</TableCell>
              <TableCell>{c.clicks}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center gap-1 ${ctr >= 3 ? "text-emerald-600" : "text-amber-600"}`}
                >
                  {ctr >= 3 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {ctr.toFixed(2)}%
                </span>
              </TableCell>
              <TableCell>
                <Badge variant={c.status === "Active" ? "default" : "secondary"}>{c.status}</Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );

  const CreateForm = ({
    kind,
    onAdd,
  }: {
    kind: "listing" | "video";
    onAdd: (c: Campaign) => void;
  }) => {
    const [form, setForm] = useState({ name: "", budget: "", placement: "homepage", notes: "" });
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Create {kind === "listing" ? "Sponsored Listing" : "Sponsored Video"}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div>
            <Label>Campaign Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>Budget (₹)</Label>
            <Input
              type="number"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
            />
          </div>
          <div>
            <Label>Placement</Label>
            <Select
              value={form.placement}
              onValueChange={(v) => setForm({ ...form, placement: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="homepage">Homepage</SelectItem>
                <SelectItem value="search">Search Results</SelectItem>
                <SelectItem value="category">Category Page</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label>Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button
              onClick={() => {
                if (!form.name || !form.budget) return;
                onAdd({
                  id: `${kind}-${Date.now()}`,
                  name: form.name,
                  type: kind,
                  budget: Number(form.budget),
                  impressions: 0,
                  clicks: 0,
                  status: "Active",
                });
                setForm({ name: "", budget: "", placement: "homepage", notes: "" });
                toast.success("Campaign created");
              }}
            >
              <Plus className="h-4 w-4" /> Create Campaign
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header>
        <h1 className="text-heading text-2xl font-bold">Advertising Management</h1>
        <p className="text-muted-foreground text-sm">Sponsored placements & performance</p>
      </header>

      <Tabs defaultValue="listings">
        <TabsList>
          <TabsTrigger value="listings">Sponsored Listings</TabsTrigger>
          <TabsTrigger value="videos">Sponsored Videos</TabsTrigger>
          <TabsTrigger value="perf">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="space-y-4">
          <CreateForm kind="listing" onAdd={(c) => setListings((p) => [c, ...p])} />
          <Card>
            <CardContent className="p-0">
              <CampaignTable data={listings} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos" className="space-y-4">
          <CreateForm kind="video" onAdd={(c) => setVideos((p) => [c, ...p])} />
          <Card>
            <CardContent className="p-0">
              <CampaignTable data={videos} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="perf">
          <Card>
            <CardContent className="p-0">
              <CampaignTable data={[...listings, ...videos]} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

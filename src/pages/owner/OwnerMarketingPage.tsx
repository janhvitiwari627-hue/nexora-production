import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CalendarDays, Copy, Edit2, Megaphone, Plus, Sparkles, Trash2, TrendingUp, Wand2, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useOwnerContext } from "@/hooks/use-owner-context";
import { generateMarketingCopy } from "@/lib/owner.functions";
import {
  INITIAL_OFFERS, INITIAL_CAMPAIGNS, INITIAL_AUTOMATIONS, AI_SUGGESTIONS,
  type Offer, type Campaign,
} from "./marketing/mockMarketing";

export function OwnerMarketingPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Marketing & Offers</h1>
        <p className="text-sm text-muted-foreground">
          Grow revenue with offers, campaigns and AI-powered customer outreach.
        </p>
      </div>

      <Tabs defaultValue="offers" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="offers">Offers</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="automations">WhatsApp</TabsTrigger>
          <TabsTrigger value="ai">AI Marketing</TabsTrigger>
        </TabsList>

        <TabsContent value="offers"><OffersTab /></TabsContent>
        <TabsContent value="campaigns"><CampaignsTab /></TabsContent>
        <TabsContent value="automations"><AutomationsTab /></TabsContent>
        <TabsContent value="ai"><AITab /></TabsContent>
      </Tabs>
    </div>
  );
}

/* ---------- OFFERS ---------- */
function OffersTab() {
  const [offers, setOffers] = useState<Offer[]>(INITIAL_OFFERS);
  const [open, setOpen] = useState(false);

  const toggle = (id: string) =>
    setOffers(offers.map((o) => o.id === id ? { ...o, active: !o.active } : o));
  const remove = (id: string) => {
    setOffers(offers.filter((o) => o.id !== id));
    toast.success("Offer deleted");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{offers.filter((o) => o.active).length} active offers</div>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Create Offer</Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {offers.map((o) => (
          <Card key={o.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">{o.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{o.service}</div>
                </div>
                <Switch checked={o.active} onCheckedChange={() => toggle(o.id)} />
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-mono">{o.code}</Badge>
                <Badge>{o.discountType === "percent" ? `${o.discountValue}% off` : `₹${o.discountValue} off`}</Badge>
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {o.validFrom} → {o.validTo}</span>
                <span>{o.used}/{o.usageLimit} used</span>
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" size="sm" className="flex-1"><Edit2 className="h-3.5 w-3.5" /> Edit</Button>
                <Button variant="outline" size="sm" onClick={() => remove(o.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CreateOfferModal open={open} onClose={() => setOpen(false)}
        onCreate={(o) => { setOffers([o, ...offers]); toast.success("Offer created"); }} />
    </div>
  );
}

function CreateOfferModal({ open, onClose, onCreate }: {
  open: boolean; onClose: () => void; onCreate: (o: Offer) => void;
}) {
  const [title, setTitle] = useState("");
  const [service, setService] = useState("Hair Spa");
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent");
  const [discountValue, setDiscountValue] = useState(10);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [limit, setLimit] = useState(100);
  const code = (title || "OFFER").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8) +
    Math.floor(Math.random() * 90 + 10);

  const submit = () => {
    if (!title) return toast.error("Add a title");
    onCreate({
      id: `o${Date.now()}`, title, service, discountType, discountValue,
      validFrom: from, validTo: to, usageLimit: limit, used: 0, code, active: true,
    });
    onClose();
    setTitle("");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Create Offer</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Offer Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Flat 20% on Hair Spa" className="mt-1" />
          </div>
          <div>
            <Label>Applicable Service</Label>
            <Select value={service} onValueChange={setService}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Hair Spa", "Haircut", "Bridal Makeup", "Manicure", "Pedicure", "Massage", "All Services"]
                  .map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Discount Type</Label>
            <RadioGroup value={discountType} onValueChange={(v) => setDiscountType(v as "percent" | "fixed")} className="flex gap-4 mt-2">
              <label className="flex items-center gap-2 text-sm">
                <RadioGroupItem value="percent" /> Percentage
              </label>
              <label className="flex items-center gap-2 text-sm">
                <RadioGroupItem value="fixed" /> Fixed Amount
              </label>
            </RadioGroup>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{discountType === "percent" ? "Discount %" : "Discount ₹"}</Label>
              <Input type="number" value={discountValue} onChange={(e) => setDiscountValue(+e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Usage Limit</Label>
              <Input type="number" value={limit} onChange={(e) => setLimit(+e.target.value)} className="mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Valid From</Label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Valid To</Label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1" />
            </div>
          </div>
          <div className="rounded-md bg-muted p-3 text-sm">
            Auto-generated code: <span className="font-mono font-semibold">{code}</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit}>Create Offer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- CAMPAIGNS ---------- */
function CampaignsTab() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [open, setOpen] = useState(false);

  const STATUS_CLR: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    completed: "bg-muted text-muted-foreground",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{campaigns.length} campaigns</div>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Create Campaign</Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((c) => (
          <Card key={c.id}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline">{c.type}</Badge>
                <Badge className={STATUS_CLR[c.status]}>{c.status}</Badge>
              </div>
              <div className="font-semibold">{c.name}</div>
              <div className="text-xs text-muted-foreground">Audience: {c.audience}</div>
              <div className="flex items-center justify-between pt-2 border-t text-sm">
                <span>{c.reach.toLocaleString()} recipients</span>
                <span className="text-xs text-muted-foreground">{c.sentAt || c.scheduledAt}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CreateCampaignModal open={open} onClose={() => setOpen(false)}
        onCreate={(c) => { setCampaigns([c, ...campaigns]); toast.success("Campaign created"); }} />
    </div>
  );
}

function CreateCampaignModal({ open, onClose, onCreate }: {
  open: boolean; onClose: () => void; onCreate: (c: Campaign) => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<Campaign["type"]>("Birthday");
  const [audience, setAudience] = useState("All customers");
  const [message, setMessage] = useState("");
  const [schedule, setSchedule] = useState("");

  const aiWrite = () => {
    const templates: Record<Campaign["type"], string> = {
      Birthday: "🎂 Happy Birthday {name}! Celebrate with 25% off any service this month.",
      Festival: "✨ Festive greetings, {name}! Book before {date} and enjoy 20% off + complimentary service.",
      Reactivation: "We miss you, {name} ❤️ Come back this month for 30% off your favourite treatment.",
      Custom: "",
    };
    setMessage(templates[type]);
    toast.success("AI message generated");
  };

  const submit = () => {
    if (!name || !message) return toast.error("Fill all fields");
    onCreate({
      id: `c${Date.now()}`, name, type,
      status: schedule ? "scheduled" : "active",
      audience, reach: Math.floor(Math.random() * 400 + 50),
      scheduledAt: schedule || undefined, sentAt: schedule ? undefined : "just now",
    });
    onClose();
    setName(""); setMessage(""); setSchedule("");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Create Campaign</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Campaign Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as Campaign["type"])}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Birthday", "Festival", "Reactivation", "Custom"].map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Audience Segment</Label>
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["All customers", "VIP", "Regulars", "New customers", "Lost (60+ days)", "Birthday this month"]
                  .map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label>Message</Label>
              <Button type="button" size="sm" variant="ghost" onClick={aiWrite}>
                <Wand2 className="h-3.5 w-3.5" /> ✨ AI Write
              </Button>
            </div>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} />
          </div>
          <div>
            <Label>Schedule (optional)</Label>
            <Input type="datetime-local" value={schedule} onChange={(e) => setSchedule(e.target.value)} className="mt-1" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit}>{schedule ? "Schedule" : "Send Now"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- AUTOMATIONS ---------- */
function AutomationsTab() {
  const [items, setItems] = useState(INITIAL_AUTOMATIONS);

  return (
    <div className="space-y-3">
      <Accordion type="multiple" className="space-y-2">
        {items.map((a) => (
          <Card key={a.id} className="overflow-hidden">
            <AccordionItem value={a.id} className="border-0">
              <div className="flex items-center justify-between p-4 gap-3">
                <div className="flex-1">
                  <div className="font-semibold">{a.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{a.description}</div>
                </div>
                <Switch
                  checked={a.enabled}
                  onCheckedChange={(v) =>
                    setItems(items.map((x) => x.id === a.id ? { ...x, enabled: v } : x))
                  }
                />
              </div>
              <AccordionTrigger className="px-4 py-2 text-xs border-t hover:no-underline">
                Edit message template
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <Textarea
                  defaultValue={a.template}
                  rows={3}
                  onChange={(e) =>
                    setItems(items.map((x) => x.id === a.id ? { ...x, template: e.target.value } : x))
                  }
                />
                <div className="text-xs text-muted-foreground mt-1.5">
                  Variables: <code>{`{name}`}</code>, <code>{`{service}`}</code>, <code>{`{date}`}</code>, <code>{`{time}`}</code>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Card>
        ))}
      </Accordion>
    </div>
  );
}

/* ---------- AI MARKETING ---------- */
function AITab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="font-medium">AI suggestions for this week</span>
        <Badge variant="secondary">Updated daily</Badge>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {AI_SUGGESTIONS.map((s) => (
          <Card key={s.id} className="bg-gradient-to-br from-primary/5 to-pink-500/5">
            <CardContent className="p-4 space-y-3">
              <Badge variant="outline" className="text-xs">{s.context}</Badge>
              <div className="font-semibold">{s.title}</div>
              <p className="text-sm text-muted-foreground">{s.body}</p>
              <Button size="sm" className="w-full" onClick={() => toast.success("Suggestion applied")}>
                <Sparkles className="h-3.5 w-3.5" /> {s.cta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-amber-600" /> Boost discoverability
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Get featured at the top of search results and category pages in your area. Sponsored
            listings drive an average <b>3.2× more profile views</b>.
          </p>
          <Button className="bg-amber-600 hover:bg-amber-700 text-white">
            <Megaphone className="h-4 w-4" /> Start Sponsored Listing
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle, Megaphone, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Tier = { id: string; name: string; price: number; benefits: string };
type City = { id: string; name: string; state: string; active: boolean };
type Category = { id: string; name: string; slug: string };
type Tpl = { id: string; key: string; label: string; body: string };

const initialTiers: Tier[] = [
  {
    id: "t1",
    name: "Silver",
    price: 499,
    benefits: "5% off all bookings\nPriority support\nMonthly free service",
  },
  {
    id: "t2",
    name: "Gold",
    price: 999,
    benefits: "10% off all bookings\nFree home service x2\nBirthday voucher",
  },
  {
    id: "t3",
    name: "Platinum",
    price: 1999,
    benefits: "15% off all bookings\nDedicated concierge\nUnlimited cancellations",
  },
];

const initialCities: City[] = [
  { id: "c1", name: "Mumbai", state: "MH", active: true },
  { id: "c2", name: "Pune", state: "MH", active: true },
  { id: "c3", name: "Bengaluru", state: "KA", active: true },
  { id: "c4", name: "Delhi", state: "DL", active: true },
  { id: "c5", name: "Hyderabad", state: "TS", active: false },
];

const initialCategories: Category[] = [
  { id: "k1", name: "Salon", slug: "salon" },
  { id: "k2", name: "Spa", slug: "spa" },
  { id: "k3", name: "Tattoo", slug: "tattoo" },
  { id: "k4", name: "Barber", slug: "barber" },
  { id: "k5", name: "Bridal", slug: "bridal" },
];

const initialTemplates: Tpl[] = [
  {
    id: "wa1",
    key: "booking_confirm",
    label: "Booking Confirmation",
    body: "Hi {name}, your booking at {shop} on {date} is confirmed. Ref #{id}.",
  },
  {
    id: "wa2",
    key: "reminder",
    label: "Booking Reminder",
    body: "Hi {name}, friendly reminder for your {service} appointment tomorrow at {time}.",
  },
  {
    id: "wa3",
    key: "review_request",
    label: "Review Request",
    body: "Hi {name}, how was your visit to {shop}? Tap to leave a review: {link}",
  },
  {
    id: "wa4",
    key: "birthday",
    label: "Birthday Wish",
    body: "Happy birthday {name}! 🎂 Enjoy 20% off your next booking with code BDAY20.",
  },
  {
    id: "wa5",
    key: "reactivation",
    label: "Reactivation",
    body: "Hi {name}, we miss you! Here's ₹100 wallet credit on your next booking.",
  },
];

export function PlatformSettingsPage() {
  const [commissionMode, setCommissionMode] = useState<"global" | "perBusiness">("global");
  const [globalCommission, setGlobalCommission] = useState(10);
  const [perBusiness, setPerBusiness] = useState([
    { id: "b1", name: "Luxe Hair & Spa", rate: 8 },
    { id: "b2", name: "Glow Beauty Studio", rate: 12 },
    { id: "b3", name: "QuickCuts Barbershop", rate: 10 },
  ]);

  const [rewards, setRewards] = useState({ perRupee: 5, signup: 100, review: 20, expiryDays: 365 });
  const [referral, setReferral] = useState({ referrer: 250, referee: 150 });

  const [tiers, setTiers] = useState(initialTiers);
  const [settlementTime, setSettlementTime] = useState("18:00");
  const [settlementCycle, setSettlementCycle] = useState("daily");

  const [cities, setCities] = useState(initialCities);
  const [newCity, setNewCity] = useState({ name: "", state: "" });

  const [categories, setCategories] = useState(initialCategories);
  const [newCategory, setNewCategory] = useState({ name: "", slug: "" });

  const [templates, setTemplates] = useState(initialTemplates);

  const [announcement, setAnnouncement] = useState(
    "📢 Platform-wide festive offer: Earn 2x reward points until June 30!",
  );
  const [announcementActive, setAnnouncementActive] = useState(true);

  const [maintenance, setMaintenance] = useState(false);

  const save = (what: string) => toast.success(`${what} saved`);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header>
        <h1 className="text-heading text-2xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground text-sm">Global configuration for Nexora SalonOS</p>
      </header>

      {maintenance && (
        <div className="border-destructive bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border p-3 text-sm">
          <AlertTriangle className="h-4 w-4" /> Maintenance mode is currently <strong>ON</strong>.
          Public site shows a maintenance page.
        </div>
      )}

      <Tabs defaultValue="commission" className="space-y-4">
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="commission">Commission</TabsTrigger>
          <TabsTrigger value="rewards">Rewards & Referral</TabsTrigger>
          <TabsTrigger value="membership">Membership</TabsTrigger>
          <TabsTrigger value="settlement">Settlement</TabsTrigger>
          <TabsTrigger value="cities">Cities</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp Templates</TabsTrigger>
          <TabsTrigger value="announce">Announcement</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="commission">
          <Card>
            <CardHeader>
              <CardTitle>Commission Rate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Label>Mode</Label>
                <Select
                  value={commissionMode}
                  onValueChange={(v) => setCommissionMode(v as typeof commissionMode)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global</SelectItem>
                    <SelectItem value="perBusiness">Per Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {commissionMode === "global" ? (
                <div className="max-w-sm">
                  <Label>Global Commission (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={50}
                    value={globalCommission}
                    onChange={(e) => setGlobalCommission(Number(e.target.value))}
                  />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business</TableHead>
                      <TableHead>Rate (%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {perBusiness.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell>{b.name}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            className="h-8 w-24"
                            value={b.rate}
                            onChange={(e) =>
                              setPerBusiness((p) =>
                                p.map((x) =>
                                  x.id === b.id ? { ...x, rate: Number(e.target.value) } : x,
                                ),
                              )
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <div className="flex justify-end">
                <Button onClick={() => save("Commission")}>Save</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reward Rules</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Points per ₹100 spent</Label>
                <Input
                  type="number"
                  value={rewards.perRupee}
                  onChange={(e) => setRewards({ ...rewards, perRupee: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Signup bonus (pts)</Label>
                <Input
                  type="number"
                  value={rewards.signup}
                  onChange={(e) => setRewards({ ...rewards, signup: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Review reward (pts)</Label>
                <Input
                  type="number"
                  value={rewards.review}
                  onChange={(e) => setRewards({ ...rewards, review: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Points expiry (days)</Label>
                <Input
                  type="number"
                  value={rewards.expiryDays}
                  onChange={(e) => setRewards({ ...rewards, expiryDays: Number(e.target.value) })}
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button onClick={() => save("Reward rules")}>Save</Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Referral Rewards</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Referrer reward (₹)</Label>
                <Input
                  type="number"
                  value={referral.referrer}
                  onChange={(e) => setReferral({ ...referral, referrer: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Referee reward (₹)</Label>
                <Input
                  type="number"
                  value={referral.referee}
                  onChange={(e) => setReferral({ ...referral, referee: Number(e.target.value) })}
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button onClick={() => save("Referral rewards")}>Save</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="membership">
          <Card>
            <CardHeader>
              <CardTitle>Membership Plans</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Accordion type="single" collapsible defaultValue="t1">
                {tiers.map((t) => (
                  <AccordionItem key={t.id} value={t.id}>
                    <AccordionTrigger>
                      <span className="flex items-center gap-2">
                        {t.name}
                        <Badge variant="outline">₹{t.price}/mo</Badge>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <Label>Tier Name</Label>
                          <Input
                            value={t.name}
                            onChange={(e) =>
                              setTiers((p) =>
                                p.map((x) => (x.id === t.id ? { ...x, name: e.target.value } : x)),
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label>Price (₹/month)</Label>
                          <Input
                            type="number"
                            value={t.price}
                            onChange={(e) =>
                              setTiers((p) =>
                                p.map((x) =>
                                  x.id === t.id ? { ...x, price: Number(e.target.value) } : x,
                                ),
                              )
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Benefits (one per line)</Label>
                        <Textarea
                          rows={5}
                          value={t.benefits}
                          onChange={(e) =>
                            setTiers((p) =>
                              p.map((x) =>
                                x.id === t.id ? { ...x, benefits: e.target.value } : x,
                              ),
                            )
                          }
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <div className="flex justify-end">
                <Button onClick={() => save("Membership plans")}>Save</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settlement">
          <Card>
            <CardHeader>
              <CardTitle>Settlement Window</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Cycle</Label>
                <Select value={settlementCycle} onValueChange={setSettlementCycle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily (T+1)</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="instant">Instant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Settlement Time</Label>
                <Input
                  type="time"
                  value={settlementTime}
                  onChange={(e) => setSettlementTime(e.target.value)}
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button onClick={() => save("Settlement window")}>Save</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cities">
          <Card>
            <CardHeader>
              <CardTitle>City Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2 md:grid-cols-[2fr_1fr_auto]">
                <Input
                  placeholder="City name"
                  value={newCity.name}
                  onChange={(e) => setNewCity({ ...newCity, name: e.target.value })}
                />
                <Input
                  placeholder="State code (e.g. MH)"
                  value={newCity.state}
                  onChange={(e) => setNewCity({ ...newCity, state: e.target.value })}
                />
                <Button
                  onClick={() => {
                    if (!newCity.name.trim()) return;
                    setCities((p) => [
                      ...p,
                      {
                        id: `c${Date.now()}`,
                        name: newCity.name.trim(),
                        state: newCity.state.trim().toUpperCase(),
                        active: true,
                      },
                    ]);
                    setNewCity({ name: "", state: "" });
                    toast.success("City added");
                  }}
                >
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>City</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cities.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.name}</TableCell>
                      <TableCell>{c.state}</TableCell>
                      <TableCell>
                        <Switch
                          checked={c.active}
                          onCheckedChange={() =>
                            setCities((p) =>
                              p.map((x) => (x.id === c.id ? { ...x, active: !x.active } : x)),
                            )
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setCities((p) => p.filter((x) => x.id !== c.id))}
                        >
                          <Trash2 className="text-destructive h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Category Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2 md:grid-cols-[2fr_2fr_auto]">
                <Input
                  placeholder="Category name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                />
                <Input
                  placeholder="Slug (e.g. nail-art)"
                  value={newCategory.slug}
                  onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                />
                <Button
                  onClick={() => {
                    if (!newCategory.name.trim()) return;
                    setCategories((p) => [
                      ...p,
                      {
                        id: `k${Date.now()}`,
                        name: newCategory.name.trim(),
                        slug:
                          newCategory.slug.trim() ||
                          newCategory.name.toLowerCase().replace(/\s+/g, "-"),
                      },
                    ]);
                    setNewCategory({ name: "", slug: "" });
                    toast.success("Category added");
                  }}
                >
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <Input
                          value={c.name}
                          className="h-8"
                          onChange={(e) =>
                            setCategories((p) =>
                              p.map((x) => (x.id === c.id ? { ...x, name: e.target.value } : x)),
                            )
                          }
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        {c.slug}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setCategories((p) => p.filter((x) => x.id !== c.id))}
                        >
                          <Trash2 className="text-destructive h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Notification Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible defaultValue="wa1">
                {templates.map((t) => (
                  <AccordionItem key={t.id} value={t.id}>
                    <AccordionTrigger>
                      {t.label}
                      <span className="text-muted-foreground ml-2 font-mono text-xs">{t.key}</span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      <Textarea
                        rows={4}
                        value={t.body}
                        onChange={(e) =>
                          setTemplates((p) =>
                            p.map((x) => (x.id === t.id ? { ...x, body: e.target.value } : x)),
                          )
                        }
                      />
                      <div className="text-muted-foreground text-xs">
                        Variables: {"{name} {shop} {service} {date} {time} {id} {link}"}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <div className="mt-3 flex justify-end">
                <Button onClick={() => save("Templates")}>Save Templates</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="announce">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" /> System Announcement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Show on public site</Label>
                <Switch checked={announcementActive} onCheckedChange={setAnnouncementActive} />
              </div>
              <div>
                <Label>Message (Markdown supported)</Label>
                <Textarea
                  rows={6}
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                />
              </div>
              <div className="bg-muted/40 rounded-lg border p-3">
                <div className="text-muted-foreground mb-1 text-xs">Preview</div>
                <div className="whitespace-pre-wrap text-sm">{announcement}</div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => save("Announcement")}>Publish</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <div className="font-semibold">Maintenance Mode</div>
                  <p className="text-muted-foreground text-sm">
                    Show maintenance page to all non-admin users.
                  </p>
                </div>
                <Switch
                  checked={maintenance}
                  onCheckedChange={(v) => {
                    setMaintenance(v);
                    toast.success(`Maintenance ${v ? "enabled" : "disabled"}`);
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

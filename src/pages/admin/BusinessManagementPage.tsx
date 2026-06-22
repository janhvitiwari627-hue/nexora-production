import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowUpDown, Ban, Check, Eye, Mail, MapPin, Phone, Search, Star, X,
} from "lucide-react";
import { toast } from "sonner";
import {
  ADMIN_BUSINESSES, STATUS_META, type AdminBusiness, type BusinessStatus,
} from "./mockBusinesses";
import { PendingOwnersPanel } from "@/components/admin/PendingOwnersPanel";

type SortKey = "name" | "joinedAt" | "totalBookings" | "revenue" | "rating";

const TABS: Array<"all" | BusinessStatus> = ["all", "pending", "active", "suspended", "rejected"];

export function BusinessManagementPage() {
  const [items, setItems] = useState<AdminBusiness[]>(ADMIN_BUSINESSES);
  const [tab, setTab] = useState<"all" | BusinessStatus>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "joinedAt", dir: "desc" });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<AdminBusiness | null>(null);
  const [reasonModal, setReasonModal] = useState<null | {
    business: AdminBusiness; action: "reject" | "suspend";
  }>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = items.filter((b) => tab === "all" || b.status === tab);
    if (q) {
      list = list.filter((b) =>
        b.name.toLowerCase().includes(q) ||
        b.owner.toLowerCase().includes(q) ||
        b.mobile.includes(q) ||
        b.area.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q),
      );
    }
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      const av = a[sort.key]; const bv = b[sort.key];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [items, tab, query, sort]);

  const counts = useMemo(() => {
    const base: Record<string, number> = { all: items.length };
    for (const s of ["pending", "active", "suspended", "rejected"] as BusinessStatus[]) {
      base[s] = items.filter((b) => b.status === s).length;
    }
    return base;
  }, [items]);

  const toggleSort = (key: SortKey) =>
    setSort((s) => ({ key, dir: s.key === key && s.dir === "asc" ? "desc" : "asc" }));

  const setStatus = (id: string, status: BusinessStatus, msg: string) => {
    setItems(items.map((b) => b.id === id ? { ...b, status } : b));
    toast.success(msg);
  };

  const toggleOne = (id: string) => {
    const n = new Set(selected);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelected(n);
  };
  const toggleAll = () =>
    setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map((b) => b.id)));

  const bulk = (status: BusinessStatus, label: string) => {
    setItems(items.map((b) => selected.has(b.id) ? { ...b, status } : b));
    toast.success(`${selected.size} businesses ${label}`);
    setSelected(new Set());
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Business Management</h1>
        <p className="text-sm text-muted-foreground">Approve, review and moderate businesses across the platform.</p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t} value={t} className="capitalize">
              {t} <Badge variant="secondary" className="ml-2">{counts[t] ?? 0}</Badge>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, owner, mobile or area"
            className="pl-9"
          />
        </div>
        {selected.size > 0 && (
          <div className="flex items-center gap-2 ml-auto rounded-md bg-primary/10 border border-primary/30 px-3 py-1.5">
            <span className="text-sm font-medium">{selected.size} selected</span>
            <Button size="sm" variant="ghost" onClick={() => bulk("active", "approved")}>
              <Check className="h-3.5 w-3.5" /> Approve
            </Button>
            <Button size="sm" variant="ghost" onClick={() => bulk("suspended", "suspended")}>
              <Ban className="h-3.5 w-3.5" /> Suspend
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Clear</Button>
          </div>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={selected.size > 0 && selected.size === filtered.length}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>
                  <button onClick={() => toggleSort("name")} className="flex items-center gap-1 hover:text-foreground">
                    Business <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>
                  <button onClick={() => toggleSort("joinedAt")} className="flex items-center gap-1 hover:text-foreground">
                    Joined <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead className="text-right">
                  <button onClick={() => toggleSort("totalBookings")} className="flex items-center gap-1 hover:text-foreground ml-auto">
                    Bookings <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead className="text-right">
                  <button onClick={() => toggleSort("revenue")} className="flex items-center gap-1 hover:text-foreground ml-auto">
                    Revenue <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button onClick={() => toggleSort("rating")} className="flex items-center gap-1 hover:text-foreground">
                    Rating <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((b) => (
                <TableRow key={b.id} data-state={selected.has(b.id) ? "selected" : undefined}>
                  <TableCell>
                    <Checkbox checked={selected.has(b.id)} onCheckedChange={() => toggleOne(b.id)} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={b.avatar} />
                        <AvatarFallback>{b.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{b.name}</div>
                        <div className="text-xs text-muted-foreground">{b.category}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{b.owner}</div>
                    <div className="text-xs text-muted-foreground">{b.mobile}</div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div>{b.area}</div>
                    <div className="text-muted-foreground">{b.city}</div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{b.joinedAt}</TableCell>
                  <TableCell className="text-right tabular-nums">{b.totalBookings.toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums">₹{(b.revenue / 100000).toFixed(1)}L</TableCell>
                  <TableCell>
                    {b.rating > 0 ? (
                      <div className="flex items-center gap-1 text-xs">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {b.rating} <span className="text-muted-foreground">({b.reviews})</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_META[b.status].classes}>{STATUS_META[b.status].label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setDetail(b)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {b.status === "pending" && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => setStatus(b.id, "active", "Business approved")}>
                            <Check className="h-4 w-4 text-emerald-600" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setReasonModal({ business: b, action: "reject" })}>
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      )}
                      {b.status === "active" && (
                        <Button variant="ghost" size="icon" onClick={() => setReasonModal({ business: b, action: "suspend" })}>
                          <Ban className="h-4 w-4 text-orange-600" />
                        </Button>
                      )}
                      {b.status === "suspended" && (
                        <Button variant="ghost" size="sm" onClick={() => setStatus(b.id, "active", "Business reactivated")}>
                          Reactivate
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12 text-muted-foreground text-sm">
                    No businesses match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DetailDrawer business={detail} onClose={() => setDetail(null)} />
      <ReasonModal
        state={reasonModal}
        onClose={() => setReasonModal(null)}
        onSubmit={(reason) => {
          if (!reasonModal) return;
          const { business, action } = reasonModal;
          setStatus(
            business.id,
            action === "reject" ? "rejected" : "suspended",
            `${business.name} ${action === "reject" ? "rejected" : "suspended"}: ${reason}`,
          );
          setReasonModal(null);
        }}
      />
    </div>
  );
}

function DetailDrawer({ business, onClose }: { business: AdminBusiness | null; onClose: () => void }) {
  return (
    <Sheet open={!!business} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        {business && (
          <>
            <SheetHeader>
              <SheetTitle>Business Details</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              <div className="flex items-start gap-3">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={business.avatar} />
                  <AvatarFallback>{business.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-semibold text-lg">{business.name}</div>
                  <div className="text-sm text-muted-foreground">{business.category}</div>
                  <Badge className={`${STATUS_META[business.status].classes} mt-2`}>
                    {STATUS_META[business.status].label}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">Total Bookings</div>
                  <div className="text-xl font-bold mt-1">{business.totalBookings.toLocaleString()}</div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">Lifetime Revenue</div>
                  <div className="text-xl font-bold mt-1">₹{(business.revenue / 100000).toFixed(1)}L</div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">Rating</div>
                  <div className="text-xl font-bold mt-1 flex items-center gap-1">
                    {business.rating > 0 ? (
                      <><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {business.rating}</>
                    ) : "—"}
                  </div>
                  <div className="text-xs text-muted-foreground">{business.reviews} reviews</div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">Staff</div>
                  <div className="text-xl font-bold mt-1">{business.staff}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold">Contact</div>
                <div className="text-sm flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" /> {business.mobile}</div>
                <div className="text-sm flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" /> {business.email}</div>
                <div className="text-sm flex items-start gap-2"><MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5" /> {business.address}</div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold">Submitted Photos</div>
                <div className="grid grid-cols-3 gap-2">
                  {business.photos.map((p) => (
                    <img key={p} src={p} alt="" className="aspect-square object-cover rounded-md border" />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold">Documents</div>
                {business.documents.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-sm border rounded-md px-3 py-2">
                    <span>{d.name}</span>
                    {d.verified ? (
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        <Check className="h-3 w-3" /> Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function ReasonModal({
  state, onClose, onSubmit,
}: {
  state: { business: AdminBusiness; action: "reject" | "suspend" } | null;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const isReject = state?.action === "reject";

  return (
    <Dialog open={!!state} onOpenChange={(o) => { if (!o) { onClose(); setReason(""); } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isReject ? "Reject Business" : "Suspend Business"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            {isReject ? "This business will not appear on the platform." : "The business and its bookings will be temporarily disabled."} Provide a reason — it will be shared with the owner.
          </div>
          <Label>Reason</Label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Documents do not match the submitted business name…"
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { onClose(); setReason(""); }}>Cancel</Button>
          <Button
            variant="destructive"
            disabled={!reason.trim()}
            onClick={() => { onSubmit(reason); setReason(""); }}
          >
            Confirm {isReject ? "Rejection" : "Suspension"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

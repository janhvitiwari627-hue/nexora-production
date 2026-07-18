import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  ArrowUpDown, Ban, Check, Eye, Loader2, Mail, MapPin, Phone, Search, Star, X,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PendingOwnersPanel } from "@/components/admin/PendingOwnersPanel";

type BusinessStatus = "pending" | "active" | "suspended" | "rejected";

type SalonRow = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  city: string | null;
  district: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  owner_name: string | null;
  image_url: string | null;
  logo_url: string | null;
  gallery_images: string[] | null;
  rating: number;
  reviews_count: number;
  is_active: boolean;
  is_verified: boolean;
  deleted_at: string | null;
  created_at: string;
};

const STATUS_META: Record<BusinessStatus, { label: string; classes: string }> = {
  pending: { label: "Pending", classes: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" },
  active: { label: "Active", classes: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" },
  suspended: { label: "Suspended", classes: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300" },
  rejected: { label: "Rejected", classes: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300" },
};

function statusOf(s: SalonRow): BusinessStatus {
  if (s.deleted_at) return "rejected";
  if (!s.is_active) return "suspended";
  if (!s.is_verified) return "pending";
  return "active";
}

type SortKey = "name" | "created_at" | "rating";
const TABS: Array<"all" | BusinessStatus> = ["all", "pending", "active", "suspended", "rejected"];

async function fetchSalons(): Promise<SalonRow[]> {
  const { data, error } = await supabase
    .from("salons")
    .select("id,name,slug,category,city,district,address,phone,email,owner_name,image_url,logo_url,gallery_images,rating,reviews_count,is_active,is_verified,deleted_at,created_at")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  return (data ?? []) as SalonRow[];
}

export function BusinessManagementPage() {
  const qc = useQueryClient();
  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ["admin", "businesses"],
    queryFn: fetchSalons,
  });

  const mut = useMutation({
    mutationFn: async ({ ids, patch }: { ids: string[]; patch: Partial<SalonRow> }) => {
      const { error } = await supabase.from("salons").update(patch).in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "businesses"] }),
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  const [tab, setTab] = useState<"all" | BusinessStatus>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "created_at", dir: "desc" });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<SalonRow | null>(null);
  const [reasonModal, setReasonModal] = useState<null | {
    business: SalonRow; action: "reject" | "suspend";
  }>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = items.filter((b) => tab === "all" || statusOf(b) === tab);
    if (q) {
      list = list.filter((b) =>
        b.name.toLowerCase().includes(q) ||
        (b.owner_name ?? "").toLowerCase().includes(q) ||
        (b.phone ?? "").includes(q) ||
        (b.city ?? "").toLowerCase().includes(q) ||
        (b.district ?? "").toLowerCase().includes(q),
      );
    }
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      const av = a[sort.key] as string | number | null;
      const bv = b[sort.key] as string | number | null;
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av ?? "").localeCompare(String(bv ?? "")) * dir;
    });
  }, [items, tab, query, sort]);

  const counts = useMemo(() => {
    const base: Record<string, number> = { all: items.length };
    for (const s of ["pending", "active", "suspended", "rejected"] as BusinessStatus[]) {
      base[s] = items.filter((b) => statusOf(b) === s).length;
    }
    return base;
  }, [items]);

  const toggleSort = (key: SortKey) =>
    setSort((s) => ({ key, dir: s.key === key && s.dir === "asc" ? "desc" : "asc" }));

  const applyAction = (ids: string[], action: "approve" | "suspend" | "reactivate" | "reject", msg: string) => {
    const patch: Partial<SalonRow> =
      action === "approve" ? { is_verified: true, is_active: true, deleted_at: null }
      : action === "suspend" ? { is_active: false }
      : action === "reactivate" ? { is_active: true, deleted_at: null }
      : { deleted_at: new Date().toISOString(), is_active: false };
    mut.mutate({ ids, patch }, { onSuccess: () => toast.success(msg) });
  };

  const toggleOne = (id: string) => {
    const n = new Set(selected);
    if (n.has(id)) n.delete(id); else n.add(id);
    setSelected(n);
  };
  const toggleAll = () =>
    setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map((b) => b.id)));

  if (error) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-6">
        <Card><CardContent className="py-8 text-center text-sm text-destructive">
          Could not load businesses. Admin access required.
        </CardContent></Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Business Management</h1>
        <p className="text-sm text-muted-foreground">Approve, review and moderate businesses across the platform.</p>
      </div>

      <PendingOwnersPanel />

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
            placeholder="Search name, owner, mobile or city"
            className="pl-9"
          />
        </div>
        {selected.size > 0 && (
          <div className="flex items-center gap-2 ml-auto rounded-md bg-primary/10 border border-primary/30 px-3 py-1.5">
            <span className="text-sm font-medium">{selected.size} selected</span>
            <Button size="sm" variant="ghost" onClick={() => { applyAction([...selected], "approve", `${selected.size} approved`); setSelected(new Set()); }}>
              <Check className="h-3.5 w-3.5" /> Approve
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { applyAction([...selected], "suspend", `${selected.size} suspended`); setSelected(new Set()); }}>
              <Ban className="h-3.5 w-3.5" /> Suspend
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Clear</Button>
          </div>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading businesses…
            </div>
          ) : (
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
                  <button onClick={() => toggleSort("created_at")} className="flex items-center gap-1 hover:text-foreground">
                    Joined <ArrowUpDown className="h-3 w-3" />
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
              {filtered.map((b) => {
                const st = statusOf(b);
                const avatar = b.logo_url ?? b.image_url ?? undefined;
                return (
                <TableRow key={b.id} data-state={selected.has(b.id) ? "selected" : undefined}>
                  <TableCell>
                    <Checkbox checked={selected.has(b.id)} onCheckedChange={() => toggleOne(b.id)} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={avatar} />
                        <AvatarFallback>{b.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{b.name}</div>
                        <div className="text-xs text-muted-foreground">{b.category ?? "—"}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{b.owner_name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{b.phone ?? "—"}</div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div>{b.district ?? b.address ?? "—"}</div>
                    <div className="text-muted-foreground">{b.city ?? "—"}</div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(b.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {b.rating > 0 ? (
                      <div className="flex items-center gap-1 text-xs">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {b.rating.toFixed(1)} <span className="text-muted-foreground">({b.reviews_count})</span>
                      </div>
                    ) : <span className="text-xs text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_META[st].classes}>{STATUS_META[st].label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" aria-label="View" onClick={() => setDetail(b)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {st === "pending" && (
                        <>
                          <Button variant="ghost" size="icon" aria-label="Approve" onClick={() => applyAction([b.id], "approve", "Business approved")}>
                            <Check className="h-4 w-4 text-emerald-600" />
                          </Button>
                          <Button variant="ghost" size="icon" aria-label="Reject" onClick={() => setReasonModal({ business: b, action: "reject" })}>
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      )}
                      {st === "active" && (
                        <Button variant="ghost" size="icon" aria-label="Suspend" onClick={() => setReasonModal({ business: b, action: "suspend" })}>
                          <Ban className="h-4 w-4 text-orange-600" />
                        </Button>
                      )}
                      {(st === "suspended" || st === "rejected") && (
                        <Button variant="ghost" size="sm" onClick={() => applyAction([b.id], "reactivate", "Business reactivated")}>
                          Reactivate
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                    No businesses match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      <DetailDrawer business={detail} onClose={() => setDetail(null)} />
      <ReasonModal
        state={reasonModal}
        onClose={() => setReasonModal(null)}
        onSubmit={(reason) => {
          if (!reasonModal) return;
          const { business, action } = reasonModal;
          applyAction(
            [business.id],
            action === "reject" ? "reject" : "suspend",
            `${business.name} ${action === "reject" ? "rejected" : "suspended"}: ${reason}`,
          );
          setReasonModal(null);
        }}
      />
    </div>
  );
}

function DetailDrawer({ business, onClose }: { business: SalonRow | null; onClose: () => void }) {
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
                  <AvatarImage src={business.logo_url ?? business.image_url ?? undefined} />
                  <AvatarFallback>{business.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-semibold text-lg">{business.name}</div>
                  <div className="text-sm text-muted-foreground">{business.category ?? "—"}</div>
                  <Badge className={`${STATUS_META[statusOf(business)].classes} mt-2`}>
                    {STATUS_META[statusOf(business)].label}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">Rating</div>
                  <div className="text-xl font-bold mt-1 flex items-center gap-1">
                    {business.rating > 0 ? (
                      <><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {business.rating.toFixed(1)}</>
                    ) : "—"}
                  </div>
                  <div className="text-xs text-muted-foreground">{business.reviews_count} reviews</div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">Joined</div>
                  <div className="text-sm font-medium mt-1">{new Date(business.created_at).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold">Contact</div>
                {business.phone && <div className="text-sm flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" /> {business.phone}</div>}
                {business.email && <div className="text-sm flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" /> {business.email}</div>}
                {business.address && <div className="text-sm flex items-start gap-2"><MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5" /> {business.address}</div>}
              </div>

              {business.gallery_images && business.gallery_images.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-semibold">Photos</div>
                  <div className="grid grid-cols-3 gap-2">
                    {business.gallery_images.slice(0, 6).map((p) => (
                      <img key={p} src={p} alt="" className="aspect-square object-cover rounded-md border" />
                    ))}
                  </div>
                </div>
              )}
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
  state: { business: SalonRow; action: "reject" | "suspend" } | null;
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

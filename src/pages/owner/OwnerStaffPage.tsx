import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Search, Pencil, Trash2, Star, Users, BadgeCheck, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/shared/Modal";
import { BackButton } from "@/components/shared/BackButton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useOwnerContext } from "@/hooks/use-owner-context";
import { ownerStaffQuery } from "@/lib/owner.queries";
import { deleteOwnerStaff, upsertOwnerStaff } from "@/lib/owner.functions";

const ROLES = ["Stylist", "Senior Stylist", "Colorist", "Therapist", "Makeup Artist", "Nail Artist", "Manager"];

type StaffRow = {
  id: string;
  salon_id: string;
  name: string;
  role: string | null;
  bio: string | null;
  avatar_url: string | null;
  rating: number;
  is_active: boolean;
};

function emptyStaff(salonId: string): Partial<StaffRow> {
  return { salon_id: salonId, name: "", role: "Stylist", bio: "", avatar_url: "", rating: 5, is_active: true };
}

export function OwnerStaffPage() {
  const { activeSalonId, activeSalon, isLoading: ownerLoading } = useOwnerContext();
  const qc = useQueryClient();
  const upsertFn = useServerFn(upsertOwnerStaff);
  const deleteFn = useServerFn(deleteOwnerStaff);

  const { data: staff = [], isLoading } = useQuery({
    ...ownerStaffQuery(activeSalonId ?? ""),
    enabled: !!activeSalonId,
  });

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<StaffRow> | null>(null);
  const [deleting, setDeleting] = useState<StaffRow | null>(null);

  const list = staff as StaffRow[];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((s) => {
      if (filter === "active" && !s.is_active) return false;
      if (filter === "inactive" && s.is_active) return false;
      if (!q) return true;
      return s.name.toLowerCase().includes(q) || (s.role ?? "").toLowerCase().includes(q);
    });
  }, [list, query, filter]);

  const activeCount = list.filter((s) => s.is_active).length;
  const avgRating = list.length
    ? list.reduce((a, s) => a + (s.rating || 0), 0) / list.length
    : 0;

  const upsertMut = useMutation({
    mutationFn: (input: Partial<StaffRow>) => upsertFn({ data: input as never }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["owner", "staff", activeSalonId] });
      toast.success(editing?.id ? "Staff updated" : "Staff added");
      setEditOpen(false);
    },
    onError: (e: Error) => toast.error(e.message || "Failed to save"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["owner", "staff", activeSalonId] });
      toast.success("Staff removed");
      setDeleting(null);
    },
    onError: (e: Error) => toast.error(e.message || "Failed to delete"),
  });

  const openAdd = () => {
    if (!activeSalonId) return;
    setEditing(emptyStaff(activeSalonId));
    setEditOpen(true);
  };
  const openEdit = (s: StaffRow) => {
    setEditing(s);
    setEditOpen(true);
  };

  if (ownerLoading) {
    return <div className="p-8 text-muted-foreground">Loading…</div>;
  }

  if (!activeSalonId) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <Card>
          <CardContent className="p-8 text-center space-y-3">
            <Users className="mx-auto h-10 w-10 text-muted-foreground" />
            <h1 className="text-xl font-bold">No salon connected</h1>
            <p className="text-sm text-muted-foreground">
              Complete onboarding to manage your team here.
            </p>
            <Button asChild><a href="/owner/onboarding">Start onboarding</a></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <BackButton className="mb-1" />
            <h1 className="text-heading text-2xl font-bold">Staff</h1>
            <p className="text-muted-foreground text-sm">
              {activeSalon?.name ?? "Your salon"} · {list.length} team member{list.length === 1 ? "" : "s"}
            </p>
          </div>
          <Button onClick={openAdd}><Plus className="h-4 w-4" /> Add Staff</Button>
        </header>

        {/* KPI strip */}
        <div className="grid gap-3 sm:grid-cols-3">
          <KPI icon={<Users className="h-4 w-4" />} label="Total staff" value={list.length.toString()} />
          <KPI icon={<BadgeCheck className="h-4 w-4 text-emerald-600" />} label="Active" value={activeCount.toString()} />
          <KPI icon={<TrendingUp className="h-4 w-4" />} label="Avg rating" value={avgRating ? avgRating.toFixed(1) : "—"} />
        </div>

        {/* Toolbar */}
        <div className="bg-card border-border flex flex-wrap items-center gap-3 rounded-xl border p-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or role" className="pl-9" />
          </div>
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All staff</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="text-muted-foreground p-8 text-center">Loading staff…</div>
        ) : filtered.length === 0 ? (
          <div className="bg-card border-border text-muted-foreground rounded-xl border p-12 text-center">
            {list.length === 0 ? "No staff yet. Click 'Add Staff' to get started." : "No staff match your filters."}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((s) => (
              <StaffCard key={s.id} staff={s} onEdit={() => openEdit(s)} onDelete={() => setDeleting(s)} />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={editing?.id ? "Edit Staff" : "Add Staff"} size="lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!editing?.name?.trim()) {
              toast.error("Name is required");
              return;
            }
            const payload: Partial<StaffRow> = {
              ...(editing.id ? { id: editing.id } : {}),
              salon_id: activeSalonId,
              name: editing.name.trim(),
              role: editing.role || null,
              bio: editing.bio || null,
              avatar_url: editing.avatar_url || null,
              rating: Number(editing.rating ?? 5),
              is_active: editing.is_active ?? true,
            };
            upsertMut.mutate(payload);
          }}
          className="space-y-4 p-6"
        >
          <div className="flex gap-4 items-start">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border bg-muted">
              {editing?.avatar_url ? (
                <img src={editing.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-muted-foreground text-2xl font-bold">
                  {editing?.name?.[0]?.toUpperCase() ?? "?"}
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <Label className="text-xs uppercase tracking-wide">Avatar URL</Label>
              <Input
                value={editing?.avatar_url ?? ""}
                onChange={(e) => setEditing((p) => ({ ...p, avatar_url: e.target.value }))}
                placeholder="https://…"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs uppercase tracking-wide">Full name *</Label>
              <Input
                required
                value={editing?.name ?? ""}
                onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide">Role</Label>
              <Select
                value={editing?.role ?? "Stylist"}
                onValueChange={(v) => setEditing((p) => ({ ...p, role: v }))}
              >
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide">Rating (0-5)</Label>
              <Input
                type="number" min={0} max={5} step={0.1}
                value={editing?.rating ?? 5}
                onChange={(e) => setEditing((p) => ({ ...p, rating: Number(e.target.value) }))}
                className="mt-1"
              />
            </div>
            <div className="flex items-end gap-3">
              <div className="flex h-10 items-center gap-2 rounded-md border px-3">
                <Switch
                  checked={editing?.is_active ?? true}
                  onCheckedChange={(c) => setEditing((p) => ({ ...p, is_active: c }))}
                />
                <span className="text-sm">{editing?.is_active ? "Active" : "Inactive"}</span>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wide">Bio / specializations</Label>
            <Textarea
              rows={3}
              value={editing?.bio ?? ""}
              onChange={(e) => setEditing((p) => ({ ...p, bio: e.target.value }))}
              className="mt-1"
              placeholder="e.g. 8 yrs experience · Hair color, Balayage, Keratin"
              maxLength={1000}
            />
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={upsertMut.isPending}>
              {upsertMut.isPending ? "Saving…" : editing?.id ? "Save changes" : "Add staff"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete staff" size="md">
        <div className="space-y-5 p-6">
          <p className="text-sm">
            Permanently delete <strong>{deleting?.name}</strong>? This cannot be undone.
          </p>
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button
              className="bg-danger hover:bg-danger/90 text-white"
              disabled={deleteMut.isPending}
              onClick={() => deleting && deleteMut.mutate(deleting.id)}
            >
              {deleteMut.isPending ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function KPI({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-muted-foreground inline-flex items-center gap-1.5 text-xs uppercase tracking-wide">
          {icon} {label}
        </div>
        <div className="text-heading mt-1 text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function StaffCard({ staff, onEdit, onDelete }: { staff: StaffRow; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="bg-card border-border flex flex-col rounded-2xl border p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="relative">
          {staff.avatar_url ? (
            <img src={staff.avatar_url} alt={staff.name} className="border-border h-20 w-20 rounded-2xl border object-cover" />
          ) : (
            <div className="border-border bg-muted text-muted-foreground grid h-20 w-20 place-items-center rounded-2xl border text-2xl font-bold">
              {staff.name[0]?.toUpperCase()}
            </div>
          )}
          <span className={`border-card absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 ${staff.is_active ? "bg-emerald-500" : "bg-zinc-400"}`} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold">{staff.name}</h3>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {staff.role && <Badge variant="secondary">{staff.role}</Badge>}
            <Badge variant={staff.is_active ? "default" : "outline"}>
              {staff.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="text-muted-foreground mt-1.5 inline-flex items-center gap-1 text-xs">
            <Star className="fill-amber-400 text-amber-400 h-3.5 w-3.5" />
            <span className="font-semibold">{(staff.rating ?? 0).toFixed(1)}</span>
          </div>
        </div>
      </div>

      {staff.bio && (
        <p className="text-muted-foreground mt-3 line-clamp-3 text-xs">{staff.bio}</p>
      )}

      <div className="border-border mt-4 flex gap-1 border-t pt-3">
        <Button size="sm" variant="ghost" className="flex-1" onClick={onEdit}>
          <Pencil className="h-4 w-4" /> Edit
        </Button>
        <Button size="icon" variant="ghost" className="text-danger hover:bg-danger/10" onClick={onDelete} aria-label="Delete">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

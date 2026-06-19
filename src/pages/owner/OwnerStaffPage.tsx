import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { initialStaff, type StaffMember } from "./staff/mockStaff";
import { StaffManagementCard } from "./staff/StaffManagementCard";
import { AddEditStaffModal } from "./staff/AddEditStaffModal";
import { StaffDetailModal } from "./staff/StaffDetailModal";
import { DeleteStaffModal } from "./staff/DeleteStaffModal";

export function OwnerStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff);
  const [query, setQuery] = useState("");
  const [filterAvail, setFilterAvail] = useState<"all" | "yes" | "no">("all");
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [viewing, setViewing] = useState<StaffMember | null>(null);
  const [deleting, setDeleting] = useState<StaffMember | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return staff.filter((s) => {
      if (filterAvail === "yes" && !s.available) return false;
      if (filterAvail === "no" && s.available) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.designation.toLowerCase().includes(q) ||
        s.specializations.some((x) => x.toLowerCase().includes(q))
      );
    });
  }, [staff, query, filterAvail]);

  const saveStaff = (s: StaffMember) => {
    setStaff((prev) => {
      const exists = prev.some((x) => x.id === s.id);
      return exists ? prev.map((x) => (x.id === s.id ? s : x)) : [...prev, s];
    });
  };

  const openAdd = () => { setEditing(null); setEditOpen(true); };
  const openEdit = (s: StaffMember) => { setEditing(s); setEditOpen(true); };

  const confirmDelete = (id: string, _reassignTo: string | null) => {
    setStaff((prev) => prev.filter((s) => s.id !== id));
    setDeleting(null);
  };

  const availableCount = staff.filter((s) => s.available).length;

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-heading text-2xl font-bold">Staff</h1>
            <p className="text-muted-foreground text-sm">
              {staff.length} team members · {availableCount} available now
            </p>
          </div>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" /> Add Staff
          </Button>
        </header>

        <div className="bg-card border-border flex flex-wrap items-center gap-3 rounded-xl border p-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, role, or specialization"
              className="pl-9"
            />
          </div>
          <Select value={filterAvail} onValueChange={(v) => setFilterAvail(v as typeof filterAvail)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All staff</SelectItem>
              <SelectItem value="yes">Available now</SelectItem>
              <SelectItem value="no">Off duty</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-card border-border text-muted-foreground rounded-xl border p-12 text-center">
            No staff match your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((s) => (
              <StaffManagementCard
                key={s.id}
                staff={s}
                onView={setViewing}
                onEdit={openEdit}
                onDelete={setDeleting}
              />
            ))}
          </div>
        )}
      </div>

      <AddEditStaffModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={saveStaff}
        initial={editing}
      />
      <StaffDetailModal staff={viewing} onClose={() => setViewing(null)} onEdit={openEdit} />
      <DeleteStaffModal
        staff={deleting}
        others={staff.filter((s) => s.id !== deleting?.id)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

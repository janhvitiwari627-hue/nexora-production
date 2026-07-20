import { useState } from "react";
import { ArrowUpDown, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./BookingCard";
import type { OwnerBooking } from "./mockOwnerBookings";

type SortKey = "customer" | "date" | "staff" | "total" | "status";

export function ListView({
  bookings,
  selectedIds,
  onSelect,
  onSelectAll,
  onView,
}: {
  bookings: OwnerBooking[];
  selectedIds: Set<string>;
  onSelect: (id: string, c: boolean) => void;
  onSelectAll: (c: boolean) => void;
  onView: (b: OwnerBooking) => void;
}) {
  const [sort, setSort] = useState<{ key: SortKey; asc: boolean }>({
    key: "date",
    asc: false,
  });

  const sorted = [...bookings].sort((a, b) => {
    const v = sort.asc ? 1 : -1;
    const av = a[sort.key];
    const bv = b[sort.key];
    if (typeof av === "number" && typeof bv === "number") return (av - bv) * v;
    return String(av).localeCompare(String(bv)) * v;
  });

  const allSelected = bookings.length > 0 && bookings.every((b) => selectedIds.has(b.id));

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <button
      onClick={() => setSort((s) => ({ key: k, asc: s.key === k ? !s.asc : true }))}
      className="hover:text-heading inline-flex items-center gap-1"
    >
      {label} <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  return (
    <div className="bg-card border-border overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(c) => onSelectAll(Boolean(c))}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead>
              <SortBtn k="customer" label="Customer" />
            </TableHead>
            <TableHead>Service</TableHead>
            <TableHead>
              <SortBtn k="staff" label="Staff" />
            </TableHead>
            <TableHead>
              <SortBtn k="date" label="Date / Time" />
            </TableHead>
            <TableHead>
              <SortBtn k="total" label="Total" />
            </TableHead>
            <TableHead>
              <SortBtn k="status" label="Status" />
            </TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((b) => (
            <TableRow key={b.id}>
              <TableCell>
                <Checkbox
                  checked={selectedIds.has(b.id)}
                  onCheckedChange={(c) => onSelect(b.id, Boolean(c))}
                  aria-label={`Select ${b.id}`}
                />
              </TableCell>
              <TableCell>
                <div className="text-heading font-medium">{b.customer}</div>
                <div className="text-muted-foreground text-xs">
                  {b.id} · {b.mobile}
                </div>
              </TableCell>
              <TableCell className="text-sm">{b.service}</TableCell>
              <TableCell className="text-sm">{b.staff}</TableCell>
              <TableCell className="text-sm">
                {b.date}
                <div className="text-muted-foreground text-xs">{b.time}</div>
              </TableCell>
              <TableCell className="text-sm">₹{b.total.toLocaleString()}</TableCell>
              <TableCell>
                <StatusBadge status={b.status} />
              </TableCell>
              <TableCell>
                <Button size="sm" variant="ghost" onClick={() => onView(b)}>
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

import { useMemo, useState } from "react";
import { CalendarDays, Check, Download, LayoutGrid, List as ListIcon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  STATUS_META,
  type OwnerBooking,
  type OwnerBookingStatus,
} from "./bookings/mockOwnerBookings";
import { BookingCard } from "./bookings/BookingCard";
import { CalendarView } from "./bookings/CalendarView";
import { ListView } from "./bookings/ListView";
import { BookingDetailModal } from "./bookings/BookingDetailModal";
import { useOwnerLiveBookings } from "@/hooks/use-owner-live-bookings";
import { useOwnerContext } from "@/hooks/use-owner-context";

type FilterTab = "all" | OwnerBookingStatus;
const TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
  { key: "no_show", label: "No Show" },
];

type ViewMode = "cards" | "calendar" | "list";

export function OwnerBookingsPage() {
  const { activeSalon, hasSalon: isLive } = useOwnerContext();
  const live = useOwnerLiveBookings();
  const bookings = live.bookings;
  const [tab, setTab] = useState<FilterTab>("all");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ViewMode>("cards");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [openBooking, setOpenBooking] = useState<OwnerBooking | null>(null);
  const [suggestBooking, setSuggestBooking] = useState<OwnerBooking | null>(null);
  const [suggestDate, setSuggestDate] = useState("");
  const [suggestTime, setSuggestTime] = useState("");
  const [suggestNote, setSuggestNote] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings.filter((b) => {
      if (tab !== "all" && b.status !== tab) return false;
      if (!q) return true;
      return (
        b.customer.toLowerCase().includes(q) ||
        b.mobile.includes(q) ||
        b.id.toLowerCase().includes(q)
      );
    });
  }, [bookings, tab, query]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: bookings.length };
    for (const b of bookings) c[b.status] = (c[b.status] || 0) + 1;
    return c;
  }, [bookings]);

  const updateStatus = (id: string, next: OwnerBookingStatus) => {
    live.setStatus(id, next);
  };

  const handleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const n = new Set(prev);
      if (checked) n.add(id);
      else n.delete(id);
      return n;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? new Set(filtered.map((b) => b.id)) : new Set());
  };

  const acceptSelected = () => {
    const ids = Array.from(selectedIds);
    ids.forEach((id) => {
      const b = bookings.find((x) => x.id === id);
      if (b && b.status === "pending") {
        live.setStatus(id, "confirmed");
      }
    });
    setSelectedIds(new Set());
  };

  const exportCsv = () => {
    const headers = [
      "ID",
      "Customer",
      "Mobile",
      "Service",
      "Staff",
      "Date",
      "Time",
      "Advance",
      "Total",
      "Status",
    ];
    const rows = filtered.map((b) =>
      [b.id, b.customer, b.mobile, b.service, b.staff, b.date, b.time, b.advance, b.total, b.status]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const allFilteredSelected = filtered.length > 0 && filtered.every((b) => selectedIds.has(b.id));

  return (
    <div className="bg-background min-h-screen w-full max-w-full overflow-x-hidden">
      <div className="mx-auto w-full max-w-7xl space-y-6 overflow-x-hidden px-3 py-5 sm:px-6 sm:py-6 lg:px-8">
        <header className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0">
            <h1 className="text-heading text-2xl font-bold">Bookings</h1>
            <p className="text-muted-foreground text-sm">
              {isLive && activeSalon
                ? `Live bookings for ${activeSalon.name}.`
                : "No salon linked yet — create your shop website to start receiving bookings."}
            </p>
          </div>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <div className="bg-card border-border inline-flex max-w-full overflow-x-auto rounded-lg border p-0.5">
              {(
                [
                  { k: "cards", icon: LayoutGrid, label: "Cards" },
                  { k: "calendar", icon: CalendarDays, label: "Calendar" },
                  { k: "list", icon: ListIcon, label: "List" },
                ] as const
              ).map(({ k, icon: Icon, label }) => (
                <button
                  key={k}
                  onClick={() => setView(k)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition",
                    view === k
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-heading",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" /> {label}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </div>
        </header>

        {/* Search + bulk */}
        <div className="bg-card border-border grid grid-cols-1 items-center gap-3 rounded-xl border p-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
          <div className="relative min-w-0 flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search by name, mobile, or booking ID"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <label className="text-muted-foreground inline-flex min-w-0 items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={allFilteredSelected}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="accent-primary h-4 w-4"
            />
            Select all ({filtered.length})
          </label>
          <Button
            size="sm"
            disabled={selectedIds.size === 0}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={acceptSelected}
          >
            <Check className="h-4 w-4" /> Confirm Selected ({selectedIds.size})
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-border flex gap-1 overflow-x-auto border-b [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((t) => {
            const active = tab === t.key;
            const count = counts[t.key] ?? 0;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition",
                  active
                    ? "border-primary text-primary"
                    : "text-muted-foreground hover:text-heading border-transparent",
                )}
              >
                {t.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                    active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        {view === "calendar" ? (
          <CalendarView bookings={filtered} onSelect={setOpenBooking} />
        ) : view === "list" ? (
          <ListView
            bookings={filtered}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onSelectAll={handleSelectAll}
            onView={setOpenBooking}
          />
        ) : filtered.length === 0 ? (
          <div className="bg-card border-border text-muted-foreground rounded-xl border p-12 text-center">
            No bookings match your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {filtered.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                selected={selectedIds.has(b.id)}
                onSelect={handleSelect}
                onView={setOpenBooking}
                onAction={updateStatus}
                onSuggest={(booking) => {
                  setSuggestBooking(booking);
                  setSuggestDate(booking.date);
                  setSuggestTime(booking.time.slice(0, 5));
                  setSuggestNote("");
                }}
              />
            ))}
          </div>
        )}

        {/* Status legend */}
        <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
          <span className="font-semibold uppercase">Legend:</span>
          {(Object.keys(STATUS_META) as OwnerBookingStatus[]).map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5">
              <span className={cn("h-2 w-2 rounded-full", STATUS_META[s].dot)} />
              {STATUS_META[s].label}
            </span>
          ))}
        </div>
      </div>

      <BookingDetailModal booking={openBooking} onClose={() => setOpenBooking(null)} />
      <Dialog
        open={Boolean(suggestBooking)}
        onOpenChange={(open) => !open && setSuggestBooking(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Suggest a new time</DialogTitle>
            <DialogDescription>
              The customer will be notified and can accept or reject this time.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  value={suggestDate}
                  onChange={(e) => setSuggestDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Time</label>
                <Input
                  type="time"
                  value={suggestTime}
                  onChange={(e) => setSuggestTime(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Message (optional)</label>
              <Textarea
                maxLength={300}
                value={suggestNote}
                onChange={(e) => setSuggestNote(e.target.value)}
                placeholder="For example: The stylist is available at this time."
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuggestBooking(null)}>
              Cancel
            </Button>
            <Button
              disabled={!suggestDate || !suggestTime || live.isUpdating}
              onClick={() => {
                if (!suggestBooking) return;
                live.suggestTime(
                  suggestBooking.id,
                  suggestDate,
                  suggestTime,
                  suggestNote || undefined,
                );
                setSuggestBooking(null);
              }}
            >
              Send New Time
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

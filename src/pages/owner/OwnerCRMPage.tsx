import { useMemo, useState } from "react";
import { Cake, Eye, MessageCircle, Search, Send, TagIcon, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Modal } from "@/components/shared/Modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  TAG_META,
  crmCustomers as initialCustomers,
  daysSince,
  isBirthdayThisMonth,
  isLostCustomer,
  type CRMCustomer,
  type CustomerTag,
} from "./crm/mockCRM";
import { CustomerDetailDrawer } from "./crm/CustomerDetailDrawer";
import { WhatsAppComposer } from "./crm/WhatsAppComposer";

type TagFilter = "all" | "lost_60" | CustomerTag;

const FILTERS: { key: TagFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "regular", label: "Regular" },
  { key: "vip", label: "VIP" },
  { key: "lost_60", label: "Lost (60+ days)" },
  { key: "inactive", label: "Inactive" },
  { key: "high_value", label: "High Value" },
  { key: "membership", label: "Membership" },
  { key: "referral_champion", label: "Referral Champion" },
];

export function OwnerCRMPage() {
  const [customers, setCustomers] = useState<CRMCustomer[]>(initialCustomers);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<TagFilter>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [active, setActive] = useState<CRMCustomer | null>(null);
  const [broadcastOpen, setBroadcastOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return customers.filter((c) => {
      if (filter === "lost_60") {
        if (!isLostCustomer(c)) return false;
      } else if (filter !== "all") {
        if (!c.tags.includes(filter)) return false;
      }
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.mobile.includes(q) ||
        (c.email?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [customers, filter, query]);

  const toggleOne = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (checked) n.add(id); else n.delete(id);
      return n;
    });
  };
  const toggleAll = (checked: boolean) => {
    setSelected(checked ? new Set(filtered.map((c) => c.id)) : new Set());
  };

  const update = (c: CRMCustomer) => {
    setCustomers((prev) => prev.map((x) => (x.id === c.id ? c : x)));
    setActive(c);
  };

  const bulkAddTag = (tag: CustomerTag) => {
    setCustomers((prev) =>
      prev.map((c) => (selected.has(c.id) && !c.tags.includes(tag) ? { ...c, tags: [...c.tags, tag] } : c)),
    );
  };

  const allFilteredSelected = filtered.length > 0 && filtered.every((c) => selected.has(c.id));

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: customers.length, lost_60: customers.filter(isLostCustomer).length };
    for (const x of customers) for (const t of x.tags) c[t] = (c[t] || 0) + 1;
    return c;
  }, [customers]);

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <header>
          <h1 className="text-heading text-2xl font-bold">Customer CRM</h1>
          <p className="text-muted-foreground text-sm">
            {customers.length} customers · {counts.lost_60 ?? 0} at risk · {customers.filter(isBirthdayThisMonth).length} birthdays this month
          </p>
        </header>

        {/* Tag filter chips */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-body hover:bg-muted/40",
                )}
              >
                {f.label}
                <span className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px]",
                  active ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground",
                )}>
                  {counts[f.key] ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search + bulk actions */}
        <div className="bg-card border-border flex flex-wrap items-center gap-3 rounded-xl border p-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, mobile, or email"
              className="pl-9"
            />
          </div>
          <span className="text-muted-foreground text-xs">
            {selected.size} selected
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={selected.size === 0}
            onClick={() => bulkAddTag("vip")}
          >
            <TagIcon className="h-4 w-4" /> Tag as VIP
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={selected.size === 0}
          >
            <Megaphone className="h-4 w-4" /> Create Campaign
          </Button>
          <Button
            size="sm"
            disabled={selected.size === 0}
            className="bg-success hover:bg-success/90 text-white"
            onClick={() => setBroadcastOpen(true)}
          >
            <Send className="h-4 w-4" /> WhatsApp Broadcast
          </Button>
        </div>

        {/* Table */}
        <div className="bg-card border-border overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={allFilteredSelected}
                    onCheckedChange={(c) => toggleAll(Boolean(c))}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Last visit</TableHead>
                <TableHead>Visits</TableHead>
                <TableHead>Lifetime spend</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id} className="hover:bg-muted/30">
                  <TableCell>
                    <Checkbox
                      checked={selected.has(c.id)}
                      onCheckedChange={(v) => toggleOne(c.id, Boolean(v))}
                      aria-label={`Select ${c.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/15 text-primary grid h-9 w-9 place-items-center rounded-full text-xs font-bold">
                        {c.avatar}
                      </div>
                      <div>
                        <div className="text-heading inline-flex items-center gap-1.5 font-medium">
                          {c.name}
                          {isBirthdayThisMonth(c) && <Cake className="text-warning h-3.5 w-3.5" aria-label="Birthday this month" />}
                        </div>
                        {c.email && <div className="text-muted-foreground text-xs">{c.email}</div>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <a href={`tel:${c.mobile}`} className="hover:text-primary">{c.mobile}</a>
                  </TableCell>
                  <TableCell className="text-sm">
                    {c.lastVisit}
                    <div className="text-muted-foreground text-xs">{daysSince(c.lastVisit)}d ago</div>
                  </TableCell>
                  <TableCell className="text-sm">{c.totalVisits}</TableCell>
                  <TableCell className="text-sm font-semibold">₹{c.lifetimeSpend.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {c.tags.map((t) => (
                        <span key={t} className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase", TAG_META[t].bg, TAG_META[t].text)}>
                          {TAG_META[t].label}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <a
                        href={`https://wa.me/91${c.mobile}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-success hover:bg-success/10 grid h-8 w-8 place-items-center rounded-md"
                        aria-label="WhatsApp"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </a>
                      <Button size="icon" variant="ghost" onClick={() => setActive(c)} aria-label="View">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-muted-foreground py-12 text-center">
                    No customers match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <CustomerDetailDrawer customer={active} onClose={() => setActive(null)} onUpdate={update} />

      <Modal
        open={broadcastOpen}
        onClose={() => setBroadcastOpen(false)}
        title={`WhatsApp Broadcast (${selected.size} recipients)`}
        size="lg"
      >
        <div className="space-y-4 p-6">
          <p className="text-muted-foreground text-sm">
            Your message will be sent to {selected.size} selected customers via WhatsApp Business API.
          </p>
          <WhatsAppComposer onSend={() => setBroadcastOpen(false)} />
        </div>
      </Modal>
    </div>
  );
}

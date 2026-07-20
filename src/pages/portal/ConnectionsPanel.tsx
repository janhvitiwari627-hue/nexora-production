import { useEffect, useMemo, useState } from "react";
import { Handshake, Plus, Check, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { EmptyHint } from "./PortalLayout";
import {
  listMyConnections,
  createConnection,
  respondConnection,
  listBrandsLite,
  listDistributorsLite,
  type Brand,
  type Distributor,
  type BrandDistributorConnection,
} from "./lib";

type Props = {
  brand: Brand | null;
  distributor: Distributor | null;
};

export function ConnectionsPanel({ brand, distributor }: Props) {
  const [items, setItems] = useState<BrandDistributorConnection[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    listMyConnections("")
      .then(setItems)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(refresh, []);

  const incoming = useMemo(
    () =>
      items.filter(
        (c) =>
          c.status === "pending" &&
          ((c.initiated_by === "brand" && distributor?.id === c.distributor_id) ||
            (c.initiated_by === "distributor" && brand?.id === c.brand_id)),
      ),
    [items, brand, distributor],
  );
  const outgoing = useMemo(
    () =>
      items.filter(
        (c) =>
          c.status === "pending" &&
          ((c.initiated_by === "brand" && brand?.id === c.brand_id) ||
            (c.initiated_by === "distributor" && distributor?.id === c.distributor_id)),
      ),
    [items, brand, distributor],
  );
  const accepted = useMemo(() => items.filter((c) => c.status === "accepted"), [items]);

  const onRespond = async (id: string, status: "accepted" | "rejected" | "cancelled") => {
    try {
      await respondConnection(id, status);
      toast.success(
        status === "accepted"
          ? "Connection accepted"
          : status === "rejected"
            ? "Request declined"
            : "Request cancelled",
      );
      refresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <section className="mt-10">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Handshake className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-heading">Partnerships</h3>
        </div>
        <div className="flex gap-2">
          {brand && (
            <InviteDialog
              title="Invite a distributor"
              from="brand"
              selfId={brand.id}
              onCreated={refresh}
            />
          )}
          {distributor && (
            <InviteDialog
              title="Request brand partnership"
              from="distributor"
              selfId={distributor.id}
              onCreated={refresh}
            />
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading partnerships…</p>
      ) : items.length === 0 ? (
        <EmptyHint
          icon={Handshake}
          title="No partnerships yet"
          body={
            brand || distributor
              ? "Send a request to start a brand–distributor partnership."
              : "Register as a brand or distributor to start partnering."
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <ColumnCard title="Incoming" icon={<Clock className="h-4 w-4" />} items={incoming}>
            {(c) => (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-gradient-cta text-primary-foreground"
                  onClick={() => onRespond(c.id, "accepted")}
                >
                  <Check className="mr-1 h-3 w-3" />
                  Accept
                </Button>
                <Button size="sm" variant="outline" onClick={() => onRespond(c.id, "rejected")}>
                  <X className="mr-1 h-3 w-3" />
                  Decline
                </Button>
              </div>
            )}
          </ColumnCard>
          <ColumnCard title="Sent" icon={<Clock className="h-4 w-4" />} items={outgoing}>
            {(c) => (
              <Button size="sm" variant="ghost" onClick={() => onRespond(c.id, "cancelled")}>
                Cancel
              </Button>
            )}
          </ColumnCard>
          <ColumnCard title="Partners" icon={<Check className="h-4 w-4" />} items={accepted}>
            {() => <Badge className="bg-primary text-primary-foreground">Active</Badge>}
          </ColumnCard>
        </div>
      )}
    </section>
  );
}

function ColumnCard({
  title,
  icon,
  items,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  items: BrandDistributorConnection[];
  children: (c: BrandDistributorConnection) => React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-heading">
        {icon}
        {title} <span className="text-muted-foreground">({items.length})</span>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">None</p>
      ) : (
        <ul className="space-y-3">
          {items.map((c) => (
            <li key={c.id} className="rounded-lg border border-border/60 p-3">
              <p className="text-sm font-semibold text-heading">{c.brand?.name ?? "Brand"}</p>
              <p className="text-xs text-muted-foreground">
                ↔ {c.distributor?.company_name ?? "Distributor"}
              </p>
              {c.message && <p className="mt-1 line-clamp-2 text-xs text-body">"{c.message}"</p>}
              <div className="mt-2">{children(c)}</div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function InviteDialog({
  title,
  from,
  selfId,
  onCreated,
}: {
  title: string;
  from: "brand" | "distributor";
  selfId: string;
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<Array<{ id: string; label: string }>>([]);
  const [targetId, setTargetId] = useState("");
  const [message, setMessage] = useState("");
  const [territoryNotes, setTerritoryNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      if (from === "brand") {
        const rows = await listDistributorsLite();
        setOptions(
          rows.map((r: any) => ({
            id: r.id,
            label: `${r.company_name}${r.state ? ` — ${r.state}` : ""}`,
          })),
        );
      } else {
        const rows = await listBrandsLite();
        setOptions(rows.map((r: any) => ({ id: r.id, label: r.name })));
      }
    })();
  }, [open, from]);

  const submit = async () => {
    if (!targetId) {
      toast.error("Select a partner");
      return;
    }
    setSubmitting(true);
    try {
      await createConnection({
        brand_id: from === "brand" ? selfId : targetId,
        distributor_id: from === "distributor" ? selfId : targetId,
        initiated_by: from,
        message,
        territory_notes: territoryNotes,
      });
      toast.success("Request sent");
      setOpen(false);
      setTargetId("");
      setMessage("");
      setTerritoryNotes("");
      onCreated();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="mr-1 h-3 w-3" />
          {title}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>{from === "brand" ? "Distributor" : "Brand"}</Label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="h-10 w-full rounded-[var(--radius-button)] border border-border/60 bg-card px-3 text-sm"
            >
              <option value="">Select…</option>
              {options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Message</Label>
            <Textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Introduce yourself and the partnership opportunity"
            />
          </div>
          <div>
            <Label>Territory notes</Label>
            <Textarea
              rows={2}
              value={territoryNotes}
              onChange={(e) => setTerritoryNotes(e.target.value)}
              placeholder="States / districts covered, exclusivity, etc."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={submitting}
            className="bg-gradient-cta text-primary-foreground"
          >
            {submitting ? "Sending…" : "Send request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

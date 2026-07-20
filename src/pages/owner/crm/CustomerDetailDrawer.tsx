import { useEffect, useState } from "react";
import { Cake, Check, Gift, MessageCircle, Phone, Tag as TagIcon } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  TAG_META,
  daysSince,
  isBirthdayThisMonth,
  type CRMCustomer,
  type CustomerTag,
} from "./mockCRM";
import { WhatsAppComposer } from "./WhatsAppComposer";

export function CustomerDetailDrawer({
  customer,
  onClose,
  onUpdate,
}: {
  customer: CRMCustomer | null;
  onClose: () => void;
  onUpdate: (c: CRMCustomer) => void;
}) {
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<CustomerTag[]>([]);

  useEffect(() => {
    if (customer) {
      setNotes(customer.notes);
      setTags(customer.tags);
    }
  }, [customer]);

  if (!customer) return null;

  const toggleTag = (t: CustomerTag) => {
    setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));
  };

  const saveNotesAndTags = () => {
    onUpdate({ ...customer, notes, tags });
  };

  const wa = `https://wa.me/91${customer.mobile}`;

  return (
    <Sheet open={!!customer} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-[440px]">
        <SheetHeader className="border-border border-b p-5">
          <SheetTitle className="text-base">Customer profile</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 p-5">
          {/* Profile header */}
          <div className="flex items-start gap-3">
            <div className="bg-primary/15 text-primary grid h-14 w-14 place-items-center rounded-full text-lg font-bold">
              {customer.avatar}
            </div>
            <div className="flex-1">
              <div className="text-heading flex items-center gap-2 text-lg font-bold">
                {customer.name}
                {isBirthdayThisMonth(customer) && (
                  <span title="Birthday this month">
                    <Cake className="text-warning h-4 w-4" />
                  </span>
                )}
              </div>
              <a
                href={`tel:${customer.mobile}`}
                className="text-muted-foreground hover:text-primary inline-flex items-center gap-1 text-sm"
              >
                <Phone className="h-3.5 w-3.5" /> {customer.mobile}
              </a>
              <div className="mt-2 flex flex-wrap gap-1">
                {customer.tags.map((t) => (
                  <span
                    key={t}
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                      TAG_META[t].bg,
                      TAG_META[t].text,
                    )}
                  >
                    {TAG_META[t].label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Stat label="Visits" value={customer.totalVisits.toString()} />
            <Stat label="Spend" value={`₹${(customer.lifetimeSpend / 1000).toFixed(1)}K`} />
            <Stat label="Last visit" value={`${daysSince(customer.lastVisit)}d ago`} />
          </div>

          {/* Communication actions */}
          <div className="grid grid-cols-3 gap-2">
            <a href={wa} target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm" className="w-full">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </Button>
            </a>
            <Button variant="outline" size="sm">
              <Gift className="h-4 w-4" /> Send Offer
            </Button>
            <Button variant="outline" size="sm">
              <TagIcon className="h-4 w-4" /> Send Coupon
            </Button>
          </div>

          {/* Tag assignment */}
          <Section title="Tags">
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(TAG_META) as CustomerTag[]).map((t) => {
                const active = tags.includes(t);
                return (
                  <button
                    key={t}
                    onClick={() => toggleTag(t)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-body hover:bg-muted/40",
                    )}
                  >
                    {active && <Check className="h-3 w-3" />} {TAG_META[t].label}
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Visit history timeline */}
          <Section title="Visit history">
            <ol className="border-border relative space-y-4 border-l pl-4">
              {customer.visits.map((v) => (
                <li key={v.id} className="relative">
                  <span
                    className={cn(
                      "border-card absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2",
                      v.status === "completed" ? "bg-success" : "bg-danger",
                    )}
                  />
                  <div className="text-heading text-sm font-medium">{v.service}</div>
                  <div className="text-muted-foreground text-xs">
                    {v.date} · {v.staff} · ₹{v.amount.toLocaleString()} · {v.status}
                  </div>
                </li>
              ))}
              {customer.visits.length === 0 && (
                <p className="text-muted-foreground text-sm">No visits yet.</p>
              )}
            </ol>
          </Section>

          {/* Notes */}
          <Section title="Private notes">
            <Textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Owner-only notes about preferences, allergies, history…"
            />
          </Section>

          <div className="flex justify-end">
            <Button size="sm" onClick={saveNotesAndTags}>
              Save notes & tags
            </Button>
          </div>

          {/* WhatsApp composer */}
          <Section title="Quick WhatsApp">
            <WhatsAppComposer defaultName={customer.name.split(" ")[0]} />
          </Section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="text-heading text-xs font-semibold uppercase tracking-wide">{title}</h4>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/40 rounded-lg p-2 text-center">
      <div className="text-heading text-base font-bold">{value}</div>
      <div className="text-muted-foreground text-[10px] uppercase">{label}</div>
    </div>
  );
}

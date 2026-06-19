import { useMemo, useState } from "react";
import { ChevronDown, Gift, PartyPopper, Crown, Handshake, Ticket } from "lucide-react";
import { CouponCard } from "./offers/CouponCard";
import { COUPONS, type OfferCategory } from "./offers/mockOffers";

interface Section {
  key: OfferCategory;
  title: string;
  subtitle: string;
  icon: typeof Gift;
  defaultOpen: boolean;
}

const SECTIONS: Section[] = [
  { key: "available", title: "Available Coupons", subtitle: "Ready to apply on your next booking", icon: Ticket, defaultOpen: true },
  { key: "membership", title: "Membership Offers", subtitle: "Exclusive perks for your tier", icon: Crown, defaultOpen: true },
  { key: "festival", title: "Festival Offers", subtitle: "Limited-time festive savings", icon: PartyPopper, defaultOpen: true },
  { key: "partner", title: "Partner Offers", subtitle: "Brought to you by our partners", icon: Handshake, defaultOpen: true },
  { key: "expired", title: "Expired Coupons", subtitle: "Past offers for your reference", icon: Gift, defaultOpen: false },
];

export function OffersPage() {
  const grouped = useMemo(() => {
    const map: Record<OfferCategory, typeof COUPONS> = {
      available: [], membership: [], festival: [], partner: [], expired: [],
    };
    for (const c of COUPONS) map[c.category].push(c);
    return map;
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Offers & Coupons</h1>
        <p className="text-muted-foreground">
          Save more on every booking with curated coupons and member-only offers.
        </p>
      </header>

      {SECTIONS.map((s) => (
        <CollapsibleSection key={s.key} section={s} count={grouped[s.key].length}>
          {grouped[s.key].length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No offers in this section right now.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {grouped[s.key].map((c) => <CouponCard key={c.id} coupon={c} />)}
            </div>
          )}
        </CollapsibleSection>
      ))}
    </div>
  );
}

function CollapsibleSection({
  section, count, children,
}: { section: Section; count: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(section.defaultOpen);
  const Icon = section.icon;
  return (
    <section className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:bg-muted/40 transition"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <span className="grid place-items-center size-9 rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </span>
          <div className="text-left">
            <h2 className="font-semibold text-foreground">
              {section.title}{" "}
              <span className="text-xs font-normal text-muted-foreground">({count})</span>
            </h2>
            <p className="text-xs text-muted-foreground">{section.subtitle}</p>
          </div>
        </div>
        <ChevronDown
          className={`size-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="pl-1">{children}</div>}
    </section>
  );
}

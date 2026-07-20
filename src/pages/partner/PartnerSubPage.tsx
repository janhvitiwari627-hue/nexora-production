import {
  GraduationCap,
  IndianRupee,
  Settings,
  Store,
  Trophy,
  UserPlus,
  Wallet,
} from "lucide-react";
import type { ComponentType } from "react";
import { ComingSoonCard, PartnerPageShell } from "./PartnerAppLayout";

type Meta = {
  title: string;
  subtitle: string;
  icon: ComponentType<{ className?: string }>;
  note: string;
};

export const PARTNER_SUBPAGES = {
  leads: {
    title: "Leads",
    subtitle: "Track potential salons ready to onboard.",
    icon: UserPlus,
    note: "Lead capture, contact status aur follow-up reminders yahan aayenge.",
  },
  shops: {
    title: "Shops",
    subtitle: "Aapke district ke onboarded salons.",
    icon: Store,
    note: "Shop list, activity status aur monthly performance dashboard.",
  },
  commission: {
    title: "Commission",
    subtitle: "Har active shop par growth share breakdown.",
    icon: IndianRupee,
    note: "Recurring commission ledger, tier bonuses aur invoices.",
  },
  payout: {
    title: "Payout",
    subtitle: "Weekly transparent payouts.",
    icon: Wallet,
    note: "Bank account, payout schedule aur history yahan milegi.",
  },
  milestones: {
    title: "Milestones",
    subtitle: "Tier unlocks, badges aur leaderboard.",
    icon: Trophy,
    note: "Bronze → Silver → Gold → Platinum tier journey aur rewards.",
  },
  training: {
    title: "Training",
    subtitle: "Sales, pitch aur product training.",
    icon: GraduationCap,
    note: "Videos, playbooks aur certification tracks jald hi live.",
  },
  settings: {
    title: "Settings",
    subtitle: "Profile, KYC aur notifications.",
    icon: Settings,
    note: "Profile details, KYC status aur notification preferences.",
  },
} satisfies Record<string, Meta>;

export function PartnerSubPage({ slug }: { slug: keyof typeof PARTNER_SUBPAGES }) {
  const m = PARTNER_SUBPAGES[slug];
  return (
    <PartnerPageShell title={m.title} subtitle={m.subtitle} icon={m.icon}>
      <ComingSoonCard note={m.note} />
    </PartnerPageShell>
  );
}

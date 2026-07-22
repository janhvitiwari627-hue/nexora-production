import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, Crown, Wifi } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useAuthStore } from "@/stores/authStore";
import { mockMembership } from "../mockDashboard";

const NEXT_TIER: Record<string, "Gold" | "Platinum" | null> = {
  Silver: "Gold",
  Gold: "Platinum",
  Platinum: null,
};

function daysUntil(iso: string) {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000));
}

function formatExpiry(iso: string) {
  return new Intl.DateTimeFormat("en", { month: "2-digit", year: "2-digit" }).format(new Date(iso));
}

export function MembershipStatusCard() {
  const profile = useAuthStore((state) => state.profile);
  const user = useAuthStore((state) => state.user);
  const membership = mockMembership;
  const nextTier = NEXT_TIER[membership.tier];
  const memberName = profile?.full_name || user?.email?.split("@")[0] || "Nexora Member";
  const memberId = profile?.nexora_id || `NX-${user?.id.slice(0, 8).toUpperCase() || "MEMBER"}`;
  const installUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/download-app?source=membership-card`
      : "https://meripahalfasthelp.online/download-app?source=membership-card";

  return (
    <section className="space-y-3" aria-labelledby="membership-card-title">
      <div className="relative aspect-[1.586/1] min-h-[230px] overflow-hidden rounded-[1.75rem] border border-white/70 bg-[linear-gradient(135deg,#eef2f7_0%,#b7c0cc_42%,#7f8b9b_100%)] p-5 text-slate-950 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.65)]">
        <div className="relative flex h-full flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <img
                src="/customer-pwa-icon-192.png"
                alt="Nexora"
                className="h-10 w-10 shrink-0 rounded-xl object-cover shadow-md ring-1 ring-white/70"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-black tracking-tight">Nexora SalonOS</p>
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-slate-700">
                  Beauty membership
                </p>
              </div>
            </div>
            <Wifi className="h-7 w-7 shrink-0 rotate-90 text-slate-700" aria-hidden="true" />
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-700">
                Membership tier
              </p>
              <h2
                id="membership-card-title"
                className="mt-0.5 flex items-center gap-1.5 text-2xl font-black"
              >
                <Crown className="h-5 w-5" /> {membership.tier}
              </h2>
            </div>
            <span className="rounded-full border border-slate-600/20 bg-white/35 px-2.5 py-1 text-[10px] font-black backdrop-blur-sm">
              {daysUntil(membership.expiresOn)} days left
            </span>
          </div>

          <div className="mt-auto flex items-end justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-mono text-sm font-black tracking-[0.12em] sm:text-base">
                {memberId}
              </p>
              <div className="mt-2 flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-slate-700">
                    Member name
                  </p>
                  <p className="truncate text-xs font-black uppercase">{memberName}</p>
                </div>
                <div className="shrink-0">
                  <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-slate-700">
                    Valid thru
                  </p>
                  <p className="text-xs font-black">{formatExpiry(membership.expiresOn)}</p>
                </div>
              </div>
            </div>

            <Link
              to="/download-app"
              aria-label="Open Nexora app installation page"
              className="shrink-0 rounded-xl bg-white p-1.5 shadow-md ring-1 ring-slate-900/10 transition hover:scale-105"
            >
              <QRCodeCanvas
                value={installUrl}
                size={54}
                level="H"
                bgColor="#ffffff"
                fgColor="#0f172a"
                marginSize={1}
                title="Scan to install Nexora"
              />
              <span className="mt-0.5 block text-center text-[7px] font-black uppercase tracking-wide">
                Get app
              </span>
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-3 shadow-sm">
        <ul className="grid gap-1.5 text-xs font-semibold text-muted-foreground sm:grid-cols-3 lg:grid-cols-1">
          {membership.benefits.map((benefit) => (
            <li key={benefit} className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
        {nextTier && (
          <Link
            to="/dashboard/membership"
            className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white transition hover:bg-slate-800"
          >
            Upgrade to {nextTier} <ArrowUpRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </section>
  );
}

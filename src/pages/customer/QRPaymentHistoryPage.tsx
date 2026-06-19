import { useMemo, useState } from "react";
import {
  ChevronDown,
  Download,
  Filter,
  QrCode,
  Sparkles,
  Wallet,
} from "lucide-react";
import { QR_PAYMENTS, type QRPayment, type RewardStatus } from "./qr/mockQRPayments";

const fmtINR = (n: number) =>
  `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-IN", {
    hour: "numeric", minute: "2-digit",
  });

const STATUS_STYLES: Record<RewardStatus, string> = {
  credited: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  failed: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
};

const RANGES = [
  { key: "7", label: "Last 7 days" },
  { key: "30", label: "Last 30 days" },
  { key: "90", label: "Last 90 days" },
  { key: "all", label: "All time" },
] as const;

export function QRPaymentHistoryPage() {
  const [range, setRange] = useState<(typeof RANGES)[number]["key"]>("30");
  const [shop, setShop] = useState<string>("all");
  const [status, setStatus] = useState<RewardStatus | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const shops = useMemo(
    () => Array.from(new Set(QR_PAYMENTS.map((p) => p.shopName))).sort(),
    [],
  );

  const filtered = useMemo(() => {
    const now = Date.now();
    const cutoff = range === "all" ? 0 : now - Number(range) * 86400000;
    return QR_PAYMENTS.filter((p) => {
      if (new Date(p.dateTime).getTime() < cutoff) return false;
      if (shop !== "all" && p.shopName !== shop) return false;
      if (status !== "all" && p.rewardStatus !== status) return false;
      return true;
    }).sort(
      (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime(),
    );
  }, [range, shop, status]);

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, p) => ({
        spend: acc.spend + p.amount,
        rewards:
          acc.rewards + (p.rewardStatus === "credited" ? p.rewardEarned : 0),
        count: acc.count + 1,
      }),
      { spend: 0, rewards: 0, count: 0 },
    );
  }, [filtered]);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          <QrCode className="size-6 text-primary" /> QR Payment History
        </h1>
        <p className="text-sm text-muted-foreground">
          All your in-store QR payments and the rewards earned on them.
        </p>
      </header>

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard
          icon={Wallet} label="Total QR Spend"
          value={fmtINR(totals.spend)}
          tint="from-indigo-500 to-violet-500"
        />
        <SummaryCard
          icon={Sparkles} label="Rewards from QR"
          value={`${totals.rewards} pts`}
          tint="from-amber-500 to-orange-500"
        />
        <SummaryCard
          icon={QrCode} label="Transactions"
          value={String(totals.count)}
          tint="from-emerald-500 to-teal-500"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3">
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground mr-1">
          <Filter className="size-4" /> Filters
        </span>
        <FilterSelect
          value={range} onChange={(v) => setRange(v as typeof range)}
          options={RANGES.map((r) => ({ value: r.key, label: r.label }))}
        />
        <FilterSelect
          value={shop} onChange={setShop}
          options={[
            { value: "all", label: "All shops" },
            ...shops.map((s) => ({ value: s, label: s })),
          ]}
        />
        <FilterSelect
          value={status} onChange={(v) => setStatus(v as RewardStatus | "all")}
          options={[
            { value: "all", label: "All rewards" },
            { value: "credited", label: "Credited" },
            { value: "pending", label: "Pending" },
            { value: "failed", label: "Failed" },
          ]}
        />
      </div>

      {/* Transactions */}
      <ul className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
        {filtered.length === 0 && (
          <li className="p-10 text-center text-muted-foreground">
            No transactions match your filters.
          </li>
        )}
        {filtered.map((p) => (
          <TxnRow
            key={p.id} payment={p}
            open={openId === p.id}
            onToggle={() => setOpenId(openId === p.id ? null : p.id)}
          />
        ))}
      </ul>
    </div>
  );
}

function SummaryCard({
  icon: Icon, label, value, tint,
}: {
  icon: typeof QrCode; label: string; value: string; tint: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-4">
      <span className={`grid place-items-center size-11 rounded-xl text-white bg-gradient-to-br ${tint}`}>
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-xl font-bold text-foreground mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function FilterSelect({
  value, onChange, options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-sm rounded-lg border border-border bg-background px-3 py-1.5 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function TxnRow({
  payment, open, onToggle,
}: { payment: QRPayment; open: boolean; onToggle: () => void }) {
  return (
    <li className="bg-card">
      <button
        type="button" onClick={onToggle}
        className="w-full flex items-center gap-3 sm:gap-4 p-4 text-left hover:bg-muted/40 transition"
        aria-expanded={open}
      >
        <img
          src={payment.shopThumbnail} alt=""
          className="size-12 rounded-xl object-cover bg-muted shrink-0"
          loading="lazy"
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <h3 className="font-semibold text-foreground truncate">{payment.shopName}</h3>
            <span className="text-xs text-muted-foreground">{payment.category}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {fmtDate(payment.dateTime)} · {fmtTime(payment.dateTime)} · #{payment.txnId}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-semibold text-foreground">{fmtINR(payment.amount)}</p>
          <span
            className={`mt-1 inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[payment.rewardStatus]}`}
          >
            {payment.rewardStatus === "credited"
              ? `+${payment.rewardEarned} pts`
              : payment.rewardStatus === "pending"
              ? `${payment.rewardEarned} pts pending`
              : "Reward failed"}
          </span>
        </div>
        <ChevronDown
          className={`size-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="px-4 pb-4 -mt-1">
          <div className="rounded-xl bg-muted/40 border border-border p-4 grid gap-3 sm:grid-cols-2 text-sm">
            <Detail label="Transaction ID" value={payment.txnId} mono />
            <Detail label="Payment Method" value={payment.paymentMethod} />
            <Detail label="Date & Time" value={`${fmtDate(payment.dateTime)} · ${fmtTime(payment.dateTime)}`} />
            <Detail label="Amount Paid" value={fmtINR(payment.amount)} />
            <Detail
              label="Reward Earned"
              value={
                payment.rewardStatus === "credited"
                  ? `${payment.rewardEarned} pts`
                  : payment.rewardStatus === "pending"
                  ? `${payment.rewardEarned} pts (pending)`
                  : "—"
              }
            />
            <Detail label="Category" value={payment.category} />

            <div className="sm:col-span-2 flex justify-end pt-1">
              {payment.invoiceUrl ? (
                <a
                  href={payment.invoiceUrl} download
                  className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted transition"
                >
                  <Download className="size-4" /> Download Invoice
                </a>
              ) : (
                <span className="text-xs text-muted-foreground">Invoice unavailable</span>
              )}
            </div>
          </div>
        </div>
      )}
    </li>
  );
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`text-foreground mt-0.5 ${mono ? "font-mono text-xs" : ""}`}>{value}</p>
    </div>
  );
}

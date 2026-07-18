import { motion } from "framer-motion";
import { IndianRupee, Download } from "lucide-react";
import { useState } from "react";
import { PartnerPageShell } from "./PartnerAppLayout";

type ActStatus = "Tracking" | "Eligible" | "Paid" | "Rejected" | "Reversed";
type RecStatus = "Pending" | "Available" | "Paid" | "Held" | "Reversed";

const ACT: {
  shop: string; firstCollection: string; revenue: string; commission: string; status: ActStatus;
}[] = [
  { shop: "Glow Studio", firstCollection: "12 Jun", revenue: "₹1,500", commission: "₹150", status: "Paid" },
  { shop: "The Barber Loft", firstCollection: "14 Jun", revenue: "₹1,650", commission: "₹165", status: "Paid" },
  { shop: "Elegance Spa", firstCollection: "18 Jun", revenue: "₹3,200", commission: "₹320", status: "Eligible" },
  { shop: "Nailed It", firstCollection: "22 Jun", revenue: "₹980", commission: "₹98", status: "Tracking" },
  { shop: "Blush Salon", firstCollection: "—", revenue: "—", commission: "—", status: "Tracking" },
  { shop: "Sharp Cuts", firstCollection: "05 Jun", revenue: "₹1,200", commission: "₹120", status: "Reversed" },
];

const REC: {
  shop: string; month: number; rate: string; revenue: string; commission: string; status: RecStatus;
}[] = [
  { shop: "Glow Studio", month: 4, rate: "10%", revenue: "₹8,200", commission: "₹820", status: "Paid" },
  { shop: "The Barber Loft", month: 3, rate: "10%", revenue: "₹6,400", commission: "₹640", status: "Available" },
  { shop: "Elegance Spa", month: 2, rate: "10%", revenue: "₹9,100", commission: "₹910", status: "Available" },
  { shop: "Nailed It", month: 1, rate: "10%", revenue: "₹2,300", commission: "₹230", status: "Pending" },
  { shop: "Old Salon A", month: 8, rate: "5%", revenue: "₹12,400", commission: "₹620", status: "Paid" },
  { shop: "Old Salon B", month: 14, rate: "2%", revenue: "₹18,900", commission: "₹378", status: "Held" },
];

const ACT_TONE: Record<ActStatus, string> = {
  Tracking: "bg-slate-100 text-slate-600",
  Eligible: "bg-[#DBEAFE] text-[#1D4ED8]",
  Paid: "bg-[#DCFCE7] text-[#16A34A]",
  Rejected: "bg-[#FEE2E2] text-[#B91C1C]",
  Reversed: "bg-[#FEF3C7] text-[#B45309]",
};
const REC_TONE: Record<RecStatus, string> = {
  Pending: "bg-slate-100 text-slate-600",
  Available: "bg-[#DBEAFE] text-[#1D4ED8]",
  Paid: "bg-[#DCFCE7] text-[#16A34A]",
  Held: "bg-[#FEF3C7] text-[#B45309]",
  Reversed: "bg-[#FEE2E2] text-[#B91C1C]",
};

function Pill({ text, tone }: { text: string; tone: string }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${tone}`}>
      {text}
    </span>
  );
}

export function PartnerCommissionPage() {
  const [tab, setTab] = useState<"activation" | "recurring">("activation");

  return (
    <PartnerPageShell
      title="Commission"
      subtitle="Har active shop par growth share breakdown."
      icon={IndianRupee}
    >
      {/* Tabs */}
      <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
        <button
          onClick={() => setTab("activation")}
          className={`rounded-lg px-4 py-2 text-xs font-bold transition-colors ${
            tab === "activation" ? "bg-[#0B1330] text-white" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          Activation Commission
        </button>
        <button
          onClick={() => setTab("recurring")}
          className={`rounded-lg px-4 py-2 text-xs font-bold transition-colors ${
            tab === "recurring" ? "bg-[#0B1330] text-white" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          Recurring Growth Share
        </button>
      </div>

      {/* Summary strip */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {tab === "activation" ? (
          <>
            <SummaryCard label="Total activation earnings" value="₹1,850" tone="green" />
            <SummaryCard label="Eligible (unpaid)" value="₹320" tone="indigo" />
            <SummaryCard label="Tracking (in 15-day window)" value="₹98" tone="amber" />
          </>
        ) : (
          <>
            <SummaryCard label="Available balance" value="₹1,550" tone="green" />
            <SummaryCard label="Pending" value="₹230" tone="indigo" />
            <SummaryCard label="Held / under review" value="₹378" tone="amber" />
          </>
        )}
      </div>

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          {tab === "activation" ? (
            <table className="min-w-[720px] w-full text-sm">
              <thead className="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Shop</th>
                  <th className="px-4 py-3">First Collection</th>
                  <th className="px-4 py-3 text-right">15-Day Revenue</th>
                  <th className="px-4 py-3 text-right">Activation (10%)</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ACT.map((r, i) => (
                  <motion.tr
                    key={r.shop}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-[#FAFBFF]"
                  >
                    <td className="px-4 py-3 font-bold text-[#0B1330]">{r.shop}</td>
                    <td className="px-4 py-3 text-slate-600">{r.firstCollection}</td>
                    <td className="px-4 py-3 text-right font-bold text-[#0B1330]">{r.revenue}</td>
                    <td className="px-4 py-3 text-right font-bold text-[#16A34A]">{r.commission}</td>
                    <td className="px-4 py-3"><Pill text={r.status} tone={ACT_TONE[r.status]} /></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="min-w-[820px] w-full text-sm">
              <thead className="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Shop</th>
                  <th className="px-4 py-3">Month</th>
                  <th className="px-4 py-3">Rate</th>
                  <th className="px-4 py-3 text-right">Platform Revenue</th>
                  <th className="px-4 py-3 text-right">Partner Commission</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {REC.map((r, i) => (
                  <motion.tr
                    key={r.shop + r.month}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-[#FAFBFF]"
                  >
                    <td className="px-4 py-3 font-bold text-[#0B1330]">{r.shop}</td>
                    <td className="px-4 py-3 text-slate-600">M{r.month}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-lg bg-[#EEF2FF] px-2 py-0.5 text-xs font-bold text-[#4F46E5]">
                        {r.rate}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-[#0B1330]">{r.revenue}</td>
                    <td className="px-4 py-3 text-right font-bold text-[#16A34A]">{r.commission}</td>
                    <td className="px-4 py-3"><Pill text={r.status} tone={REC_TONE[r.status]} /></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50">
          <Download className="h-3.5 w-3.5" /> Download statement
        </button>
      </div>
    </PartnerPageShell>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: string; tone: "green" | "indigo" | "amber" }) {
  const map = {
    green: "bg-[#DCFCE7] text-[#16A34A]",
    indigo: "bg-[#EEF2FF] text-[#4F46E5]",
    amber: "bg-[#FEF3C7] text-[#B45309]",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className={`inline-flex rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${map[tone]}`}>
        {label}
      </div>
      <div className="mt-3 text-2xl font-black text-[#0B1330]">{value}</div>
    </div>
  );
}

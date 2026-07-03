import { motion } from "framer-motion";
import { Phone, Plus, Search, UserPlus } from "lucide-react";
import { useState } from "react";
import { PartnerPageShell } from "./PartnerAppLayout";

const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Interested",
  "Demo Given",
  "Documents Pending",
  "Registered",
  "Verified",
  "Website Published",
  "Active",
  "Lost",
  "Rejected",
] as const;
type LeadStatus = typeof LEAD_STATUSES[number];

type Lead = {
  name: string;
  shop: string;
  mobile: string;
  area: string;
  status: LeadStatus;
  addedOn: string;
  note: string;
};

const LEADS: Lead[] = [
  { name: "Ramesh Kumar", shop: "Style Hub", mobile: "98765 12345", area: "Malviya Nagar", status: "New", addedOn: "Today", note: "Referred by Glow Studio" },
  { name: "Anjali Mehta", shop: "Rose Beauty", mobile: "97845 67890", area: "Vaishali", status: "Contacted", addedOn: "Today", note: "Callback tomorrow" },
  { name: "Suresh Rao", shop: "Sharp Cuts", mobile: "99887 22110", area: "Sitapura", status: "Interested", addedOn: "Yesterday", note: "Wants pricing details" },
  { name: "Kavita Joshi", shop: "Luxe Nails", mobile: "98123 88997", area: "C-Scheme", status: "Demo Given", addedOn: "2d ago", note: "Loved dashboard" },
  { name: "Manoj Sharma", shop: "Trim & Trend", mobile: "97001 45566", area: "Mansarovar", status: "Documents Pending", addedOn: "3d ago", note: "Aadhaar pending" },
  { name: "Pooja Iyer", shop: "Glamour Point", mobile: "98555 78912", area: "Jagatpura", status: "Registered", addedOn: "4d ago", note: "KYC in review" },
  { name: "Deepak Yadav", shop: "Modern Look", mobile: "97878 33221", area: "Jhotwara", status: "Verified", addedOn: "5d ago", note: "Website in build" },
  { name: "Sonia Kapoor", shop: "Aura Salon", mobile: "98765 99887", area: "Tonk Road", status: "Website Published", addedOn: "6d ago", note: "QR next" },
  { name: "Vinay Gupta", shop: "Fresh Snip", mobile: "97445 66778", area: "Raja Park", status: "Active", addedOn: "1w ago", note: "First collection ₹450" },
  { name: "Rina Das", shop: "Blush Zone", mobile: "98999 11223", area: "Ajmer Road", status: "Lost", addedOn: "2w ago", note: "Went with competitor" },
];

const STATUS_TONE: Record<LeadStatus, string> = {
  New: "bg-slate-100 text-slate-600",
  Contacted: "bg-[#DBEAFE] text-[#1D4ED8]",
  Interested: "bg-[#EEF2FF] text-[#4F46E5]",
  "Demo Given": "bg-[#E9D5FF] text-[#7C3AED]",
  "Documents Pending": "bg-[#FEF3C7] text-[#B45309]",
  Registered: "bg-[#FCE7F3] text-[#BE185D]",
  Verified: "bg-[#DCFCE7] text-[#16A34A]",
  "Website Published": "bg-[#CCFBF1] text-[#0F766E]",
  Active: "bg-[#16A34A] text-white",
  Lost: "bg-[#FEE2E2] text-[#B91C1C]",
  Rejected: "bg-[#FECACA] text-[#991B1B]",
};

export function PartnerLeadsPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<LeadStatus | "All">("All");

  const counts = LEAD_STATUSES.reduce((acc, s) => {
    acc[s] = LEADS.filter((l) => l.status === s).length;
    return acc;
  }, {} as Record<LeadStatus, number>);

  const filtered = LEADS.filter(
    (l) =>
      (filter === "All" || l.status === filter) &&
      (l.name + l.shop + l.area).toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <PartnerPageShell
      title="Lead Management"
      subtitle="Naye salons capture karo aur pipeline manage karo."
      icon={UserPlus}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search lead, shop, area..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#4F46E5]"
          />
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-[#0B1330] px-4 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5">
          <Plus className="h-4 w-4" /> Add Lead
        </button>
      </div>

      {/* Status chips */}
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("All")}
          className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
            filter === "All"
              ? "bg-[#0B1330] text-white"
              : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          }`}
        >
          All · {LEADS.length}
        </button>
        {LEAD_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
              filter === s
                ? "bg-[#0B1330] text-white"
                : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {s} · {counts[s]}
          </button>
        ))}
      </div>

      {/* Lead cards */}
      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((l, i) => (
          <motion.div
            key={l.name}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:border-[#4F46E5]/30 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-[#0B1330]">{l.shop}</div>
                <div className="truncate text-xs text-slate-500">
                  {l.name} · {l.area}
                </div>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${STATUS_TONE[l.status]}`}>
                {l.status}
              </span>
            </div>

            <p className="mt-3 text-xs text-slate-600 line-clamp-2">{l.note}</p>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <a
                href={`tel:${l.mobile.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4F46E5]"
              >
                <Phone className="h-3.5 w-3.5" /> {l.mobile}
              </a>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {l.addedOn}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          Koi lead nahi mila. Filter change karo ya "Add Lead" pe click karo.
        </div>
      )}
    </PartnerPageShell>
  );
}

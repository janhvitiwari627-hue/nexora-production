import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Search, Store, Filter, Download, Plus } from "lucide-react";
import { useState } from "react";
import { PartnerPageShell } from "./PartnerAppLayout";

type Shop = {
  name: string;
  owner: string;
  mobile: string;
  area: string;
  district: string;
  website: "Published" | "Draft" | "Pending";
  verification: "Verified" | "Pending" | "Rejected";
  qr: "Active" | "Inactive";
  active: "Active" | "Onboarding" | "Suspended";
  todayCollection: string;
  totalRevenue: string;
  commission: string;
  activationDay: number; // out of 15
};

const SHOPS: Shop[] = [
  {
    name: "Glow Studio",
    owner: "Priya Sharma",
    mobile: "98765 43210",
    area: "Malviya Nagar",
    district: "Jaipur",
    website: "Published",
    verification: "Verified",
    qr: "Active",
    active: "Active",
    todayCollection: "₹2,100",
    totalRevenue: "₹42,300",
    commission: "₹4,230",
    activationDay: 15,
  },
  {
    name: "The Barber Loft",
    owner: "Rahul Verma",
    mobile: "97845 21390",
    area: "C-Scheme",
    district: "Jaipur",
    website: "Published",
    verification: "Verified",
    qr: "Active",
    active: "Active",
    todayCollection: "₹1,650",
    totalRevenue: "₹28,900",
    commission: "₹2,890",
    activationDay: 15,
  },
  {
    name: "Blush Salon",
    owner: "Neha Gupta",
    mobile: "99887 66554",
    area: "Vaishali",
    district: "Jaipur",
    website: "Draft",
    verification: "Pending",
    qr: "Inactive",
    active: "Onboarding",
    todayCollection: "—",
    totalRevenue: "—",
    commission: "—",
    activationDay: 3,
  },
  {
    name: "Nailed It",
    owner: "Aarti Singh",
    mobile: "98123 45678",
    area: "Jagatpura",
    district: "Jaipur",
    website: "Published",
    verification: "Verified",
    qr: "Active",
    active: "Active",
    todayCollection: "₹980",
    totalRevenue: "₹18,400",
    commission: "₹1,840",
    activationDay: 12,
  },
  {
    name: "Elegance Spa",
    owner: "Meera Kapoor",
    mobile: "97001 55889",
    area: "Mansarovar",
    district: "Jaipur",
    website: "Published",
    verification: "Verified",
    qr: "Active",
    active: "Active",
    todayCollection: "₹3,200",
    totalRevenue: "₹56,700",
    commission: "₹5,670",
    activationDay: 15,
  },
  {
    name: "Cuts & Curls",
    owner: "Vikas Yadav",
    mobile: "98555 21467",
    area: "Sitapura",
    district: "Jaipur",
    website: "Pending",
    verification: "Pending",
    qr: "Inactive",
    active: "Onboarding",
    todayCollection: "—",
    totalRevenue: "—",
    commission: "—",
    activationDay: 1,
  },
];

function statusPill(text: string, tone: "green" | "amber" | "red" | "slate") {
  const map = {
    green: "bg-[#DCFCE7] text-[#16A34A]",
    amber: "bg-[#FEF3C7] text-[#B45309]",
    red: "bg-[#FEE2E2] text-[#B91C1C]",
    slate: "bg-slate-100 text-slate-600",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${map[tone]}`}
    >
      {text}
    </span>
  );
}

function toneFor(s: string): "green" | "amber" | "red" | "slate" {
  if (["Verified", "Active", "Published"].includes(s)) return "green";
  if (["Pending", "Onboarding", "Draft"].includes(s)) return "amber";
  if (["Rejected", "Suspended", "Inactive"].includes(s)) return "red";
  return "slate";
}

export function PartnerShopsPage() {
  const [q, setQ] = useState("");
  const filtered = SHOPS.filter((s) =>
    (s.name + s.owner + s.area).toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <PartnerPageShell
      title="My Shops"
      subtitle="Aapke onboarded salons ki live activity."
      icon={Store}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search shop, owner, area..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#4F46E5]"
          />
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50">
          <Filter className="h-3.5 w-3.5" /> Filter
        </button>
        <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50">
          <Download className="h-3.5 w-3.5" /> Export
        </button>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full text-sm">
            <thead className="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Shop</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Area / District</th>
                <th className="px-4 py-3">Website</th>
                <th className="px-4 py-3">Verify</th>
                <th className="px-4 py-3">QR</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Today</th>
                <th className="px-4 py-3 text-right">Revenue</th>
                <th className="px-4 py-3 text-right">Commission</th>
                <th className="px-4 py-3">15-Day Activation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s, i) => (
                <motion.tr
                  key={s.name}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-[#FAFBFF]"
                >
                  <td className="px-4 py-3">
                    <div className="font-bold text-[#0B1330]">{s.name}</div>
                    <div className="text-xs text-slate-500">{s.mobile}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{s.owner}</td>
                  <td className="px-4 py-3">
                    <div className="text-[#0B1330]">{s.area}</div>
                    <div className="text-xs text-slate-500">{s.district}</div>
                  </td>
                  <td className="px-4 py-3">{statusPill(s.website, toneFor(s.website))}</td>
                  <td className="px-4 py-3">
                    {statusPill(s.verification, toneFor(s.verification))}
                  </td>
                  <td className="px-4 py-3">{statusPill(s.qr, toneFor(s.qr))}</td>
                  <td className="px-4 py-3">{statusPill(s.active, toneFor(s.active))}</td>
                  <td className="px-4 py-3 text-right font-bold text-[#0B1330]">
                    {s.todayCollection}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-[#0B1330]">
                    {s.totalRevenue}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-[#16A34A]">{s.commission}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6]"
                          style={{ width: `${(s.activationDay / 15) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-600">{s.activationDay}/15</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add shop */}
      <div className="mt-6 flex justify-end">
        <Link
          to="/app/partner/leads"
          className="inline-flex items-center gap-2 rounded-xl bg-[#0B1330] px-4 py-2.5 text-sm font-bold text-white hover:-translate-y-0.5 transition-transform"
        >
          <Plus className="h-4 w-4" /> Add new shop
        </Link>
      </div>
    </PartnerPageShell>
  );
}

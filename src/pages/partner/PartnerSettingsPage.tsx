import { motion } from "framer-motion";
import {
  Bell,
  Building2,
  CheckCircle2,
  FileCheck2,
  Globe,
  Landmark,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Settings as SettingsIcon,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import type { ComponentType } from "react";
import { PartnerPageShell } from "./PartnerAppLayout";

type Field = { label: string; value: string; icon: ComponentType<{ className?: string }>; verified?: boolean };

const PROFILE: Field[] = [
  { label: "Full Name", value: "Rahul Verma", icon: UserRound },
  { label: "Mobile", value: "+91 98765 43210", icon: Phone, verified: true },
  { label: "Email", value: "rahul.verma@example.com", icon: Mail, verified: true },
  { label: "District", value: "Jaipur, Rajasthan", icon: MapPin },
];

const PAYOUT: Field[] = [
  { label: "Bank Account", value: "HDFC •••• 4271 · IFSC HDFC0001234", icon: Landmark, verified: true },
  { label: "UPI ID", value: "rahul@ybl", icon: Building2, verified: true },
];

const KYC = [
  { doc: "Aadhaar Card", status: "Verified", tone: "green" },
  { doc: "PAN Card", status: "Verified", tone: "green" },
  { doc: "Bank Passbook", status: "Verified", tone: "green" },
  { doc: "Selfie", status: "Verified", tone: "green" },
];

const NOTIFS = [
  { label: "New lead assigned", email: true, whatsapp: true, push: true },
  { label: "Weekly payout processed", email: true, whatsapp: true, push: true },
  { label: "Shop activation reached", email: false, whatsapp: true, push: true },
  { label: "Milestone unlocked", email: true, whatsapp: true, push: true },
  { label: "Training reminders", email: false, whatsapp: false, push: true },
];

export function PartnerSettingsPage() {
  return (
    <PartnerPageShell
      title="Settings"
      subtitle="Profile, KYC aur notification preferences."
      icon={SettingsIcon}
    >
      <div className="space-y-6">
        {/* Profile */}
        <Section title="Profile" icon={UserRound}>
          <div className="grid gap-3 md:grid-cols-2">
            {PROFILE.map((f) => (
              <FieldRow key={f.label} field={f} />
            ))}
          </div>
          <div className="mt-4">
            <button className="inline-flex rounded-lg bg-[#0B1330] px-4 py-2 text-xs font-bold text-white">
              Edit profile
            </button>
          </div>
        </Section>

        {/* Payout methods */}
        <Section title="Bank & UPI" icon={Landmark}>
          <div className="grid gap-3 md:grid-cols-2">
            {PAYOUT.map((f) => (
              <FieldRow key={f.label} field={f} />
            ))}
          </div>
        </Section>

        {/* KYC */}
        <Section title="KYC Documents" icon={FileCheck2}>
          <div className="grid gap-3 md:grid-cols-2">
            {KYC.map((k) => (
              <div
                key={k.doc}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#EEF2FF] text-[#4F46E5]">
                    <FileCheck2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#0B1330]">{k.doc}</div>
                    <div className="text-xs text-slate-500">Uploaded 12 Jun 2026</div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#DCFCE7] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#16A34A]">
                  <CheckCircle2 className="h-3 w-3" /> {k.status}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* Agreement */}
        <Section title="Growth Partner Agreement" icon={ShieldCheck}>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-5">
            <div>
              <div className="text-sm font-bold text-[#0B1330]">Agreement signed</div>
              <div className="text-xs text-slate-500">Signed on 12 Jun 2026 · v1.2</div>
            </div>
            <button className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
              Download PDF
            </button>
          </div>
        </Section>

        {/* Notifications */}
        <Section title="Notification Preferences" icon={Bell}>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3 text-center">Email</th>
                  <th className="px-4 py-3 text-center">WhatsApp</th>
                  <th className="px-4 py-3 text-center">Push</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {NOTIFS.map((n) => (
                  <tr key={n.label}>
                    <td className="px-4 py-3 text-slate-700">{n.label}</td>
                    <td className="px-4 py-3 text-center">
                      <Toggle on={n.email} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Toggle on={n.whatsapp} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Toggle on={n.push} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Language */}
        <Section title="Language" icon={Globe}>
          <div className="flex flex-wrap gap-2">
            {[
              { code: "en", label: "English", active: true },
              { code: "hi", label: "हिन्दी" },
              { code: "hinglish", label: "Hinglish" },
            ].map((l) => (
              <button
                key={l.code}
                className={`rounded-full px-4 py-2 text-xs font-bold ${
                  l.active ? "bg-[#0B1330] text-white" : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </Section>

        {/* Logout */}
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-red-900">Logout</h3>
              <p className="text-sm text-red-700/80">
                Aap partner dashboard se sign out ho jayenge.
              </p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </div>
    </PartnerPageShell>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-200 bg-white p-6"
    >
      <div className="mb-5 flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#EEF2FF] text-[#4F46E5]">
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="text-base font-bold text-[#0B1330]">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

function FieldRow({ field }: { field: Field }) {
  const Icon = field.icon;
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-600">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {field.label}
          </div>
          <div className="truncate text-sm font-bold text-[#0B1330]">{field.value}</div>
        </div>
      </div>
      {field.verified && (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#16A34A]">
          <CheckCircle2 className="h-3 w-3" /> Verified
        </span>
      )}
    </div>
  );
}

function Toggle({ on }: { on: boolean }) {
  return (
    <div
      className={`inline-flex h-5 w-9 items-center rounded-full p-0.5 transition-colors ${
        on ? "bg-[#4F46E5]" : "bg-slate-200"
      }`}
    >
      <div
        className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${
          on ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </div>
  );
}

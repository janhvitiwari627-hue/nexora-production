import { Download, Smartphone } from "lucide-react";
import { InstallAppButton } from "@/components/pwa/InstallAppButton";

export function CustomerAppInstallPanel() {
  return (
    <section className="rounded-[var(--radius-card-lg)] border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-6">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-violet-700 text-white shadow-sm">
          <Smartphone className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">
            Customer PWA
          </p>
          <h2 className="mt-1 text-xl font-black text-slate-950">Install Nexora Customer App</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Add Nexora to your home screen for faster salon discovery, bookings, rewards and profile
            access. Your existing Nexora login continues in the installed app.
          </p>
        </div>
      </div>
      <div className="mt-5">
        <InstallAppButton
          kind="customer"
          fallbackHref="/app/customer"
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-violet-700 px-5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-violet-800 sm:w-auto"
        />
      </div>
      <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Download className="h-3.5 w-3.5" /> No APK needed. Works from Chrome, Edge and Safari.
      </p>
    </section>
  );
}

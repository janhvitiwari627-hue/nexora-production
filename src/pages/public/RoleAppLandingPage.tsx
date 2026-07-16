import type { LucideIcon } from "lucide-react";
import { ArrowRight, CheckCircle2, Smartphone } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { InstallAppButton } from "@/components/pwa/InstallAppButton";
import type { NexoraAppKind } from "@/lib/role-pwa";

export type AppFeature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export function RoleAppLandingPage({
  kind,
  eyebrow,
  title,
  description,
  startPath,
  audience,
  features,
  hideFooter = false,
}: {
  kind: NexoraAppKind;
  eyebrow: string;
  title: string;
  description: string;
  startPath: string;
  audience: string;
  features: AppFeature[];
  hideFooter?: boolean;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <PublicHeader />
      <main>
        <section className="relative overflow-hidden border-b bg-white px-4 py-16 sm:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,.13),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,.12),transparent_36%)]" />
          <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
            <div>
              <span className="inline-flex rounded-full border bg-white px-3 py-1 text-xs font-bold text-violet-700">
                {eyebrow}
              </span>
              <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">
                {title}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">{description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <InstallAppButton kind={kind} fallbackHref={startPath} />
                <Link
                  to={startPath}
                  className="inline-flex h-12 items-center gap-2 rounded-full border bg-white px-6 text-sm font-bold"
                >
                  Continue in browser <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <p className="mt-4 text-sm text-slate-500">
                Dedicated to {audience}. No unrelated dashboard menus.
              </p>
            </div>

            <div className="mx-auto w-full max-w-sm rounded-[2.7rem] border-[10px] border-slate-950 bg-white p-4 shadow-2xl">
              <div className="rounded-[2rem] bg-gradient-to-br from-violet-700 to-blue-600 p-6 text-white">
                <Smartphone className="h-9 w-9" />
                <p className="mt-16 text-xs font-bold uppercase tracking-[.2em] text-white/70">
                  Nexora SalonOS
                </p>
                <p className="mt-2 text-3xl font-black">{eyebrow}</p>
                <div className="mt-8 space-y-3">
                  {features.slice(0, 3).map((feature) => (
                    <div key={feature.title} className="rounded-2xl bg-white/12 p-3 backdrop-blur">
                      <p className="text-sm font-bold">{feature.title}</p>
                      <p className="mt-0.5 text-xs text-white/70">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-bold text-violet-700">Everything you need</p>
            <h2 className="mt-2 text-3xl font-black">One focused app. Simple daily work.</h2>
          </div>
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.title} className="rounded-2xl border bg-white p-6 shadow-sm">
                <feature.icon className="h-6 w-6 text-violet-700" />
                <h3 className="mt-4 font-bold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
              </article>
            ))}
          </div>
          <div className="mt-10 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <p>
              Your login automatically opens the correct role dashboard. The public Nexora website
              remains available separately for discovery and platform information.
            </p>
          </div>
        </section>
      </main>
      {!hideFooter && <PublicFooter />}
    </div>
  );
}

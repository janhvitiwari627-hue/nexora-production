import type { LucideIcon } from "lucide-react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export function PlatformInfoPage({
  eyebrow,
  title,
  description,
  steps,
  notes,
  icon: Icon,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  steps: { title: string; description: string }[];
  notes?: string[];
  icon: LucideIcon;
  action?: { label: string; to: string };
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <PublicHeader />
      <main>
        <section className="border-b bg-white px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-violet-100 text-violet-700">
              <Icon className="h-7 w-7" />
            </div>
            <p className="mt-6 text-sm font-bold uppercase tracking-[.16em] text-violet-700">
              {eyebrow}
            </p>
            <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">
              {title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">{description}</p>
            {action && (
              <Link
                to={action.to}
                className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-slate-950 px-6 text-sm font-bold text-white"
              >
                {action.label} <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-16">
          <div className="grid gap-4 sm:grid-cols-2">
            {steps.map((step, index) => (
              <article key={step.title} className="rounded-2xl border bg-white p-6">
                <span className="text-sm font-black text-violet-700">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="mt-3 text-xl font-bold">{step.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
              </article>
            ))}
          </div>
          {notes?.length ? (
            <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-6">
              <h2 className="font-bold text-blue-950">Important information</h2>
              <ul className="mt-4 space-y-3">
                {notes.map((note) => (
                  <li key={note} className="flex gap-3 text-sm text-blue-900">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}

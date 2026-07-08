import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, ShieldCheck, Store } from "lucide-react";
import { z } from "zod";

const REASONS = {
  "owner-auth": {
    icon: ShieldCheck,
    title: "Sign in to continue",
    subtitle:
      "The Shop Owner dashboard is protected. We'll take you to the sign-in page in a moment.",
    cta: "Taking you to sign in…",
  },
  "create-website": {
    icon: Store,
    title: "Let's build your shop website",
    subtitle:
      "You'll register your business first, then pick a template. Redirecting now…",
    cta: "Opening the website builder…",
  },
  default: {
    icon: Loader2,
    title: "Just a moment",
    subtitle: "Redirecting you to the right place…",
    cta: "Redirecting…",
  },
} as const;

const searchSchema = z.object({
  to: z.string().default("/"),
  reason: z.enum(["owner-auth", "create-website", "default"]).default("default"),
  delay: z.coerce.number().min(0).max(5000).default(1200),
});

export const Route = createFileRoute("/auth-notice")({
  ssr: false,
  validateSearch: (s) => searchSchema.parse(s),
  component: AuthNoticePage,
  head: () => ({
    meta: [
      { title: "Redirecting — Nexora" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function AuthNoticePage() {
  const { to, reason, delay } = Route.useSearch();
  const navigate = useNavigate();
  const meta = REASONS[reason];
  const Icon = meta.icon;

  useEffect(() => {
    const t = window.setTimeout(() => {
      navigate({ to, replace: true } as never);
    }, delay);
    return () => window.clearTimeout(t);
  }, [to, delay, navigate]);

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 px-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-indigo-100/40">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200">
          <Icon className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-xl font-bold tracking-tight text-slate-900">
          {meta.title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          {meta.subtitle}
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />
          {meta.cta}
        </div>
        <button
          type="button"
          onClick={() => navigate({ to, replace: true } as never)}
          className="mt-6 block w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.01] active:scale-[0.99]"
        >
          Continue now
        </button>
      </div>
    </div>
  );
}

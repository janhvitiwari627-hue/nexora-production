import { Link } from "@tanstack/react-router";
import { ArrowRight, Globe, LayoutDashboard, CalendarCheck, Sparkles, Users, BarChart3 } from "lucide-react";

/**
 * Post-login welcome page for shop owners.
 * Warm Sand palette scoped locally so it does not touch the global theme.
 */
const palette = {
  "--ws-bg": "#faf8f5",
  "--ws-surface": "#f0ebe3",
  "--ws-accent": "#c9b99a",
  "--ws-ink": "#3a2f22",
  "--ws-ink-soft": "#8b7355",
} as React.CSSProperties;

export function OwnerWelcomePage() {
  return (
    <div
      style={palette}
      className="min-h-[calc(100vh-3.5rem)]"
    >
      <div
        style={{ background: "var(--ws-bg)", color: "var(--ws-ink)" }}
        className="mx-auto max-w-6xl px-4 py-10 sm:py-14"
      >
        {/* Hero */}
        <div className="mb-10 sm:mb-14">
          <span
            style={{ background: "var(--ws-surface)", color: "var(--ws-ink-soft)" }}
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium tracking-wide"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Welcome to Nexora SalonOS
          </span>
          <h1 className="mt-4 text-3xl sm:text-5xl font-semibold leading-tight tracking-tight">
            Apni salon ka booking website
            <br />
            aur dashboard, dono ek jagah.
          </h1>
          <p
            style={{ color: "var(--ws-ink-soft)" }}
            className="mt-4 max-w-2xl text-base sm:text-lg leading-relaxed"
          >
            Ready-made website template chunein — customers waha se seedha booking karenge.
            Aap sab kuch apne dashboard se manage karein: bookings, staff, payments, marketing.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/owner/templates"
              style={{ background: "var(--ws-ink)", color: "var(--ws-bg)" }}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium shadow-sm transition hover:opacity-90"
            >
              Website template chunein
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/owner/dashboard"
              style={{
                background: "var(--ws-surface)",
                color: "var(--ws-ink)",
                border: "1px solid var(--ws-accent)",
              }}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition hover:opacity-90"
            >
              Dashboard kholein
            </Link>
          </div>
        </div>

        {/* Two big pillars */}
        <div className="grid gap-5 sm:gap-6 md:grid-cols-2">
          <PillarCard
            icon={<Globe className="h-6 w-6" />}
            eyebrow="Step 1"
            title="Website template se bookings"
            body="Beautiful pre-designed template chunein, apna brand add karein, aur customers ko direct link bhejein. Woh 60 seconds mein appointment book karenge."
            to="/owner/templates"
            cta="Templates dekhein"
          />
          <PillarCard
            icon={<LayoutDashboard className="h-6 w-6" />}
            eyebrow="Step 2"
            title="Dashboard se sab manage"
            body="Ek clean dashboard mein bookings, staff schedule, payments, reviews aur marketing — sab ek jagah. Real-time updates, kahin bhi."
            to="/owner/dashboard"
            cta="Dashboard kholein"
          />
        </div>

        {/* How it works — 3 steps */}
        <div className="mt-14">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
            Kaise kaam karega
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <StepCard n={1} title="Template chunein" body="Apni salon ke mood se match karta hua design pick karein." />
            <StepCard n={2} title="Customize karein" body="Logo, colors, services, prices — sab aap set karte hain." />
            <StepCard n={3} title="Share & manage" body="Link customers ko bhejein. Bookings dashboard mein aayenge." />
          </div>
        </div>

        {/* Quick shortcuts */}
        <div className="mt-14">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
            Jaldi jaayein
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <QuickLink to="/owner/bookings" icon={<CalendarCheck className="h-4 w-4" />} label="Bookings" />
            <QuickLink to="/owner/staff" icon={<Users className="h-4 w-4" />} label="Staff" />
            <QuickLink to="/owner/marketing" icon={<Sparkles className="h-4 w-4" />} label="Marketing" />
            <QuickLink to="/owner/analytics" icon={<BarChart3 className="h-4 w-4" />} label="Analytics" />
          </div>
        </div>
      </div>
    </div>
  );
}

function PillarCard({
  icon,
  eyebrow,
  title,
  body,
  to,
  cta,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  body: string;
  to: string;
  cta: string;
}) {
  return (
    <div
      style={{
        background: "var(--ws-surface)",
        border: "1px solid var(--ws-accent)",
      }}
      className="rounded-2xl p-6 sm:p-7 transition hover:shadow-md"
    >
      <div
        style={{ background: "var(--ws-bg)", color: "var(--ws-ink)" }}
        className="inline-flex h-11 w-11 items-center justify-center rounded-xl"
      >
        {icon}
      </div>
      <div
        style={{ color: "var(--ws-ink-soft)" }}
        className="mt-4 text-xs uppercase tracking-widest"
      >
        {eyebrow}
      </div>
      <h3 className="mt-1 text-xl sm:text-2xl font-semibold tracking-tight">
        {title}
      </h3>
      <p
        style={{ color: "var(--ws-ink-soft)" }}
        className="mt-2 text-sm sm:text-base leading-relaxed"
      >
        {body}
      </p>
      <Link
        to={to}
        style={{ color: "var(--ws-ink)" }}
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
      >
        {cta}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function StepCard({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div
      style={{ background: "var(--ws-bg)", border: "1px solid var(--ws-accent)" }}
      className="rounded-2xl p-5"
    >
      <div
        style={{ background: "var(--ws-accent)", color: "var(--ws-ink)" }}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold"
      >
        {n}
      </div>
      <h3 className="mt-3 text-base font-semibold">{title}</h3>
      <p
        style={{ color: "var(--ws-ink-soft)" }}
        className="mt-1 text-sm leading-relaxed"
      >
        {body}
      </p>
    </div>
  );
}

function QuickLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      style={{
        background: "var(--ws-surface)",
        border: "1px solid var(--ws-accent)",
        color: "var(--ws-ink)",
      }}
      className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition hover:opacity-90"
    >
      <span className="inline-flex items-center gap-2">
        {icon}
        {label}
      </span>
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

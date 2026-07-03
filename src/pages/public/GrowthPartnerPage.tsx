import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  Building2,
  CheckCircle2,
  GraduationCap,
  Handshake,
  Heart,
  Landmark,
  Network,
  PlayCircle,
  Scissors,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
  Truck,
  UserRound,
  Users,
} from "lucide-react";
import { PublicPageHeader } from "@/components/shared/PublicPageHeader";
import { JoinPartnerDialog } from "./JoinPartnerDialog";

const TRUST_BADGES = [
  { icon: ShieldCheck, label: "Not a Job" },
  { icon: ShieldCheck, label: "Not Franchise" },
  { icon: ShieldCheck, label: "Not MLM" },
  { icon: Heart, label: "Beauty Industry Mission" },
  { icon: CheckCircle2, label: "No Investment" },
  { icon: CheckCircle2, label: "Transparent System" },
];

const WHY_CARDS = [
  {
    icon: Network,
    title: "Existing Network",
    body: "Aapke pass already salons, parlours aur beauty pros ka network hai — usi ko digital banayein.",
  },
  {
    icon: Handshake,
    title: "Existing Trust",
    body: "Log aap par pehle se bharosa karte hain. Nexora us trust ko growth me convert karta hai.",
  },
  {
    icon: Store,
    title: "Existing Market",
    body: "Aapka district, aapka market. Koi cold calling nahi — sirf apne logon ko onboard karein.",
  },
  {
    icon: TrendingUp,
    title: "Business Opportunity",
    body: "Recurring revenue share har active shop par. Ek asli business, side hustle nahi.",
  },
  {
    icon: Award,
    title: "Recognition",
    body: "Tiers, badges, leaderboard aur annual retreat — aapke kaam ko pehchan milti hai.",
  },
  {
    icon: Sparkles,
    title: "Long-Term Growth",
    body: "Beauty industry India me har saal badh rahi hai. Aap us growth ke partner banein.",
  },
];

const ECOSYSTEM = [
  { icon: Users, label: "Customers" },
  { icon: Scissors, label: "Salons" },
  { icon: UserRound, label: "Staff" },
  { icon: GraduationCap, label: "Academies" },
  { icon: Sparkles, label: "Brands" },
  { icon: Truck, label: "Distributors" },
  { icon: Handshake, label: "Partners" },
  { icon: Landmark, label: "Nexora Platform" },
];

const WHO_CAN_JOIN = [
  "Hair Product Salesman",
  "Cosmetic Sales Executive",
  "Distributor",
  "Brand Representative",
  "Spa Supplier",
  "Tattoo Supplier",
  "Beauty Consultant",
  "Nail Product Distributor",
];

export function GrowthPartnerPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicPageHeader />

      {/* 1. Hero */}
      <section className="relative overflow-hidden bg-[#0A2540] py-24 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,91,255,0.35),transparent_60%)]" />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 md:grid-cols-2 md:items-center md:px-6">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
              <Sparkles className="h-3 w-3" /> District Business Partner Program
            </span>
            <h1
              className="mt-5 text-4xl font-black leading-[1.05] tracking-tight text-white md:text-6xl"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Apne district ki beauty industry ko digital banaiye.
            </h1>
            <p className="mt-5 max-w-xl text-base text-white/80 md:text-lg">
              Aur us growth ka hissa baniye. Nexora SalonOS ke saath — zero investment,
              transparent system aur ek real business opportunity.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <JoinPartnerDialog
                trigger={
                  <button
                    type="button"
                    className="bg-gradient-cta text-primary-foreground inline-flex items-center gap-2 rounded-[var(--radius-button)] px-6 py-3 text-sm font-bold shadow-[var(--shadow-glow)]"
                  >
                    Join Free <ArrowRight className="h-4 w-4" />
                  </button>
                }
              />
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-[var(--radius-button)] border border-white/30 px-6 py-3 text-sm font-bold text-white hover:bg-white/10"
              >
                <PlayCircle className="h-4 w-4" /> Watch Opportunity
              </button>
              <Link
                to="/contact"
                className="rounded-[var(--radius-button)] border border-white/20 px-6 py-3 text-sm font-bold text-white hover:bg-white/10"
              >
                Talk to Team
              </Link>
            </div>
          </div>

          {/* Hero Illustration — animated digital ecosystem */}
          <div className="relative mx-auto h-[340px] w-full max-w-md md:h-[420px]">
            <div className="absolute inset-0 grid place-items-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="relative h-[280px] w-[280px] md:h-[360px] md:w-[360px]"
              >
                {[Users, Scissors, GraduationCap, Sparkles, Truck, Handshake, UserRound, Store].map((Icon, i, arr) => {
                  const angle = (i / arr.length) * Math.PI * 2;
                  const r = 140;
                  const x = Math.cos(angle) * r;
                  const y = Math.sin(angle) * r;
                  return (
                    <motion.div
                      key={i}
                      animate={{ rotate: -360 }}
                      transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                      className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl border border-white/20 bg-white/10 text-white backdrop-blur"
                      style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
                    >
                      <Icon className="h-5 w-5" />
                    </motion.div>
                  );
                })}
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="bg-gradient-cta text-primary-foreground absolute grid h-24 w-24 place-items-center rounded-3xl shadow-[var(--shadow-glow)]"
              >
                <Landmark className="h-9 w-9" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Trust Strip */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-3 px-4 py-6 md:gap-4 md:px-6">
          {TRUST_BADGES.map((b) => (
            <span
              key={b.label}
              className="border-border text-heading inline-flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-xs font-bold"
            >
              <b.icon className="text-primary h-3.5 w-3.5" />
              {b.label}
            </span>
          ))}
        </div>
      </section>

      {/* 3. Why Become Partner */}
      <section className="mx-auto max-w-6xl px-4 py-24 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-heading text-3xl font-black md:text-5xl">
            Why become a partner
          </h2>
          <p className="text-muted-foreground mt-4 text-base md:text-lg">
            Aap already beauty industry me kaam kar rahe hain. Nexora us kaam ko ek scalable
            business me convert karta hai.
          </p>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {WHY_CARDS.map((f, i) => (
            <motion.article
              key={f.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="border-border bg-card rounded-[var(--radius-card)] border p-7"
            >
              <div className="bg-gradient-cta text-primary-foreground grid h-12 w-12 place-items-center rounded-xl">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-heading mt-5 text-lg font-bold">{f.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{f.body}</p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* 4. Nexora Ecosystem */}
      <section className="bg-muted/30 border-y border-border py-24">
        <div className="mx-auto max-w-4xl px-4 text-center md:px-6">
          <h2 className="text-heading text-3xl font-black md:text-5xl">
            The Nexora ecosystem
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-base md:text-lg">
            Har layer connected hai — customers se lekar platform tak. Aap us network ka growth
            engine bante hain.
          </p>

          <div className="mt-14 flex flex-col items-center gap-3">
            {ECOSYSTEM.map((node, i) => (
              <motion.div
                key={node.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.08 }}
                className="flex flex-col items-center"
              >
                <div
                  className={`inline-flex items-center gap-3 rounded-2xl border px-6 py-3 ${
                    i === ECOSYSTEM.length - 1
                      ? "bg-gradient-cta text-primary-foreground border-transparent shadow-[var(--shadow-glow)]"
                      : "border-border bg-card text-heading"
                  }`}
                >
                  <node.icon className="h-5 w-5" />
                  <span className="text-sm font-bold">{node.label}</span>
                </div>
                {i < ECOSYSTEM.length - 1 && (
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
                    className="bg-primary/50 my-1 h-6 w-px"
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Who Can Join */}
      <section className="mx-auto max-w-6xl px-4 py-24 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-heading text-3xl font-black md:text-5xl">
            Who can join
          </h2>
          <p className="text-muted-foreground mt-4 text-base md:text-lg">
            Agar aap beauty industry me kaam karte hain — aap already qualified hain.
          </p>
        </div>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WHO_CAN_JOIN.map((role, i) => (
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="border-border bg-card group rounded-[var(--radius-card)] border p-6 transition-colors hover:border-primary/40"
            >
              <div className="bg-primary/10 text-primary grid h-11 w-11 place-items-center rounded-xl">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="text-heading mt-4 text-base font-bold">{role}</h3>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <JoinPartnerDialog
            trigger={
              <button
                type="button"
                className="bg-gradient-cta text-primary-foreground inline-flex items-center gap-2 rounded-[var(--radius-button)] px-7 py-3.5 text-sm font-bold shadow-[var(--shadow-glow)]"
              >
                Join the program — Free <ArrowRight className="h-4 w-4" />
              </button>
            }
          />
        </div>
      </section>
    </div>
  );
}

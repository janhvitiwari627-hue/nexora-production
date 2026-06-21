import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles, Star, Users } from "lucide-react";
import { SmartSearchCard } from "./SmartSearchCard";

const TRUST = [
  { icon: ShieldCheck, label: "1000+ Verified Salons" },
  { icon: Users, label: "50K+ Happy Customers" },
  { icon: Sparkles, label: "Jaipur's #1 Platform" },
];

export function HeroSection() {
  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
  };
  const item = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
  };

  return (
    <section className="relative overflow-hidden bg-background pt-20 pb-12 md:pt-28 md:pb-20">
      {/* Soft mesh background */}
      <div className="bg-gradient-mesh pointer-events-none absolute inset-0 opacity-80" />
      <div className="pointer-events-none absolute -top-32 -right-32 h-[480px] w-[480px] rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-32 h-[420px] w-[420px] rounded-full bg-accent/15 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-4 md:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        {/* LEFT — copy */}
        <motion.div variants={stagger} initial="hidden" animate="show" className="min-w-0">
          <motion.div
            variants={item}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-body shadow-[var(--shadow-card)]"
          >
            <span className="bg-gradient-cta inline-block h-2 w-2 rounded-full" />
            Now live in Jaipur
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-5 text-4xl font-black leading-[1.08] tracking-tight text-heading md:text-5xl lg:text-6xl"
          >
            Find Jaipur's Best Beauty Services
            <br />
            <span className="text-gradient-brand">Book In Seconds.</span>
            <br />
            <span className="text-gradient-brand">Earn Rewards.</span>
            <br />
            <span className="text-gradient-brand">Save More.</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-5 max-w-xl text-base text-body md:text-lg"
          >
            The premium operating system for India's beauty industry — built for
            customers, salons and stylists.
          </motion.p>

          <motion.div variants={item} className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/search"
              className="bg-gradient-cta group inline-flex h-[52px] items-center gap-2 rounded-[12px] px-7 text-sm font-bold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform duration-300 hover:-translate-y-0.5"
            >
              Book Now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/for-owners"
              className="inline-flex h-[52px] items-center rounded-[12px] border border-border bg-card px-7 text-sm font-bold text-heading shadow-[var(--shadow-card)] transition hover:-translate-y-0.5"
            >
              Become Shop Owner
            </Link>
          </motion.div>

          <motion.ul
            variants={item}
            className="mt-8 flex flex-wrap items-center gap-2"
          >
            {TRUST.map((t) => (
              <li
                key={t.label}
                className="flex items-center gap-2 rounded-full border border-border bg-card/80 px-3.5 py-1.5 text-xs font-semibold text-body backdrop-blur"
              >
                <t.icon className="h-3.5 w-3.5 text-primary" />
                {t.label}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        {/* RIGHT — illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="relative mx-auto w-full max-w-xl"
        >
          <HeroIllustration />
        </motion.div>
      </div>

      {/* Floating search */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mt-12 md:mt-16"
      >
        <SmartSearchCard />
      </motion.div>
    </section>
  );
}

function HeroIllustration() {
  return (
    <div className="relative aspect-[5/4] w-full">
      {/* Card frame */}
      <div className="absolute inset-0 rounded-[28px] border border-border bg-card shadow-[var(--shadow-float)]">
        {/* Sky gradient */}
        <div
          className="absolute inset-x-0 top-0 h-2/3 rounded-t-[28px]"
          style={{
            background:
              "linear-gradient(180deg, #635BFF 0%, #7A73FF 45%, #BFA8FF 80%, #FFE6D6 100%)",
          }}
        />

        {/* Stars */}
        <div className="absolute top-6 left-8 h-1.5 w-1.5 rounded-full bg-white/80" />
        <div className="absolute top-10 left-20 h-1 w-1 rounded-full bg-white/60" />
        <div className="absolute top-16 right-16 h-1.5 w-1.5 rounded-full bg-white/70" />
        <div className="absolute top-8 right-32 h-1 w-1 rounded-full bg-white/50" />

        {/* Jaipur skyline silhouette */}
        <svg
          aria-hidden
          viewBox="0 0 600 240"
          preserveAspectRatio="xMidYMax slice"
          className="absolute inset-x-0 bottom-[32%] w-full"
        >
          <defs>
            <pattern id="hero-windows" x="0" y="0" width="22" height="28" patternUnits="userSpaceOnUse">
              <rect width="10" height="16" x="6" y="6" rx="5" fill="#FFE6D6" opacity="0.55" />
            </pattern>
            <linearGradient id="hero-mahal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF8A65" />
              <stop offset="100%" stopColor="#E85D3A" />
            </linearGradient>
          </defs>
          {/* Hawa Mahal-inspired silhouette */}
          <path
            d="M0,240 L0,160 L40,160 L48,130 L80,130 L88,100 L120,100 L128,70 L160,70 L170,45 L195,30 L220,45 L230,70 L262,70 L270,100 L302,100 L310,70 L342,70 L352,45 L380,30 L408,45 L418,70 L450,70 L458,100 L490,100 L498,130 L530,130 L538,160 L600,160 L600,240 Z"
            fill="url(#hero-mahal)"
          />
          <rect x="0" y="60" width="600" height="180" fill="url(#hero-windows)" />
        </svg>

        {/* Ground / base */}
        <div
          className="absolute inset-x-0 bottom-0 h-1/3 rounded-b-[28px]"
          style={{
            background:
              "linear-gradient(180deg, #F6F9FC 0%, #FFFFFF 60%, #FFFFFF 100%)",
          }}
        />

        {/* Floating booking card */}
        <div className="absolute right-6 bottom-6 w-[58%] rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-float)]">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-cta grid h-10 w-10 shrink-0 place-items-center rounded-xl text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-heading">Lakmé Salon, C-Scheme</p>
              <p className="flex items-center gap-1 text-xs text-body">
                <Star className="h-3 w-3 fill-warning text-warning" />
                4.9 · 0.8 km away
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-success">Slot at 6:30 PM</span>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">
              BOOK
            </span>
          </div>
        </div>

        {/* Floating membership chip */}
        <div className="bg-gradient-gold absolute top-6 left-6 flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold text-[#3D2A00] shadow-[var(--shadow-float)]">
          <Sparkles className="h-3.5 w-3.5" />
          Gold Member · 25% off
        </div>
      </div>
    </div>
  );
}

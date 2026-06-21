import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, ShieldCheck, Sparkles, Star, Store, Users } from "lucide-react";
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
    <section className="relative flex min-h-[90vh] flex-col justify-center overflow-hidden bg-background pt-24 pb-12 md:pt-28 md:pb-20">
      {/* Full-width Jaipur + SaaS abstract background */}
      <HeroBackground />

      {/* Centered content */}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-4 text-center md:px-6">
        <motion.div variants={stagger} initial="hidden" animate="show" className="w-full max-w-4xl">
          <motion.div
            variants={item}
            className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card/90 px-3 py-1.5 text-xs font-semibold text-body shadow-[var(--shadow-card)] backdrop-blur"
          >
            <span className="bg-gradient-cta inline-block h-2 w-2 rounded-full" />
            Now live in Jaipur
          </motion.div>

          <motion.h1
            variants={item}
            className="mx-auto mt-5 text-4xl font-black leading-[1.05] tracking-tight text-heading md:text-5xl lg:text-7xl"
          >
            India's Smart
            <br />
            <span className="text-gradient-brand">Beauty Booking Platform</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mx-auto mt-5 max-w-2xl text-base text-body md:text-lg lg:text-xl"
          >
            Book Salons, Beauty Parlours, Spas, Tattoo Studios, Massage Centers and
            Nail Art Studios in under 60 seconds.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link
              to="/search"
              className="bg-gradient-cta group inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-[12px] px-7 text-sm font-bold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform duration-300 hover:-translate-y-0.5 sm:w-auto"
            >
              Book Now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/nearby"
              className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-[12px] border border-border bg-card px-7 text-sm font-bold text-heading shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 sm:w-auto"
            >
              <MapPin className="h-4 w-4 text-primary" />
              Explore Nearby
            </Link>
          </motion.div>

          <motion.div variants={item} className="mt-4">
            <Link
              to="/for-owners"
              className="inline-flex items-center gap-2 text-sm font-semibold text-body underline-offset-4 transition hover:text-heading hover:underline"
            >
              <Store className="h-4 w-4" />
              Become Shop Owner
            </Link>
          </motion.div>

          <motion.ul
            variants={item}
            className="mt-8 flex flex-wrap items-center justify-center gap-2"
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
      </div>

      {/* Floating search */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-auto mt-12 w-full max-w-4xl px-4 md:mt-16 md:px-6"
      >
        <SmartSearchCard />
      </motion.div>
    </section>
  );
}

function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Gradient mesh */}
      <div className="bg-gradient-mesh absolute inset-0 opacity-90" />

      {/* Abstract SaaS glow orbs */}
      <div
        className="absolute -top-20 left-1/4 h-[500px] w-[500px] rounded-full opacity-60 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(99,91,255,0.25) 0%, transparent 70%)" }}
      />
      <div
        className="absolute top-1/3 -right-20 h-[440px] w-[440px] rounded-full opacity-50 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(0,212,255,0.22) 0%, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-32 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full opacity-55 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(122,115,255,0.2) 0%, transparent 70%)" }}
      />

      {/* Abstract geometric shapes */}
      <div className="absolute top-20 right-[12%] h-24 w-24 rotate-12 rounded-3xl border border-primary/20 bg-primary/5 blur-[1px]" />
      <div className="absolute top-32 left-[10%] h-16 w-16 -rotate-12 rounded-2xl border border-accent/20 bg-accent/5 blur-[1px]" />
      <div className="absolute bottom-[42%] right-[8%] h-20 w-20 rotate-45 rounded-3xl border border-warning/20 bg-warning/5 blur-[1px]" />

      {/* Floating glass cards representing salon lifestyle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="absolute top-28 left-[6%] hidden rounded-2xl border border-border/60 bg-card/70 p-3 shadow-[var(--shadow-card)] backdrop-blur md:block"
      >
        <div className="flex items-center gap-2">
          <div className="bg-gradient-cta grid h-8 w-8 place-items-center rounded-lg text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-heading">Premium Spa</p>
            <p className="text-[10px] text-body">Jaipur · 4.9</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute top-36 right-[5%] hidden rounded-2xl border border-border/60 bg-card/70 p-3 shadow-[var(--shadow-card)] backdrop-blur md:block"
      >
        <div className="flex items-center gap-2">
          <div className="bg-gradient-gold grid h-8 w-8 place-items-center rounded-lg text-[#3D2A00]">
            <Star className="h-4 w-4 fill-current" />
          </div>
          <div>
            <p className="text-xs font-bold text-heading">Gold Member</p>
            <p className="text-[10px] text-body">25% off every booking</p>
          </div>
        </div>
      </motion.div>

      {/* Jaipur skyline + Amber Fort + Hawa Mahal silhouette */}
      <svg
        aria-hidden
        viewBox="0 0 1440 320"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-x-0 bottom-0 h-[45%] w-full opacity-[0.85]"
      >
        <defs>
          <linearGradient id="jaipur-skyline" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF8A65" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#E85D3A" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#635BFF" stopOpacity="0.85" />
          </linearGradient>
          <pattern id="palace-windows" x="0" y="0" width="28" height="36" patternUnits="userSpaceOnUse">
            <rect width="12" height="20" x="8" y="8" rx="6" fill="#FFE6D6" opacity="0.5" />
          </pattern>
        </defs>

        {/* Ground hill */}
        <path
          d="M0,320 L0,260 C120,240 240,280 360,255 C480,230 600,200 720,210 C840,220 960,180 1080,175 C1200,170 1320,200 1440,185 L1440,320 Z"
          fill="url(#jaipur-skyline)"
          opacity="0.15"
        />

        {/* Amber Fort inspired silhouette */}
        <path
          d="M40,320 L40,240 L60,240 L70,220 L90,220 L100,200 L130,200 L140,180 L170,180 L180,160 L210,160 L220,180 L250,180 L260,200 L290,200 L300,220 L330,220 L340,240 L360,240 L360,320 Z"
          fill="url(#jaipur-skyline)"
          opacity="0.35"
        />

        {/* Hawa Mahal inspired silhouette */}
        <path
          d="M500,320 L500,230 L530,230 L538,200 L560,200 L568,170 L590,170 L598,140 L620,140 L630,115 L655,100 L680,115 L690,140 L712,140 L720,170 L742,170 L750,200 L772,200 L780,170 L802,170 L810,140 L832,140 L842,115 L865,100 L890,115 L900,140 L922,140 L930,170 L952,170 L960,200 L982,200 L990,230 L1020,230 L1020,320 Z"
          fill="url(#jaipur-skyline)"
        />
        <rect x="500" y="140" width="520" height="180" fill="url(#palace-windows)" opacity="0.4" />

        {/* Jaipur city skyline */}
        <path
          d="M1080,320 L1080,250 L1100,250 L1108,230 L1130,230 L1140,250 L1170,250 L1170,320 Z"
          fill="url(#jaipur-skyline)"
          opacity="0.5"
        />
        <path
          d="M1200,320 L1200,220 L1230,220 L1240,200 L1270,200 L1280,220 L1310,220 L1310,320 Z"
          fill="url(#jaipur-skyline)"
          opacity="0.45"
        />
        <path
          d="M1340,320 L1340,260 L1360,260 L1370,240 L1390,240 L1400,260 L1420,260 L1420,320 Z"
          fill="url(#jaipur-skyline)"
          opacity="0.5"
        />
      </svg>

      {/* Bottom gradient fade to background */}
      <div
        className="absolute inset-x-0 bottom-0 h-32"
        style={{ background: "linear-gradient(to top, var(--background) 0%, transparent 100%)" }}
      />
    </div>
  );
}

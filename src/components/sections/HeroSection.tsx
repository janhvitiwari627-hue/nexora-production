import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, ShieldCheck, Sparkles, Store, Users } from "lucide-react";
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
            Book Jaipur's Best
            <br />
            <span className="text-gradient-brand">Beauty Services</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mx-auto mt-5 max-w-2xl text-base text-body md:text-lg lg:text-xl"
          >
            <span className="font-semibold text-heading">Salon Ja Rahe Ho? Nexora Kiya Kya?</span>
            <br className="hidden sm:block" />
            India's Beauty Industry Operating System — find, book and save in seconds.
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
              to="/search"
              search={{ q: "nearby" }}
              className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-[12px] border border-border bg-card px-7 text-sm font-bold text-heading shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 sm:w-auto"
            >
              <MapPin className="h-4 w-4 text-primary" />
              Explore Nearby
            </Link>
          </motion.div>

          <motion.div variants={item} className="mt-4">
            <Link
              to="/owner/templates"
              className="inline-flex items-center gap-2 text-sm font-semibold text-body underline-offset-4 transition hover:text-heading hover:underline"
            >
              <Store className="h-4 w-4" />
              Create Shop Website
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
      {/* Soft premium gradient mesh */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 20% 10%, rgba(99,91,255,0.10) 0%, transparent 60%), radial-gradient(50% 50% at 85% 5%, rgba(0,212,255,0.08) 0%, transparent 60%), radial-gradient(55% 45% at 70% 90%, rgba(122,115,255,0.10) 0%, transparent 60%)",
        }}
      />

      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: "radial-gradient(rgba(10,37,64,0.08) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
        }}
      />

      {/* Soft indigo blur orbs */}
      <div
        className="absolute -top-24 left-1/4 h-[480px] w-[480px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(99,91,255,0.18) 0%, transparent 70%)" }}
      />
      <div
        className="absolute top-1/3 -right-24 h-[420px] w-[420px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)" }}
      />

      {/* Elegant Jaipur line-art silhouette — Hawa Mahal + Amber Fort + skyline */}
      <svg
        aria-hidden
        viewBox="0 0 1440 320"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-x-0 bottom-0 h-[42%] w-full"
      >
        <defs>
          <linearGradient id="jaipur-line" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#635BFF" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#635BFF" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        <g
          fill="none"
          stroke="url(#jaipur-line)"
          strokeWidth="1.25"
          strokeLinejoin="round"
          strokeLinecap="round"
        >
          {/* Amber Fort */}
          <path d="M40,300 L40,240 L60,240 L70,220 L90,220 L100,200 L130,200 L140,180 L170,180 L180,160 L210,160 L220,180 L250,180 L260,200 L290,200 L300,220 L330,220 L340,240 L360,240 L360,300" />

          {/* Hawa Mahal */}
          <path d="M500,300 L500,230 L530,230 L538,200 L560,200 L568,170 L590,170 L598,140 L620,140 L630,115 L655,100 L680,115 L690,140 L712,140 L720,170 L742,170 L750,200 L772,200 L780,170 L802,170 L810,140 L832,140 L842,115 L865,100 L890,115 L900,140 L922,140 L930,170 L952,170 L960,200 L982,200 L990,230 L1020,230 L1020,300" />

          {/* Window arches */}
          <g stroke="rgba(99,91,255,0.35)" strokeWidth="1">
            <path d="M548,230 q12,-18 24,0" />
            <path d="M608,200 q12,-18 24,0" />
            <path d="M668,170 q12,-18 24,0" />
            <path d="M728,200 q12,-18 24,0" />
            <path d="M788,170 q12,-18 24,0" />
            <path d="M848,200 q12,-18 24,0" />
            <path d="M908,170 q12,-18 24,0" />
            <path d="M968,200 q12,-18 24,0" />
          </g>

          {/* Skyline towers */}
          <path d="M1080,300 L1080,250 L1100,250 L1108,230 L1130,230 L1140,250 L1170,250 L1170,300" />
          <path d="M1200,300 L1200,220 L1230,220 L1240,200 L1270,200 L1280,220 L1310,220 L1310,300" />
          <path d="M1340,300 L1340,260 L1360,260 L1370,240 L1390,240 L1400,260 L1420,260 L1420,300" />

          {/* Subtle ground line */}
          <path d="M0,300 L1440,300" stroke="rgba(10,37,64,0.08)" strokeWidth="1" />
        </g>
      </svg>

      {/* Bottom fade */}
      <div
        className="absolute inset-x-0 bottom-0 h-32"
        style={{ background: "linear-gradient(to top, var(--background) 0%, transparent 100%)" }}
      />
    </div>
  );
}

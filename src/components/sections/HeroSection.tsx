import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles, Users } from "lucide-react";
import { SmartSearchCard } from "./SmartSearchCard";

const HEADLINES = [
  "Book Your Salon. Skip The Wait.",
  "Find Top Barbers in Jaipur.",
  "Premium Beauty. Instant Booking.",
];

const TRUST = [
  { icon: ShieldCheck, label: "1000+ Verified Salons" },
  { icon: Users, label: "50K+ Happy Customers" },
  { icon: Sparkles, label: "Jaipur's #1 Platform" },
];

export function HeroSection() {
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    const full = HEADLINES[idx];
    let i = 0;
    setTyped("");
    const typer = setInterval(() => {
      i++;
      setTyped(full.slice(0, i));
      if (i >= full.length) clearInterval(typer);
    }, 45);
    const next = setTimeout(() => setIdx((n) => (n + 1) % HEADLINES.length), 3800);
    return () => {
      clearInterval(typer);
      clearTimeout(next);
    };
  }, [idx]);

  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.18, delayChildren: 0.1 } },
  };
  const item = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
  };

  return (
    <section
      className="relative flex min-h-screen flex-col justify-between overflow-hidden pt-24 pb-8"
      style={{
        background:
          "linear-gradient(135deg, #0A2540 0%, #1a1060 50%, #635BFF 100%)",
      }}
    >
      {/* Hawa Mahal silhouette */}
      <svg
        aria-hidden
        viewBox="0 0 1200 400"
        preserveAspectRatio="xMidYMax slice"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] w-full opacity-15"
      >
        <defs>
          <pattern id="windows" x="0" y="0" width="40" height="48" patternUnits="userSpaceOnUse">
            <rect width="22" height="34" x="9" y="8" rx="11" fill="#fff" opacity="0.35" />
          </pattern>
        </defs>
        <path
          d="M0,400 L0,260 L60,260 L70,200 L120,200 L130,140 L180,140 L190,80 L240,80 L255,40 L290,20 L325,40 L340,80 L390,80 L400,140 L450,140 L460,200 L510,200 L520,140 L570,140 L580,80 L620,80 L635,40 L670,20 L705,40 L720,80 L760,80 L770,140 L820,140 L830,200 L880,200 L890,140 L940,140 L950,200 L1000,200 L1010,260 L1080,260 L1090,300 L1140,300 L1200,300 L1200,400 Z"
          fill="#fff"
        />
        <rect x="0" y="80" width="1200" height="320" fill="url(#windows)" opacity="0.5" />
      </svg>

      {/* Glow blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#635BFF] opacity-30 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-[#00D4FF] opacity-20 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-4 text-center md:px-6">
        <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-4xl">
          <motion.h1
            variants={item}
            className="min-h-[1.1em] text-4xl font-black leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl"
          >
            {typed}
            <span className="ml-1 inline-block w-[3px] animate-pulse bg-[#00D4FF] align-middle" style={{ height: "0.9em" }} />
          </motion.h1>

          <motion.p
            variants={item}
            className="mx-auto mt-6 max-w-2xl text-base font-light text-[#E0E0E0] md:text-lg"
            style={{ letterSpacing: "0.05em" }}
          >
            Discover Jaipur's finest salons, spas and barbers. Book instantly, earn rewards,
            walk in like a regular.
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/search"
              className="ripple relative overflow-hidden rounded-[12px] bg-gradient-to-r from-[#635BFF] to-[#00D4FF] px-8 py-3.5 text-sm font-bold text-white shadow-[0_15px_40px_-10px_rgba(0,212,255,0.7)] transition hover:scale-[1.03]"
            >
              Book Now
            </Link>
            <Link
              to="/search"
              className="rounded-[12px] border border-white/40 bg-white/5 px-8 py-3.5 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/15"
            >
              Explore Nearby
            </Link>
          </motion.div>

          <motion.div variants={item} className="mt-5">
            <Link
              to="/search"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 underline-offset-4 hover:text-white hover:underline"
            >
              Become a Shop Owner <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <motion.ul
            variants={item}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            {TRUST.map((t) => (
              <li
                key={t.label}
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white/90 backdrop-blur-md"
              >
                <t.icon className="h-4 w-4 text-[#00D4FF]" />
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
        transition={{ delay: 0.9, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mt-8"
      >
        <SmartSearchCard />
      </motion.div>
    </section>
  );
}

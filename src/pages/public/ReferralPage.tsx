import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Coins, Gift, Share2, Trophy, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { icon: Share2, title: "Share your code", body: "Send your unique referral code to friends via WhatsApp or social." },
  { icon: UserPlus, title: "Friend signs up", body: "They get ₹200 off their first booking — a sweet welcome." },
  { icon: Coins, title: "You earn rewards", body: "Get 500 reward points after their first completed booking." },
];

const LEADERBOARD = [
  { name: "Priya Sharma", referrals: 42, earned: "₹8,400" },
  { name: "Aman Verma", referrals: 38, earned: "₹7,600" },
  { name: "Neha Joshi", referrals: 31, earned: "₹6,200" },
  { name: "Karan Khanna", referrals: 28, earned: "₹5,600" },
  { name: "Riya Bhatia", referrals: 24, earned: "₹4,800" },
];

export function ReferralPage() {
  const isLoggedIn = false; // mock — wire to auth later
  const code = "NEXORA-RIYA42";
  const [copied, setCopied] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0A2540] via-[#1a1060] to-[#635BFF] py-20 text-center md:py-28">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] [background-size:32px_32px]" />
        {/* Coin animation */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -50, x: `${(i * 8) % 100}%`, rotate: 0, opacity: 0 }}
              animate={{ y: 800, rotate: 360, opacity: [0, 1, 1, 0] }}
              transition={{ duration: 6 + (i % 4), repeat: Infinity, delay: i * 0.4, ease: "linear" }}
              className="absolute h-8 w-8 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 shadow-lg ring-2 ring-amber-200/70"
              style={{ left: `${(i * 8) % 95}%` }}
            />
          ))}
        </div>
        <div className="relative mx-auto max-w-3xl px-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur">
            <Gift className="h-3 w-3" /> Refer & earn
          </span>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-6xl" style={{ fontFamily: "Inter, sans-serif" }}>
            Give ₹200. Get ₹200.
          </h1>
          <p className="mt-4 text-base text-white/90 md:text-lg">
            Invite your friends. Both of you get rewarded after their first booking.
          </p>
        </div>
      </section>

      {/* 3-step flow */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <h2 className="text-heading text-center text-3xl font-black md:text-4xl">How it works</h2>
        <div className="mt-12 grid items-start gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }} className="relative">
              <div className="border-border bg-card rounded-[var(--radius-card-lg)] border p-7 text-center shadow-[var(--shadow-card)]">
                <div className="bg-gradient-cta text-primary-foreground mx-auto grid h-14 w-14 place-items-center rounded-2xl">
                  <s.icon className="h-7 w-7" />
                </div>
                <div className="text-muted-foreground mt-3 text-[10px] font-black uppercase tracking-wider">Step {i + 1}</div>
                <h3 className="text-heading mt-1 text-lg font-bold">{s.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm">{s.body}</p>
              </div>
              {i < STEPS.length - 1 && (
                <motion.svg viewBox="0 0 100 20" className="text-primary hidden md:block absolute top-1/2 -right-6 h-6 w-12 -translate-y-1/2" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.12 + 0.3 }}>
                  <motion.path d="M5 10 H85 M75 4 L88 10 L75 16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Referral code or login */}
      <section className="mx-auto max-w-3xl px-4 pb-16 md:px-6">
        {isLoggedIn ? (
          <div className="from-primary/10 via-card to-accent/10 border-primary/30 rounded-[24px] border bg-gradient-to-br p-8 text-center shadow-[var(--shadow-glow)]">
            <div className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Your referral code</div>
            <div className="text-heading mt-2 font-mono text-3xl font-black tracking-widest md:text-4xl">{code}</div>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <button onClick={() => { navigator.clipboard?.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className={cn("inline-flex items-center gap-1.5 rounded-[var(--radius-button)] px-5 py-2.5 text-sm font-bold transition", copied ? "bg-success text-white" : "border-primary text-primary border-2")}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy code"}
              </button>
              <a href={`https://wa.me/?text=${encodeURIComponent(`Join me on Nexora — use my code ${code} for ₹200 off your first booking!`)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-[var(--radius-button)] bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white">
                <Share2 className="h-4 w-4" /> Share on WhatsApp
              </a>
            </div>
            <div className="border-border mt-6 grid grid-cols-3 gap-3 border-t pt-5 text-center">
              <Stat label="Friends invited" value="7" />
              <Stat label="Successful" value="4" />
              <Stat label="Earned" value="₹800" />
            </div>
          </div>
        ) : (
          <div className="border-border bg-card rounded-[24px] border p-8 text-center">
            <h3 className="text-heading text-xl font-bold">Sign in to get your code</h3>
            <p className="text-muted-foreground mt-2 text-sm">Log in or create an account to generate your unique referral link.</p>
            <button className="bg-gradient-cta text-primary-foreground mt-5 rounded-[var(--radius-button)] px-6 py-3 text-sm font-bold shadow-[var(--shadow-glow)]">Sign in to continue</button>
          </div>
        )}
      </section>

      {/* Leaderboard */}
      <section className="bg-muted/30 border-t border-border py-16">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Trophy className="text-warning h-6 w-6" />
            <h2 className="text-heading text-2xl font-black md:text-3xl">Top referrers this month</h2>
          </div>
          <ul className="bg-card border-border mt-6 divide-y divide-border overflow-hidden rounded-[var(--radius-card-lg)] border">
            {LEADERBOARD.map((r, i) => (
              <li key={r.name} className="flex items-center gap-4 px-5 py-4">
                <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-black", i === 0 ? "bg-gradient-gold text-heading" : i === 1 ? "bg-slate-200 text-slate-900" : i === 2 ? "bg-amber-300 text-amber-950" : "bg-muted text-heading")}>
                  #{i + 1}
                </span>
                <div className="text-heading flex-1 text-sm font-bold">{r.name}</div>
                <div className="text-muted-foreground text-xs">{r.referrals} referrals</div>
                <div className="text-success text-sm font-black">{r.earned}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-heading text-2xl font-black">{value}</div>
      <div className="text-muted-foreground text-[11px] uppercase tracking-wider">{label}</div>
    </div>
  );
}

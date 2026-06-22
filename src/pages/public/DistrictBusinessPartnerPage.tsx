import { Link } from "@tanstack/react-router";
import {
  Award,
  BadgeCheck,
  Building2,
  Car,
  CheckCircle2,
  Crown,
  FileText,
  Gift,
  Handshake,
  IndianRupee,
  Laptop,
  Medal,
  Network,
  Rocket,
  ShieldCheck,
  Shirt,
  Sparkles,
  Star,
  Store,
  Tablet,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
  Zap,
} from "lucide-react";

const dbpBenefits = [
  { icon: Trophy, label: "Hall Of Fame Recognition" },
  { icon: Crown, label: "Leadership Status" },
  { icon: Building2, label: "District Level Visibility" },
  { icon: Users, label: "Community Influence" },
  { icon: Network, label: "Business Network Expansion" },
  { icon: IndianRupee, label: "Revenue Based Rewards" },
  { icon: Medal, label: "Milestone Recognition" },
  { icon: Rocket, label: "Growth Leadership Identity" },
  { icon: Star, label: "Premium Partner Recognition" },
  { icon: Sparkles, label: "Future Leadership Opportunities" },
];

const milestones = [
  {
    shops: "25",
    title: "Welcome Tier",
    rewards: [
      { icon: Gift, label: "Welcome Kit" },
      { icon: FileText, label: "Certificate" },
    ],
    color: "from-slate-500 to-slate-700",
    ring: "border-slate-300 dark:border-slate-700",
  },
  {
    shops: "50",
    title: "Recognition Tier",
    rewards: [
      { icon: Shirt, label: "Official Nexora T-Shirt" },
      { icon: BadgeCheck, label: "Recognition Badge" },
    ],
    color: "from-blue-500 to-indigo-600",
    ring: "border-blue-300 dark:border-blue-800",
  },
  {
    shops: "100",
    title: "Growth Builder",
    rewards: [
      { icon: Tablet, label: "Tablet" },
      { icon: BadgeCheck, label: "Growth Builder Badge" },
    ],
    color: "from-emerald-500 to-teal-600",
    ring: "border-emerald-300 dark:border-emerald-800",
  },
  {
    shops: "500",
    title: "Platinum Growth Partner",
    rewards: [
      { icon: Laptop, label: "Branded Laptop" },
      { icon: Crown, label: "Platinum Status" },
    ],
    color: "from-purple-500 to-fuchsia-600",
    ring: "border-purple-300 dark:border-purple-800",
  },
  {
    shops: "1000+",
    title: "District Business Partner",
    rewards: [
      { icon: Car, label: "Car Reward Eligibility" },
      { icon: Trophy, label: "Hall Of Fame Entry" },
      { icon: Crown, label: "Leadership Circle" },
      { icon: ShieldCheck, label: "District Authority Status" },
    ],
    color: "from-amber-500 via-orange-500 to-rose-600",
    ring: "border-amber-400 dark:border-amber-600",
    featured: true,
  },
];

const trustBadges = [
  { icon: ShieldCheck, label: "No Joining Fee" },
  { icon: Wallet, label: "No Investment" },
  { icon: BadgeCheck, label: "Transparent System" },
  { icon: TrendingUp, label: "Performance Rewards" },
  { icon: Rocket, label: "Real Business Growth" },
  { icon: Crown, label: "Leadership Opportunity" },
];

const ecosystem = [
  "Salon Owners",
  "Barber Shops",
  "Beauty Parlours",
  "Spa Centers",
  "Tattoo Studios",
  "Massage Centers",
  "Nail Art Studios",
  "Beauty Brands",
  "Distributors",
  "Customers",
];

const youKnow = ["Salon Owners", "Barber Shops", "Beauty Parlours", "Distributors", "Beauty Brands"];
const nexoraGives = ["Technology", "Booking System", "Website", "CRM", "Growth Tools", "Brand Power", "Digital Ecosystem"];

const steps = [
  { n: 1, title: "Salon Connect Karo", desc: "Apne network ke salons se baat karo", icon: Handshake },
  { n: 2, title: "Salon Onboard Karo", desc: "Nexora platform pe register karwao", icon: Store },
  { n: 3, title: "Revenue Generate", desc: "Salon active bookings le", icon: TrendingUp },
  { n: 4, title: "Partner Share Unlock", desc: "Aapka reward activate", icon: Gift },
  { n: 5, title: "District Grow Karo", desc: "Network expand karte raho", icon: Network },
];

const growthShareTiers = [
  { period: "First 6 Months", share: "10%", color: "from-emerald-500 to-teal-600" },
  { period: "Month 7 – 12", share: "5%", color: "from-blue-500 to-indigo-600" },
  { period: "After 12 Months", share: "2%", color: "from-purple-500 to-fuchsia-600" },
];

const idealFor = [
  "Beauty Product Salesmen",
  "Cosmetic Distributors",
  "Salon Product Representatives",
  "Barber Product Suppliers",
  "Beauty Consultants",
  "Local Market Influencers",
  "Existing Growth Partners",
];

export default function DistrictBusinessPartnerPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-rose-950/30 px-6 py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-200/40 via-transparent to-transparent dark:from-amber-500/10" />
        <div className="relative mx-auto max-w-6xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-white/70 px-4 py-1.5 text-sm font-medium text-amber-900 backdrop-blur dark:bg-white/5 dark:text-amber-200">
            <Crown className="h-4 w-4" /> District Leadership Program
          </div>
          <h1 className="bg-gradient-to-r from-amber-700 via-orange-600 to-rose-600 bg-clip-text text-4xl font-extrabold leading-tight tracking-tight text-transparent md:text-6xl dark:from-amber-300 dark:via-orange-300 dark:to-rose-300">
            DISTRICT BUSINESS PARTNER
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Build Your District. Grow The Nexora Network. Earn Through Real Business Growth.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {["Salary Nahi, Growth Share", "Shop Add Nahi, Business Build Karo", "Apne District Ka Growth Leader Bano", "Nexora Ko Grow Karo, Khud Grow Karo"].map((t) => (
              <span key={t} className="rounded-full bg-white/80 px-4 py-1.5 text-sm font-medium text-amber-900 shadow-sm backdrop-blur dark:bg-white/10 dark:text-amber-100">
                {t}
              </span>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/register"
              className="rounded-full bg-gradient-to-r from-amber-600 to-orange-600 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-amber-600/30 transition hover:shadow-xl hover:shadow-amber-600/40"
            >
              Apply as District Partner
            </Link>
            <a href="#how-it-works" className="rounded-full border border-amber-300 bg-white/70 px-8 py-3 text-base font-semibold text-amber-900 backdrop-blur transition hover:bg-white dark:bg-white/5 dark:text-amber-100">
              How It Works
            </a>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {trustBadges.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 rounded-2xl border border-amber-200/60 bg-white/60 p-4 backdrop-blur dark:border-white/10 dark:bg-white/5">
                <Icon className="h-5 w-5 text-amber-700 dark:text-amber-300" />
                <span className="text-center text-xs font-medium text-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IDEAL FOR */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Yeh Page Kiske Liye Hai?</h2>
          <p className="mt-3 text-muted-foreground">Jo log already beauty industry ko jaante hain</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {idealFor.map((role) => (
              <span key={role} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {role}
              </span>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-2xl rounded-2xl bg-amber-50 p-6 text-lg font-semibold text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            Not a Job. Not a Franchise. Not MLM. <br />
            <span className="text-amber-700 dark:text-amber-300">A District Growth Leadership Opportunity.</span>
          </p>
        </div>
      </section>

      {/* ECOSYSTEM VISUAL */}
      <section className="bg-muted/30 px-6 py-20">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Industry Network</h2>
          <p className="mt-3 text-muted-foreground">Aap industry ko jaante ho. Ab industry network ko income mein convert karo.</p>

          <div className="relative mx-auto mt-12 aspect-square max-w-2xl">
            {/* Center */}
            <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
              <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-2xl md:h-40 md:w-40">
                <Sparkles className="h-8 w-8" />
                <span className="mt-1 text-sm font-bold md:text-base">Nexora</span>
                <span className="text-[10px] opacity-90 md:text-xs">SalonOS</span>
              </div>
            </div>
            {/* Orbiting nodes */}
            {ecosystem.map((node, i) => {
              const angle = (i / ecosystem.length) * 2 * Math.PI - Math.PI / 2;
              const r = 44;
              const x = 50 + r * Math.cos(angle);
              const y = 50 + r * Math.sin(angle);
              return (
                <div
                  key={node}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-200 bg-white shadow-md dark:border-white/10 dark:bg-card md:h-14 md:w-14">
                      <Store className="h-5 w-5 text-amber-700 dark:text-amber-300" />
                    </div>
                    <span className="whitespace-nowrap rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium shadow-sm dark:bg-card md:text-xs">
                      {node}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY DBP */}
      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
              <Users className="h-4 w-4" /> Aap Already Jaante Ho
            </div>
            <ul className="space-y-3">
              {youKnow.map((x) => (
                <li key={x} className="flex items-center gap-3 text-base">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" /> {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-8 dark:border-amber-900/40 dark:from-amber-950/20 dark:to-orange-950/20">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-200 px-3 py-1 text-sm font-medium text-amber-900 dark:bg-amber-900/40 dark:text-amber-100">
              <Zap className="h-4 w-4" /> Nexora Deta Hai
            </div>
            <ul className="space-y-3">
              {nexoraGives.map((x) => (
                <li key={x} className="flex items-center gap-3 text-base">
                  <Sparkles className="h-5 w-5 text-amber-600" /> {x}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-3xl rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 p-6 text-center text-lg font-semibold text-white shadow-xl">
          Aapka Network + Nexora Platform = Growth Opportunity
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="bg-muted/30 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">How It Works</h2>
            <p className="mt-3 text-muted-foreground">5 simple steps from connect to recurring earnings</p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map(({ n, title, desc, icon: Icon }) => (
              <div key={n} className="relative rounded-2xl border border-border bg-card p-6 transition hover:shadow-lg">
                <div className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 px-3 py-1 text-xs font-bold text-white shadow">
                  STEP {n}
                </div>
                <Icon className="mt-2 h-8 w-8 text-amber-600" />
                <h3 className="mt-4 text-lg font-bold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ACTIVATION REWARD */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">One-Time Activation Reward</h2>
            <p className="mt-3 text-muted-foreground">Shop activate → 15 day revenue verification → Reward unlock</p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {/* Single shop example */}
            <div className="rounded-3xl border border-border bg-card p-8">
              <h3 className="mb-6 flex items-center gap-2 text-xl font-bold">
                <Store className="h-5 w-5 text-amber-600" /> Single Shop Example
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Shop Revenue", value: "₹15,000", tone: "text-foreground" },
                  { label: "Nexora Commission (10%)", value: "₹1,500", tone: "text-blue-600" },
                  { label: "Partner Activation Share (10%)", value: "₹150", tone: "text-emerald-600" },
                ].map((r) => (
                  <div key={r.label} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                    <span className="text-sm text-muted-foreground">{r.label}</span>
                    <span className={`text-lg font-bold ${r.tone}`}>{r.value}</span>
                  </div>
                ))}
                <div className="mt-2 rounded-xl bg-emerald-50 p-4 text-center dark:bg-emerald-950/30">
                  <div className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Partner Earned</div>
                  <div className="mt-1 text-3xl font-extrabold text-emerald-700 dark:text-emerald-300">₹150</div>
                </div>
              </div>
            </div>

            {/* 100 shops example */}
            <div className="rounded-3xl border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 p-8 dark:border-amber-700 dark:from-amber-950/30 dark:to-orange-950/30">
              <h3 className="mb-6 flex items-center gap-2 text-xl font-bold">
                <Building2 className="h-5 w-5 text-amber-700" /> 100 Active Shops Example
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Active Shops", value: "100" },
                  { label: "Revenue Generated", value: "₹15,00,000" },
                  { label: "Nexora Revenue", value: "₹1,50,000" },
                ].map((r) => (
                  <div key={r.label} className="flex items-center justify-between border-b border-amber-200/60 pb-3 last:border-0 dark:border-amber-800/50">
                    <span className="text-sm text-amber-900/80 dark:text-amber-200/80">{r.label}</span>
                    <span className="text-lg font-bold text-amber-900 dark:text-amber-100">{r.value}</span>
                  </div>
                ))}
                <div className="mt-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 p-4 text-center text-white shadow-lg">
                  <div className="text-xs uppercase tracking-wide opacity-90">Partner Reward</div>
                  <div className="mt-1 text-3xl font-extrabold">₹15,000</div>
                </div>
              </div>
            </div>
          </div>

          <blockquote className="mx-auto mt-10 max-w-3xl rounded-2xl border-l-4 border-amber-500 bg-amber-50 p-6 text-center text-lg italic text-amber-900 dark:bg-amber-950/20 dark:text-amber-200">
            "Maine Company Ko ₹1.5 Lakh Revenue Generate Karke Diya Aur Mujhe ₹15,000 Reward Mila."
          </blockquote>
        </div>
      </section>

      {/* GROWTH SHARE */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-20 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium backdrop-blur">
              <TrendingUp className="h-4 w-4" /> Recurring Growth Share
            </div>
            <h2 className="text-3xl font-bold md:text-4xl">7-Day Payout Cycle</h2>
            <p className="mt-3 text-white/70">Active shops ke revenue performance par based — transparent tracking</p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {growthShareTiers.map((t, i) => (
              <div key={t.period} className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
                <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${t.color} opacity-30 blur-2xl`} />
                <div className="relative">
                  <div className="text-sm font-medium text-white/60">Phase {i + 1}</div>
                  <div className="mt-1 text-xl font-bold">{t.period}</div>
                  <div className={`mt-6 bg-gradient-to-r ${t.color} bg-clip-text text-6xl font-extrabold text-transparent`}>
                    {t.share}
                  </div>
                  <div className="mt-2 text-sm text-white/70">Partner Share</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { icon: IndianRupee, label: "7 Day Payout Cycle" },
              { icon: Target, label: "Performance Based" },
              { icon: BadgeCheck, label: "Transparent Dashboard" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <Icon className="h-5 w-5 text-amber-300" />
                <span className="font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HALL OF FAME teaser */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-10 text-center dark:border-amber-900/40 dark:from-amber-950/20 dark:via-orange-950/10 dark:to-rose-950/20">
          <Trophy className="mx-auto h-12 w-12 text-amber-600" />
          <h2 className="mt-4 text-3xl font-bold md:text-4xl">Hall of Fame</h2>
          <p className="mt-3 text-muted-foreground">
            Top District Partners ko showcase kiya jata hai — shops added, revenue generated, milestones aur success story.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-900 dark:bg-amber-900/40 dark:text-amber-100">
            <Award className="h-4 w-4" /> Coming soon
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 p-10 text-center text-white shadow-2xl md:p-14">
          <h2 className="text-3xl font-extrabold md:text-5xl">Ready To Lead Your District?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg opacity-95">
            No joining fee. No investment. Sirf aapka network aur Nexora ka platform.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/register" className="rounded-full bg-white px-8 py-3 text-base font-bold text-amber-700 shadow-lg transition hover:scale-105">
              Apply Now
            </Link>
            <Link to="/contact" className="rounded-full border-2 border-white bg-transparent px-8 py-3 text-base font-bold text-white transition hover:bg-white/10">
              Talk to Team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

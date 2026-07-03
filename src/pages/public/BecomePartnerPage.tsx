import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Activity, ArrowRight, BadgeCheck, BarChart3, BookOpen, Building2, CalendarClock, CheckCircle2, ChevronDown, Copy, CreditCard, Crown, Download, FileCheck, FileText, GraduationCap, Headphones as HeadphonesIcon, HelpCircle, IndianRupee, LayoutDashboard, Lock, MapPin, MessageCircle, PlayCircle, QrCode, Rocket, Send, Share2, ShieldCheck, Sparkles, Store, Target, TrendingUp, Trophy, UserCheck, Users, Video, Wallet, Zap, Award } from "lucide-react";
import rewardWelcomeKit from "@/assets/reward-welcome-kit.jpg";
import rewardTabletBadge from "@/assets/reward-tablet-badge.jpg";
import rewardLaptop from "@/assets/reward-laptop.jpg";
import rewardCar from "@/assets/reward-car.jpg";
import heroSalon from "@/assets/partner-hero-salon.jpg";
import imgParlour from "@/assets/partner-beauty-parlour.jpg";
import imgSpa from "@/assets/partner-spa.jpg";
import imgBarber from "@/assets/partner-barber.jpg";
import imgTattoo from "@/assets/partner-tattoo.jpg";
import imgNail from "@/assets/partner-nailart.jpg";
import imgJaipur from "@/assets/partner-jaipur.jpg";
import imgCustomer from "@/assets/partner-customer.jpg";


const formSchema = z.object({
  ownerName: z.string().trim().min(2, "Name too short").max(80),
  salonName: z.string().trim().min(2, "Required").max(120),
  phone: z.string().trim().regex(/^[+0-9 -]{7,15}$/, "Invalid phone"),
  city: z.string().trim().min(2).max(80),
  email: z.string().trim().email("Invalid email").max(255),
});

export function BecomePartnerPage() {
  const [bookings, setBookings] = useState(120);
  const [avg, setAvg] = useState(900);

  const projected = useMemo(() => {
    const monthly = bookings * avg;
    const platformFee = monthly * 0.08;
    const earnings = monthly - platformFee;
    return { monthly, platformFee, earnings };
  }, [bookings, avg]);

  const [form, setForm] = useState({ ownerName: "", salonName: "", phone: "", city: "", email: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = formSchema.safeParse(form);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((i) => { if (i.path[0]) errs[i.path[0] as string] = i.message; });
      setErrors(errs); return;
    }
    setErrors({}); setSubmitted(true);
  };

  return (
    <div className="partner-noir min-h-screen">
      {/* Hero */}
      <section className="partner-hero relative overflow-hidden py-24 md:py-32">
        <img src={heroSalon} alt="" aria-hidden width={1920} height={1280} className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-luminosity" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#08070a]/60 via-[#08070a]/70 to-[#08070a]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 md:px-6 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
              <Sparkles className="h-3 w-3" /> District Business Partner Program
            </span>
            <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
              Apne District Ki Beauty Industry Ko{" "}
              <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
                Digital Banaiye
              </span>{" "}
              Aur Us Growth Ka Hissa Baniye.
            </h1>
            <p className="mt-5 max-w-xl text-base text-white/85 md:text-lg">
              Nexora SalonOS Jaipur ki Beauty Industry ka Digital Ecosystem hai. Agar aapke paas
              salon owners ka network hai, to aap is digital transformation ka official Growth
              Partner ban sakte hain.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#join" className="bg-gradient-cta text-primary-foreground inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-black shadow-[var(--shadow-glow)] transition hover:scale-[1.03]">
                Join Free <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#opportunity" className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-black text-white backdrop-blur transition hover:bg-white/20">
                <PlayCircle className="h-4 w-4" /> Watch Opportunity
              </a>
              <a href="#talk" className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-transparent px-6 py-3.5 text-sm font-black text-white transition hover:bg-white/10">
                <HeadphonesIcon className="h-4 w-4" /> Talk to Team
              </a>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-white/70">
              <span className="inline-flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-amber-300" /> No joining fee</span>
              <span className="inline-flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-amber-300" /> 24h KYC</span>
              <span className="inline-flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-amber-300" /> Weekly payouts</span>
            </div>
          </div>

          <div className="border-white/20 bg-white/10 rounded-[24px] border p-6 backdrop-blur-lg text-white">
            <h3 className="flex items-center gap-2 text-lg font-bold"><IndianRupee className="h-5 w-5" /> Earnings calculator</h3>
            <div className="mt-5 space-y-5">
              <div>
                <div className="flex justify-between text-sm font-semibold"><span>Monthly bookings</span><span>{bookings}</span></div>
                <input type="range" min={10} max={1000} step={10} value={bookings} onChange={(e) => setBookings(+e.target.value)} className="mt-2 w-full accent-white" />
              </div>
              <div>
                <div className="flex justify-between text-sm font-semibold"><span>Average ticket size</span><span>₹{avg}</span></div>
                <input type="range" min={300} max={5000} step={100} value={avg} onChange={(e) => setAvg(+e.target.value)} className="mt-2 w-full accent-white" />
              </div>
            </div>
            <div className="border-white/20 mt-6 grid grid-cols-3 gap-2 border-t pt-4 text-center sm:gap-3">
              <div><div className="text-[10px] text-white/70 sm:text-xs">Monthly</div><div className="text-base font-black sm:text-lg">₹{(projected.monthly/1000).toFixed(0)}k</div></div>
              <div><div className="text-[10px] text-white/70 sm:text-xs">Platform fee</div><div className="text-base font-black sm:text-lg">₹{(projected.platformFee/1000).toFixed(1)}k</div></div>
              <div><div className="text-[10px] text-white/70 sm:text-xs">Your earnings</div><div className="text-xl font-black text-amber-300 sm:text-2xl">₹{(projected.earnings/1000).toFixed(0)}k</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 — Why You? */}
      <section className="mx-auto max-w-6xl px-4 pt-20 md:px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            <UserCheck className="h-3 w-3" /> Why You?
          </span>
          <h2 className="text-heading mt-4 text-3xl font-black tracking-tight md:text-4xl">
            Aapke paas already sab kuch hai
          </h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-base">
            Naya network banane ki zarurat nahi. Existing network ko digital growth me convert karna hai.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Users, t: "Existing Salon Network", b: "Aap already salon owners ke saath baat karte hain." },
            { icon: ShieldCheck, t: "Existing Trust", b: "Shop owners aap par bharosa karte hain — trust already built hai." },
            { icon: BadgeCheck, t: "Existing Relationships", b: "Regular visits, WhatsApp contact, personal rapport." },
            { icon: Target, t: "Existing Market Knowledge", b: "Aap apne district ki beauty industry ko andar se jaante hain." },
          ].map((w) => (
            <div key={w.t} className="border-border bg-card rounded-[var(--radius-card)] border p-6 shadow-[var(--shadow-card)]">
              <div className="bg-primary/10 text-primary grid h-11 w-11 place-items-center rounded-xl">
                <w.icon className="h-5 w-5" />
              </div>
              <h3 className="text-heading mt-4 font-bold">{w.t}</h3>
              <p className="text-muted-foreground mt-2 text-sm">{w.b}</p>
            </div>
          ))}
        </div>
        <blockquote className="border-primary bg-primary/5 text-heading mt-8 rounded-[var(--radius-card)] border-l-4 p-5 text-center text-base font-bold italic md:text-lg">
          "Naya Network Banane Ki Zarurat Nahi. Existing Network Ko Digital Growth Me Convert Karna Hai."
        </blockquote>
      </section>


      {/* Section 3 — Nexora Ecosystem (animated flow) */}
      <section className="mx-auto max-w-6xl px-4 pt-20 md:px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            <Sparkles className="h-3 w-3" /> The Nexora Ecosystem
          </span>
          <h2 className="text-heading mx-auto mt-4 max-w-3xl text-3xl font-black leading-tight tracking-tight md:text-4xl">
            "Nexora Sirf Salon Software Nahi Hai. Nexora Beauty Industry Ka Complete Digital Ecosystem Hai."
          </h2>
        </div>

        <div className="mt-12 overflow-hidden rounded-[var(--radius-card-lg)] border border-border/60 bg-gradient-to-br from-[#0A2540] via-[#1a1060] to-[#635BFF] p-6 shadow-[var(--shadow-card)] md:p-10">
          <div className="grid gap-3 md:grid-cols-4 lg:grid-cols-8">
            {[
              { icon: Users, title: "Customers" },
              { icon: Store, title: "Salon Owners" },
              { icon: UserCheck, title: "Beauty Staff" },
              { icon: GraduationCap, title: "Beauty Academies" },
              { icon: BadgeCheck, title: "Brands" },
              { icon: Building2, title: "Distributors" },
              { icon: Trophy, title: "District Partners" },
              { icon: Rocket, title: "Nexora Platform" },
            ].map((n, i) => (
              <div
                key={n.title}
                className="group relative rounded-[var(--radius-card)] border border-white/15 bg-white/10 p-4 text-center text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20 animate-fade-in"
                style={{ animationDelay: `${i * 90}ms`, animationFillMode: "both" }}
              >
                <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-white/15 transition group-hover:bg-amber-300 group-hover:text-slate-900">
                  <n.icon className="h-5 w-5" />
                </div>
                <div className="mt-3 text-[11px] font-black uppercase tracking-wider text-white/70">
                  Node {i + 1}
                </div>
                <div className="mt-1 text-sm font-black">{n.title}</div>
                {i < 7 && (
                  <ArrowRight
                    className="text-amber-300 absolute -right-2 top-1/2 hidden h-4 w-4 -translate-y-1/2 lg:block animate-pulse"
                    aria-hidden
                  />
                )}
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm font-semibold text-white/85 md:text-base">
            Ek connected ecosystem — jahan har layer ek doosre se juda hua hai.
          </p>
        </div>
      </section>

      {/* Section 4 — Who Can Join */}
      <section className="mx-auto max-w-6xl px-4 pt-20 md:px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            <UserCheck className="h-3 w-3" /> Who Can Join
          </span>
          <h2 className="text-heading mt-4 text-3xl font-black tracking-tight md:text-4xl">
            Eligible partner categories
          </h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-base">
            If you already work with salon owners in any of these roles — you're eligible.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Store, t: "Hair Salon Product Salesman" },
            { icon: Sparkles, t: "Cosmetic Sales Executive" },
            { icon: Building2, t: "Beauty Product Distributor" },
            { icon: LayoutDashboard, t: "Salon Furniture Dealer" },
            { icon: HeadphonesIcon, t: "Spa Product Representative" },
            { icon: Target, t: "Tattoo Supply Distributor" },
            { icon: Award, t: "Nail Art Supplier" },
            { icon: GraduationCap, t: "Beauty Consultant" },
          ].map((p, i) => (
            <div
              key={p.t}
              className="border-border bg-card group rounded-[var(--radius-card)] border p-5 text-center shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:border-primary/40 animate-fade-in"
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
            >
              <div className="bg-primary/10 text-primary mx-auto grid h-12 w-12 place-items-center rounded-xl transition group-hover:bg-gradient-cta group-hover:text-primary-foreground">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="text-heading mt-4 text-sm font-black leading-snug">{p.t}</h3>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-[var(--radius-card)] border border-primary/30 bg-primary/5 p-5 text-center text-sm font-semibold text-heading">
          Don't see your exact title? If you talk to salon owners every week — you qualify.
        </div>
      </section>

      {/* Section 5 — Partner Role */}
      <section className="mx-auto max-w-6xl px-4 pt-20 md:px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            <Target className="h-3 w-3" /> Partner Role
          </span>
          <h2 className="text-heading mt-4 text-3xl font-black tracking-tight md:text-4xl">
            What a District Partner actually does
          </h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-base">
            A clear, repeatable playbook — no cold calls, no guesswork.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Users, t: "Connect with salon owners", d: "Tap your existing network." },
            { icon: Sparkles, t: "Nexora introduction", d: "Share the opportunity in 5 min." },
            { icon: PlayCircle, t: "Product demo", d: "Show the live salon dashboard." },
            { icon: FileCheck, t: "Registration help", d: "Assist owner sign-up + KYC." },
            { icon: Rocket, t: "Website activation", d: "Go-live their white-label site." },
            { icon: Zap, t: "QR setup", d: "Deploy booking + payment QR." },
            { icon: CalendarClock, t: "Follow-up", d: "Weekly check-ins, drive adoption." },
            { icon: HeadphonesIcon, t: "Relationship management", d: "Long-term account owner." },
          ].map((p, i) => (
            <div
              key={p.t}
              className="border-border bg-card rounded-[var(--radius-card)] border p-5 shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:border-primary/40 animate-fade-in"
              style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}
            >
              <div className="bg-primary/10 text-primary grid h-11 w-11 place-items-center rounded-xl">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="text-heading mt-4 text-sm font-black leading-snug">{p.t}</h3>
              <p className="text-muted-foreground mt-1 text-xs">{p.d}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-[var(--radius-card)] border border-border bg-muted/40 p-5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Supported salon categories</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Hair Salons", "Barber Shops", "Beauty Parlours", "Spa", "Tattoo", "Massage", "Nail Art"].map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-semibold text-heading">
                <CheckCircle2 className="h-3 w-3 text-primary" /> {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6 — Salon Benefits */}
      <section className="mx-auto max-w-6xl px-4 pt-20 md:px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            <Store className="h-3 w-3" /> What Salons Get
          </span>
          <h2 className="text-heading mt-4 text-3xl font-black tracking-tight md:text-4xl">
            A complete digital upgrade — free to start
          </h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-base">
            Every salon you onboard receives the full Nexora stack. This is your pitch.
          </p>
        </div>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: LayoutDashboard, t: "Free white-label website" },
            { icon: CalendarClock, t: "Online booking system" },
            { icon: Users, t: "Customer CRM" },
            { icon: UserCheck, t: "Staff management" },
            { icon: Zap, t: "WhatsApp automation" },
            { icon: BadgeCheck, t: "Smart reminders" },
            { icon: IndianRupee, t: "QR payment ecosystem" },
            { icon: Award, t: "Loyalty program & rewards" },
            { icon: Sparkles, t: "AI marketing tools" },
            { icon: TrendingUp, t: "Repeat customer engine" },
            { icon: Activity, t: "Analytics dashboard" },
            { icon: Rocket, t: "Complete digital presence" },
          ].map((b, i) => (
            <div
              key={b.t}
              className="border-border bg-card flex items-center gap-3 rounded-[var(--radius-card)] border p-4 shadow-[var(--shadow-card)] animate-fade-in"
              style={{ animationDelay: `${i * 40}ms`, animationFillMode: "both" }}
            >
              <div className="bg-primary/10 text-primary grid h-10 w-10 shrink-0 place-items-center rounded-lg">
                <b.icon className="h-5 w-5" />
              </div>
              <span className="text-heading text-sm font-bold">{b.t}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Section 7 — Customer Benefits */}
      <section className="mx-auto max-w-6xl px-4 pt-20 md:px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            <Users className="h-3 w-3" /> What Customers Get
          </span>
          <h2 className="text-heading mt-4 text-3xl font-black tracking-tight md:text-4xl">
            Why customers choose Nexora salons
          </h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-base">
            Demand comes from customers. Here's what pulls them in.
          </p>
        </div>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { icon: Target, t: "Nearby search" },
            { icon: CalendarClock, t: "Online booking" },
            { icon: Zap, t: "No waiting" },
            { icon: UserCheck, t: "Favourite staff" },
            { icon: BadgeCheck, t: "Smart reminders" },
            { icon: Award, t: "Reward points" },
            { icon: Crown, t: "Membership" },
            { icon: Users, t: "Referral program" },
            { icon: ShieldCheck, t: "Verified salons" },
            { icon: Sparkles, t: "Digital beauty experience" },
          ].map((b, i) => (
            <div
              key={b.t}
              className="border-border bg-card rounded-[var(--radius-card)] border p-4 text-center shadow-[var(--shadow-card)] animate-fade-in"
              style={{ animationDelay: `${i * 40}ms`, animationFillMode: "both" }}
            >
              <b.icon className="text-primary mx-auto h-5 w-5" />
              <div className="text-heading mt-2 text-xs font-bold leading-snug">{b.t}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 8 — Partner Benefits */}
      <section className="mx-auto max-w-6xl px-4 pt-20 md:px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            <Crown className="h-3 w-3" /> Your Benefits
          </span>
          <h2 className="text-heading mt-4 text-3xl font-black tracking-tight md:text-4xl">
            What you get as a District Business Partner
          </h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-base">
            Recognition, tools, and long-term growth — not just commissions.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: BadgeCheck, t: "Official Partner Status", d: "District Business Partner ID + verified badge." },
            { icon: Crown, t: "Featured profile", d: "Public profile on Nexora directory." },
            { icon: TrendingUp, t: "Sponsored visibility", d: "Boosted reach in your district." },
            { icon: Rocket, t: "Business promotion", d: "Co-branded campaigns and creatives." },
            { icon: Sparkles, t: "AI marketing tools", d: "Ready-made assets, scripts, reels." },
            { icon: Users, t: "Referral system", d: "Earn from every salon and sub-partner." },
            { icon: Trophy, t: "Leaderboard", d: "District, state and national rankings." },
            { icon: Award, t: "Recognition program", d: "Awards, rewards, feature stories." },
            { icon: Activity, t: "Long-term growth", d: "Recurring revenue as your salons grow." },
          ].map((b, i) => (
            <div
              key={b.t}
              className="border-border bg-card rounded-[var(--radius-card)] border p-5 shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:border-primary/40 animate-fade-in"
              style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}
            >
              <div className="bg-gradient-cta text-primary-foreground grid h-11 w-11 place-items-center rounded-xl">
                <b.icon className="h-5 w-5" />
              </div>
              <h3 className="text-heading mt-4 text-sm font-black leading-snug">{b.t}</h3>
              <p className="text-muted-foreground mt-1 text-xs">{b.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 9 — How Partners Earn (Interactive Earnings Model) */}
      <section className="mx-auto max-w-6xl px-4 pt-20 md:px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            <IndianRupee className="h-3 w-3" /> How Partners Earn
          </span>
          <h2 className="text-heading mt-4 text-3xl font-black tracking-tight md:text-4xl">
            Interactive Earnings Model
          </h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-base">
            Two clear income streams. Fully transparent, admin-configurable, and tied to real salon activity.
          </p>
        </div>

        {/* A. Activation Reward */}
        <div className="mt-10 border-border bg-card rounded-[var(--radius-card)] border p-6 shadow-[var(--shadow-card)] md:p-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary grid h-11 w-11 place-items-center rounded-xl">
              <Rocket className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-primary">A · Activation Reward</div>
              <h3 className="text-heading text-lg font-black md:text-xl">One-time reward per activated salon</h3>
            </div>
          </div>

          {/* Flow */}
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[
              { t: "Salon Registration", d: "Partner onboards a new salon on Nexora", icon: FileCheck },
              { t: "15 Days Active Revenue", d: "Salon generates verified revenue for 15 days", icon: Activity },
              { t: "Reward Eligible", d: "Activation reward auto-credited to partner wallet", icon: BadgeCheck },
            ].map((s, i) => (
              <div key={s.t} className="relative rounded-[var(--radius-card)] border border-border/60 bg-muted/30 p-4">
                <div className="flex items-center gap-2">
                  <s.icon className="text-primary h-4 w-4" />
                  <div className="text-heading text-sm font-black">{s.t}</div>
                </div>
                <div className="text-muted-foreground mt-1 text-xs">{s.d}</div>
                {i < 2 && (
                  <ArrowRight className="text-muted-foreground/40 absolute -right-2 top-1/2 hidden h-4 w-4 -translate-y-1/2 md:block" />
                )}
              </div>
            ))}
          </div>

          {/* Two examples */}
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {/* Single salon */}
            <div className="rounded-[var(--radius-card)] border border-border/60 bg-muted/20 p-5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Illustrative example · Single salon
              </div>
              <div className="mt-3 space-y-2 text-sm">
                {[
                  { k: "Salon Revenue", v: "₹15,000" },
                  { k: "Nexora Revenue (10%)", v: "₹1,500" },
                  { k: "Partner Activation Reward (10% of Nexora revenue)", v: "₹150" },
                ].map((r, idx) => (
                  <div
                    key={r.k}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 ${idx === 2 ? "bg-primary/10" : "bg-muted/50"}`}
                  >
                    <span className="text-muted-foreground text-xs font-semibold">{r.k}</span>
                    <span className={`text-sm font-black ${idx === 2 ? "text-primary" : "text-heading"}`}>{r.v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scale */}
            <div className="rounded-[var(--radius-card)] border border-primary/30 bg-gradient-to-br from-[#0A2540] via-[#1a1060] to-[#635BFF] p-5 text-white">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                Illustrative example · Scale (100 active shops)
              </div>
              <div className="mt-3 space-y-2 text-sm">
                {[
                  { k: "Revenue Generated", v: "₹15,00,000" },
                  { k: "Nexora Revenue", v: "₹1,50,000" },
                  { k: "Partner Activation Rewards", v: "₹15,000" },
                ].map((r, idx) => (
                  <div
                    key={r.k}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 ${idx === 2 ? "bg-white/20" : "bg-white/10"}`}
                  >
                    <span className="text-xs font-semibold text-white/80">{r.k}</span>
                    <span className={`text-sm font-black ${idx === 2 ? "text-amber-300" : "text-white"}`}>{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-300/40 bg-amber-50/60 p-3 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Illustrative figures only. Actual percentages and amounts load dynamically from Admin-configured backend values — nothing is hardcoded in the frontend or business logic.
            </span>
          </div>
        </div>

        {/* B. Weekly Growth Share */}
        <div className="mt-6 border-border bg-card rounded-[var(--radius-card)] border p-6 shadow-[var(--shadow-card)] md:p-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary grid h-11 w-11 place-items-center rounded-xl">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-primary">B · Weekly Growth Share</div>
              <h3 className="text-heading text-lg font-black md:text-xl">Recurring share, paid every 7 days</h3>
            </div>
          </div>

          <p className="text-muted-foreground mt-3 text-sm">
            Earn a share of every <span className="text-heading font-bold">active</span> salon's platform revenue on a fixed 7-day cycle. Only active salons qualify — inactive salons generate no partner share.
          </p>

          {/* Commission tiers */}
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[
              { p: "First 6 Months", r: "10%", note: "Highest share during ramp-up" },
              { p: "Month 7 – 12", r: "5%", note: "Sustained recurring income" },
              { p: "After 12 Months", r: "2%", note: "Long-tail passive earnings" },
            ].map((t) => (
              <div key={t.p} className="rounded-[var(--radius-card)] border border-border/60 bg-muted/30 p-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t.p}</div>
                <div className="text-heading mt-2 text-3xl font-black">{t.r}</div>
                <div className="text-muted-foreground mt-1 text-xs">{t.note}</div>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="flex items-start gap-2 rounded-lg bg-muted/40 p-3 text-xs">
              <CalendarClock className="text-primary mt-0.5 h-4 w-4 shrink-0" />
              <span className="text-muted-foreground">
                <span className="text-heading font-bold">Payout cycle:</span> Every 7 days, auto-credited to your partner wallet.
              </span>
            </div>
            <div className="flex items-start gap-2 rounded-lg bg-muted/40 p-3 text-xs">
              <Activity className="text-primary mt-0.5 h-4 w-4 shrink-0" />
              <span className="text-muted-foreground">
                <span className="text-heading font-bold">Business rule:</span> Only active salons qualify. Inactive salons generate no partner share.
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-300/40 bg-amber-50/60 p-3 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Example / default config shown. All commission percentages are Admin-configurable — the frontend reads live values from backend settings, never hardcoded.
            </span>
          </div>
        </div>
      </section>

      {/* Section 10 — Milestone Rewards */}
      <section className="mx-auto max-w-6xl px-4 pt-20 md:px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            <Trophy className="h-3 w-3" /> Milestone Rewards
          </span>
          <h2 className="text-heading mt-4 text-3xl font-black tracking-tight md:text-4xl">
            Every milestone unlocks something bigger
          </h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-base">
            Tangible rewards, status upgrades, and long-term recognition — the more salons you activate, the more you unlock.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative mt-12">
          {/* Track */}
          <div className="pointer-events-none absolute left-0 right-0 top-6 hidden h-1 rounded-full bg-gradient-to-r from-primary/20 via-primary/50 to-primary md:block" />

          <div className="grid gap-6 md:grid-cols-4">
            {[
              {
                count: "25",
                label: "Shops",
                tier: "Recognition",
                icon: Award,
                rewards: ["Welcome Kit", "Official T-Shirt"],
                accent: "from-slate-500/10 to-slate-500/5",
                iconBg: "bg-slate-500/15 text-slate-600 dark:text-slate-300",
              },
              {
                count: "100",
                label: "Shops",
                tier: "Growth Builder",
                icon: BadgeCheck,
                rewards: ["Nexora Tablet", "Growth Builder Badge"],
                accent: "from-primary/15 to-primary/5",
                iconBg: "bg-primary/15 text-primary",
              },
              {
                count: "500",
                label: "Shops",
                tier: "Platinum Partner",
                icon: Crown,
                rewards: ["Branded Laptop", "Platinum Partner Status"],
                accent: "from-violet-500/15 to-violet-500/5",
                iconBg: "bg-violet-500/15 text-violet-600 dark:text-violet-300",
              },
              {
                count: "1000",
                label: "Shops",
                tier: "Leadership Circle",
                icon: Trophy,
                rewards: [
                  "District Leader Status",
                  "Leadership Circle",
                  "Hall of Fame",
                  "Car Reward Program (as per company policy)",
                ],
                accent: "from-amber-500/20 to-amber-500/5",
                iconBg: "bg-amber-500/20 text-amber-600 dark:text-amber-300",
                elite: true,
              },
            ].map((m, i) => (
              <div key={m.count} className="relative">
                {/* Node dot on the track (desktop) */}
                <div className="absolute left-1/2 top-4 hidden -translate-x-1/2 md:block">
                  <div className={`grid h-5 w-5 place-items-center rounded-full border-2 border-background shadow-md ${m.elite ? "bg-amber-500" : "bg-primary"}`}>
                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                  </div>
                </div>

                <div
                  className={`group relative mt-0 overflow-hidden rounded-[var(--radius-card)] border p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:shadow-lg md:mt-14 ${
                    m.elite
                      ? "border-amber-400/50 bg-gradient-to-br from-[#1a1006] via-[#3a2410] to-[#0A2540] text-white"
                      : "border-border bg-card"
                  }`}
                >
                  {/* Ambient glow */}
                  <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${m.accent} opacity-60`} />

                  <div className="relative">
                    <div className="flex items-center gap-3">
                      <div className={`grid h-11 w-11 place-items-center rounded-xl ${m.elite ? "bg-white/15 text-amber-300" : m.iconBg}`}>
                        <m.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className={`text-[10px] font-bold uppercase tracking-wider ${m.elite ? "text-amber-300" : "text-primary"}`}>
                          Tier {i + 1} · {m.tier}
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-3xl font-black ${m.elite ? "text-white" : "text-heading"}`}>{m.count}</span>
                          <span className={`text-xs font-bold uppercase tracking-wider ${m.elite ? "text-white/70" : "text-muted-foreground"}`}>
                            {m.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      {m.rewards.map((r) => (
                        <div
                          key={r}
                          className={`flex items-start gap-2 rounded-lg px-2.5 py-2 text-xs ${
                            m.elite ? "bg-white/10" : "bg-muted/50"
                          }`}
                        >
                          <BadgeCheck className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${m.elite ? "text-amber-300" : "text-primary"}`} />
                          <span className={`font-semibold ${m.elite ? "text-white" : "text-heading"}`}>{r}</span>
                        </div>
                      ))}
                    </div>

                    {m.elite && (
                      <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-300/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                        <Crown className="h-3 w-3" /> Elite tier
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-start justify-center gap-2 rounded-lg border border-amber-300/40 bg-amber-50/60 p-3 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Illustrative rewards shown. All milestone thresholds and rewards load dynamically from Admin-configured backend values — the Car Reward Program is subject to company policy.
          </span>
        </div>
      </section>

      {/* Section 11 — Dashboard Preview */}
      <section className="mx-auto max-w-6xl px-4 pt-20 md:px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            <LayoutDashboard className="h-3 w-3" /> Dashboard Preview
          </span>
          <h2 className="text-heading mt-4 text-3xl font-black tracking-tight md:text-4xl">
            Your entire partnership — in one screen
          </h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-base">
            A live preview of the Partner Dashboard. Signed-in partners are taken to their real dashboard — this is only the marketing snapshot.
          </p>
        </div>

        <div className="mt-10 rounded-[var(--radius-card)] border border-border bg-gradient-to-br from-[#0A2540] via-[#1a1060] to-[#635BFF] p-6 text-white shadow-[var(--shadow-card)] md:p-8">
          {/* Metric cards */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Store, t: "Shops Added", v: "128", d: "+6 this week" },
              { icon: CheckCircle2, t: "Active Shops", v: "94", d: "73% activation rate" },
              { icon: UserCheck, t: "Leads", v: "312", d: "42 in demo stage" },
              { icon: IndianRupee, t: "Revenue Generated", v: "₹18.4L", d: "By your onboarded salons" },
              { icon: Rocket, t: "Activation Rewards", v: "₹14,100", d: "Lifetime unlocked" },
              { icon: TrendingUp, t: "Weekly Growth Share", v: "₹4,820", d: "This week's cycle" },
              { icon: CalendarClock, t: "Pending Earnings", v: "₹2,150", d: "Clears next Monday" },
              { icon: Wallet, t: "Wallet", v: "₹16,870", d: "Available balance" },
              { icon: Trophy, t: "Lifetime Earnings", v: "₹1,42,320", d: "Since Day 1" },
            ].map((c) => (
              <div key={c.t} className="rounded-[var(--radius-card)] bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
                  <c.icon className="h-4 w-4" /> {c.t}
                </div>
                <div className="mt-2 text-2xl font-black">{c.v}</div>
                <div className="mt-0.5 text-[11px] text-white/70">{c.d}</div>
              </div>
            ))}
          </div>

          {/* Chart tiles */}
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              { icon: BarChart3, t: "Monthly Performance", d: "Shops onboarded per month" },
              { icon: TrendingUp, t: "Growth Trend", d: "Revenue trend across salons" },
              { icon: Trophy, t: "District Rank", d: "Your position in the leaderboard" },
            ].map((c) => (
              <div key={c.t} className="rounded-[var(--radius-card)] bg-white/10 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <c.icon className="h-4 w-4" /> {c.t}
                </div>
                {/* Sparkline placeholder */}
                <svg viewBox="0 0 200 60" className="mt-3 h-14 w-full">
                  <defs>
                    <linearGradient id={`g-${c.t}`} x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,45 L25,38 L50,42 L75,28 L100,32 L125,20 L150,24 L175,12 L200,16 L200,60 L0,60 Z" fill={`url(#g-${c.t})`} />
                  <path d="M0,45 L25,38 L50,42 L75,28 L100,32 L125,20 L150,24 L175,12 L200,16" fill="none" stroke="#fbbf24" strokeWidth="2" />
                </svg>
                <div className="mt-1 text-[11px] text-white/70">{c.d}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] bg-white/5 p-4">
            <div className="flex items-center gap-2 text-xs text-white/80">
              <ShieldCheck className="h-4 w-4 text-amber-300" />
              Signed-in partners are auto-redirected to their real live dashboard.
            </div>
            <a href="#join" className="inline-flex items-center gap-1.5 rounded-full bg-amber-300 px-4 py-2 text-xs font-black text-[#0A2540]">
              Open my dashboard <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* Section 12 — Profile Page */}
      <section className="mx-auto max-w-6xl px-4 pt-20 md:px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            <UserCheck className="h-3 w-3" /> Partner Profile
          </span>
          <h2 className="text-heading mt-4 text-3xl font-black tracking-tight md:text-4xl">
            Your official partner identity
          </h2>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {/* Identity card */}
          <div className="border-border bg-card rounded-[var(--radius-card)] border p-6 shadow-[var(--shadow-card)] lg:col-span-1">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-cta text-primary-foreground grid h-16 w-16 place-items-center rounded-full text-xl font-black shadow-[var(--shadow-glow)]">
                RS
              </div>
              <div>
                <div className="text-heading text-lg font-black">Ravi Sharma</div>
                <div className="text-muted-foreground text-xs font-semibold">Partner ID · NX-DBP-0428</div>
                <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-success">
                  <BadgeCheck className="h-3 w-3" /> Verified
                </div>
              </div>
            </div>
            <div className="mt-5 space-y-2 text-xs">
              <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                <span className="text-muted-foreground font-semibold">KYC Status</span>
                <span className="text-success font-black">Approved</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                <span className="text-muted-foreground font-semibold">Territory</span>
                <span className="text-heading font-black">Jaipur · District</span>
              </div>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:col-span-2">
            {[
              { icon: CreditCard, t: "Bank Details", d: "HDFC •••• 4291", s: "Verified" },
              { icon: Zap, t: "UPI", d: "ravi@upi", s: "Primary" },
              { icon: FileText, t: "PAN", d: "•••• PN 3421", s: "Verified" },
              { icon: ShieldCheck, t: "Aadhaar", d: "•••• 8842", s: "eKYC done" },
              { icon: Lock, t: "Security", d: "2FA enabled", s: "Active" },
              { icon: Sparkles, t: "Settings", d: "Notifications · Language · Theme", s: "Manage" },
            ].map((c) => (
              <div key={c.t} className="border-border bg-card rounded-[var(--radius-card)] border p-4">
                <div className="flex items-center gap-2 text-primary text-[11px] font-bold uppercase tracking-wider">
                  <c.icon className="h-4 w-4" /> {c.t}
                </div>
                <div className="text-heading mt-2 text-sm font-black">{c.d}</div>
                <div className="text-muted-foreground mt-0.5 text-xs">{c.s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 13 — Referral Center */}
      <section className="mx-auto max-w-6xl px-4 pt-20 md:px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            <Share2 className="h-3 w-3" /> Referral Center
          </span>
          <h2 className="text-heading mt-4 text-3xl font-black tracking-tight md:text-4xl">
            One link. Every channel. Full analytics.
          </h2>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {/* Link + QR */}
          <div className="border-border bg-card rounded-[var(--radius-card)] border p-6 shadow-[var(--shadow-card)] md:col-span-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-primary">Your referral link</div>
            <div className="mt-3 flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-2">
              <code className="text-heading flex-1 truncate text-sm font-semibold">nexora.app/join/NX-DBP-0428</code>
              <button className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">
                <Copy className="h-3.5 w-3.5" /> Copy
              </button>
              <button className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">
                <Download className="h-3.5 w-3.5" /> QR
              </button>
            </div>
            <div className="mt-5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Share to</div>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {["WhatsApp", "Facebook", "Instagram", "Telegram", "LinkedIn", "X"].map((n) => (
                <button key={n} className="flex flex-col items-center gap-1 rounded-[var(--radius-card)] border border-border/60 bg-muted/30 p-3 text-xs font-bold text-heading hover:border-primary/40">
                  <Share2 className="h-4 w-4 text-primary" />
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Analytics */}
          <div className="border-border bg-card rounded-[var(--radius-card)] border p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-2 text-primary text-[11px] font-bold uppercase tracking-wider">
              <BarChart3 className="h-3 w-3" /> Referral analytics
            </div>
            <div className="mt-4 space-y-3">
              {[
                { t: "Clicks", v: "1,842", i: Send },
                { t: "Registrations", v: "146", i: UserCheck },
                { t: "Conversions", v: "84", i: BadgeCheck },
              ].map((s) => (
                <div key={s.t} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-muted-foreground text-xs font-semibold">
                    <s.i className="h-4 w-4 text-primary" /> {s.t}
                  </span>
                  <span className="text-heading text-lg font-black">{s.v}</span>
                </div>
              ))}
            </div>
            <div className="text-muted-foreground mt-3 flex items-center gap-1 text-[10px]">
              <QrCode className="h-3 w-3 text-primary" /> Also available as a downloadable QR poster.
            </div>
          </div>
        </div>
      </section>

      {/* Section 14 — AI Marketing Center */}
      <section className="mx-auto max-w-6xl px-4 pt-20 md:px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            <Sparkles className="h-3 w-3" /> AI Marketing Center
          </span>
          <h2 className="text-heading mt-4 text-3xl font-black tracking-tight md:text-4xl">
            Generate every marketing asset in one click
          </h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-base">
            Custom-branded posters, videos, reels, WhatsApp campaigns and sales scripts — powered by Nexora AI.
          </p>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: FileText, t: "Posters", d: "Salon-branded posters in seconds" },
            { icon: Video, t: "Videos", d: "Short promo videos, ready to post" },
            { icon: PlayCircle, t: "Reels", d: "Vertical reels for Instagram" },
            { icon: Sparkles, t: "Social Posts", d: "Captions + creatives" },
            { icon: MessageCircle, t: "WhatsApp Campaigns", d: "Broadcast-ready templates" },
            { icon: BookOpen, t: "Sales Scripts", d: "Salon pitch that converts" },
            { icon: Send, t: "Follow-up Messages", d: "Sequenced re-engagement" },
            { icon: Zap, t: "Instant Localization", d: "Hindi + English + regional" },
          ].map((c) => (
            <div key={c.t} className="border-border bg-card group rounded-[var(--radius-card)] border p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="bg-gradient-cta text-primary-foreground grid h-10 w-10 place-items-center rounded-xl shadow-[var(--shadow-glow)]">
                <c.icon className="h-5 w-5" />
              </div>
              <div className="text-heading mt-3 text-sm font-black">{c.t}</div>
              <div className="text-muted-foreground mt-1 text-xs">{c.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 15 — Lead Management */}
      <section className="mx-auto max-w-6xl px-4 pt-20 md:px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            <UserCheck className="h-3 w-3" /> Lead Management
          </span>
          <h2 className="text-heading mt-4 text-3xl font-black tracking-tight md:text-4xl">
            Track every salon from first call to activation
          </h2>
        </div>

        <div className="mt-10 overflow-x-auto">
          <div className="flex min-w-max items-stretch gap-3">
            {[
              { t: "Add Lead", d: "Capture salon details", c: "12", tone: "bg-muted/40 border-border" },
              { t: "Lead Status", d: "New / Contacted", c: "8", tone: "bg-primary/10 border-primary/30" },
              { t: "Demo Scheduled", d: "Live product demo booked", c: "5", tone: "bg-primary/15 border-primary/40" },
              { t: "Follow-up", d: "Nurture & re-engage", c: "6", tone: "bg-amber-500/10 border-amber-500/30" },
              { t: "Converted", d: "Onboarded to Nexora", c: "9", tone: "bg-success/10 border-success/30" },
              { t: "Lost Lead", d: "Archived with reason", c: "3", tone: "bg-danger/10 border-danger/30" },
            ].map((s, i) => (
              <div key={s.t} className="relative">
                <div className={`w-60 rounded-[var(--radius-card)] border p-4 shadow-sm ${s.tone}`}>
                  <div className="flex items-center justify-between">
                    <div className="text-heading text-sm font-black">{s.t}</div>
                    <span className="rounded-full bg-background px-2 py-0.5 text-[10px] font-black text-primary">{s.c}</span>
                  </div>
                  <div className="text-muted-foreground mt-1 text-xs">{s.d}</div>
                  <div className="mt-3 space-y-1.5">
                    {[1, 2].map((n) => (
                      <div key={n} className="rounded-md bg-background/70 px-2 py-1.5 text-[11px] text-muted-foreground">
                        Salon #{i}-{n} · {["Jaipur", "Kota", "Ajmer", "Alwar"][n % 4]}
                      </div>
                    ))}
                  </div>
                </div>
                {i < 5 && (
                  <ArrowRight className="text-muted-foreground/40 absolute -right-4 top-1/2 hidden h-4 w-4 -translate-y-1/2 md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 16 — Training Center */}
      <section className="mx-auto max-w-6xl px-4 pt-20 md:px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            <GraduationCap className="h-3 w-3" /> Training Center
          </span>
          <h2 className="text-heading mt-4 text-3xl font-black tracking-tight md:text-4xl">
            Learn, certify, level up
          </h2>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {/* Modules */}
          <div className="border-border bg-card rounded-[var(--radius-card)] border p-6 shadow-[var(--shadow-card)]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-primary">Modules</div>
            <div className="mt-4 space-y-2">
              {[
                { t: "Nexora Basics", d: "Platform, ecosystem, positioning", icon: Sparkles },
                { t: "Product Knowledge", d: "Every feature, every use-case", icon: BookOpen },
                { t: "Demo Process", d: "Live demo playbook", icon: PlayCircle },
                { t: "Sales Training", d: "Convert leads confidently", icon: TrendingUp },
                { t: "Objection Handling", d: "Turn 'no' into 'yes'", icon: MessageCircle },
                { t: "Leadership", d: "Grow into a district head", icon: Crown },
              ].map((m) => (
                <div key={m.t} className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                  <div className="bg-primary/10 text-primary grid h-8 w-8 place-items-center rounded-lg">
                    <m.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-heading text-xs font-black">{m.t}</div>
                    <div className="text-muted-foreground text-[11px]">{m.d}</div>
                  </div>
                  <PlayCircle className="text-primary h-4 w-4" />
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="rounded-[var(--radius-card)] border border-primary/30 bg-gradient-to-br from-[#0A2540] via-[#1a1060] to-[#635BFF] p-6 text-white shadow-[var(--shadow-card)]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300">Certification Tiers</div>
            <div className="mt-4 space-y-2.5">
              {[
                { t: "Bronze", d: "Complete Basics + Demo", color: "bg-amber-700/30 text-amber-200" },
                { t: "Silver", d: "Pass Sales Training", color: "bg-slate-400/30 text-slate-100" },
                { t: "Gold", d: "Clear Objection Handling", color: "bg-yellow-400/30 text-yellow-100" },
                { t: "Platinum", d: "Leadership module cleared", color: "bg-white/25 text-white" },
                { t: "Diamond", d: "Master trainer status", color: "bg-cyan-300/30 text-cyan-100" },
              ].map((c) => (
                <div key={c.t} className="flex items-center justify-between rounded-lg bg-white/10 p-3">
                  <div className="flex items-center gap-3">
                    <div className={`grid h-9 w-9 place-items-center rounded-full text-[10px] font-black uppercase ${c.color}`}>
                      <Award className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-black">{c.t}</div>
                      <div className="text-[11px] text-white/70">{c.d}</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-amber-300" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 17 — Resource Center */}
      <section className="mx-auto max-w-6xl px-4 pt-20 md:px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            <Download className="h-3 w-3" /> Resource Center
          </span>
          <h2 className="text-heading mt-4 text-3xl font-black tracking-tight md:text-4xl">
            Everything you need — downloadable, ready to use
          </h2>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { t: "Posters", d: "Print-ready A3/A4", icon: FileText },
            { t: "Flyers", d: "Handout material", icon: FileText },
            { t: "Brochures", d: "Multi-page product brochure", icon: BookOpen },
            { t: "Sales Deck", d: "Client pitch deck", icon: PlayCircle },
            { t: "Demo Videos", d: "Product walkthroughs", icon: Video },
            { t: "Logo Kit", d: "Nexora logos + partner lockups", icon: Sparkles },
            { t: "Brand Guidelines", d: "Colors, typography, spacing", icon: BookOpen },
            { t: "WhatsApp Templates", d: "Pre-approved BSP templates", icon: MessageCircle },
          ].map((r) => (
            <div key={r.t} className="border-border bg-card group flex items-center justify-between rounded-[var(--radius-card)] border p-4 transition-all hover:border-primary/50 hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary grid h-10 w-10 place-items-center rounded-xl">
                  <r.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-heading text-sm font-black">{r.t}</div>
                  <div className="text-muted-foreground text-[11px]">{r.d}</div>
                </div>
              </div>
              <Download className="text-primary h-4 w-4 opacity-60 group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </section>

      {/* Section 18 — Leaderboard */}
      <section className="mx-auto max-w-6xl px-4 pt-20 md:px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            <Trophy className="h-3 w-3" /> Leaderboard
          </span>
          <h2 className="text-heading mt-4 text-3xl font-black tracking-tight md:text-4xl">
            Compete. Get recognized. Win.
          </h2>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {/* Level filter */}
          <div className="border-border bg-card rounded-[var(--radius-card)] border p-6 shadow-[var(--shadow-card)]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-primary">Levels</div>
            <div className="mt-4 space-y-2">
              {[
                { icon: MapPin, t: "City", d: "Compete inside your city" },
                { icon: Target, t: "District", d: "District-wide ranking" },
                { icon: Building2, t: "State", d: "Statewide leaderboard" },
              ].map((l) => (
                <div key={l.t} className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                  <l.icon className="text-primary h-4 w-4" />
                  <div className="flex-1">
                    <div className="text-heading text-xs font-black">{l.t}</div>
                    <div className="text-muted-foreground text-[11px]">{l.d}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 text-[11px] font-bold uppercase tracking-wider text-primary">Recognition</div>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-primary"><Trophy className="h-3 w-3" /> Top Referrer</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-primary"><TrendingUp className="h-3 w-3" /> Top Growth Partner</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-1 text-amber-700 dark:text-amber-300"><Crown className="h-3 w-3" /> Hall of Fame</span>
            </div>
          </div>

          {/* Top partners */}
          <div className="border-border bg-card rounded-[var(--radius-card)] border p-6 shadow-[var(--shadow-card)] lg:col-span-2">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold uppercase tracking-wider text-primary">Top partners · This month</div>
              <span className="text-[10px] text-muted-foreground">Live ranking</span>
            </div>
            <div className="mt-4 space-y-2">
              {[
                { r: 1, n: "Ravi Sharma", city: "Jaipur", s: 128 },
                { r: 2, n: "Priya Verma", city: "Kota", s: 112 },
                { r: 3, n: "Amit Singh", city: "Ajmer", s: 96 },
                { r: 4, n: "Nikita R.", city: "Alwar", s: 84 },
                { r: 5, n: "Deepak M.", city: "Udaipur", s: 71 },
              ].map((p) => (
                <div key={p.r} className={`flex items-center gap-3 rounded-lg border p-3 ${p.r <= 3 ? "border-primary/30 bg-primary/5" : "border-border/60 bg-muted/30"}`}>
                  <div className={`grid h-8 w-8 place-items-center rounded-full text-xs font-black ${p.r === 1 ? "bg-amber-400 text-amber-900" : p.r === 2 ? "bg-slate-300 text-slate-800" : p.r === 3 ? "bg-amber-700 text-amber-100" : "bg-muted text-muted-foreground"}`}>
                    {p.r}
                  </div>
                  <div className="flex-1">
                    <div className="text-heading text-sm font-black">{p.n}</div>
                    <div className="text-muted-foreground text-[11px]">{p.city}</div>
                  </div>
                  <div className="text-heading text-sm font-black">{p.s} <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">shops</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 19 — Support Center */}
      <section className="mx-auto max-w-6xl px-4 pt-20 md:px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            <HeadphonesIcon className="h-3 w-3" /> Support Center
          </span>
          <h2 className="text-heading mt-4 text-3xl font-black tracking-tight md:text-4xl">
            Help, exactly when you need it
          </h2>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: MessageCircle, t: "Live Chat", d: "In-app chat, 9am–9pm" },
            { icon: MessageCircle, t: "WhatsApp", d: "Fastest response channel" },
            { icon: FileText, t: "Ticket System", d: "Track every issue end-to-end" },
            { icon: Video, t: "Video Tutorials", d: "Step-by-step walkthroughs" },
            { icon: HelpCircle, t: "FAQs", d: "Common questions, quick answers" },
            { icon: BookOpen, t: "Knowledge Base", d: "Deep-dive articles + guides" },
          ].map((s) => (
            <div key={s.t} className="border-border bg-card rounded-[var(--radius-card)] border p-5 shadow-sm">
              <div className="bg-primary/10 text-primary grid h-10 w-10 place-items-center rounded-xl">
                <s.icon className="h-5 w-5" />
              </div>
              <div className="text-heading mt-3 text-sm font-black">{s.t}</div>
              <div className="text-muted-foreground mt-1 text-xs">{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 20 — Governance & Policy Center */}
      <section className="mx-auto max-w-6xl px-4 pt-20 md:px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            <ShieldCheck className="h-3 w-3" /> Governance & Policy
          </span>
          <h2 className="text-heading mt-4 text-3xl font-black tracking-tight md:text-4xl">
            Transparent policies, signed agreements
          </h2>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "Commission Policy",
            "Reward Policy",
            "Territory Policy",
            "QR Policy",
            "Referral Policy",
            "Brand Usage Policy",
            "Code of Conduct",
            "Partner Agreement",
            "Privacy Policy",
            "Refund Policy",
          ].map((p) => (
            <a key={p} href="#" className="border-border bg-card group flex items-center justify-between rounded-[var(--radius-card)] border p-4 transition-all hover:border-primary/50">
              <div className="flex items-center gap-3">
                <FileText className="text-primary h-4 w-4" />
                <span className="text-heading text-sm font-black">{p}</span>
              </div>
              <ArrowRight className="text-muted-foreground group-hover:text-primary h-4 w-4" />
            </a>
          ))}
        </div>
      </section>

      {/* Section 21 — FAQ */}
      <section className="mx-auto max-w-3xl px-4 pt-20 md:px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            <HelpCircle className="h-3 w-3" /> FAQ
          </span>
          <h2 className="text-heading mt-4 text-3xl font-black tracking-tight md:text-4xl">
            Frequently asked questions
          </h2>
          <p className="text-muted-foreground mt-3 text-sm">
            General partner questions — for formal terms see the Governance & Policy Center above.
          </p>
        </div>

        <div className="mt-10 space-y-3">
          {[
            { q: "Do I need to invest any money to become a partner?", a: "No. The District Business Partner Program is completely free to join. You earn on the salons you help onboard." },
            { q: "How soon can I start earning?", a: "The first Activation Reward triggers once a salon completes 15 days of active revenue. Weekly Growth Share begins from the first eligible weekly cycle." },
            { q: "Can I work part-time?", a: "Yes. Most partners start part-time using their existing salon-owner network before scaling up." },
            { q: "Is there any territory restriction?", a: "Territories are assigned per the Territory Policy. Verified partners get priority in their assigned district." },
            { q: "What happens if a salon becomes inactive?", a: "Only active salons qualify for the Weekly Growth Share. Inactive salons pause the recurring share until they reactivate." },
            { q: "How are payouts made?", a: "All payouts are auto-credited to your registered bank/UPI on a fixed cycle, with invoice + TDS breakdown available in the dashboard." },
          ].map((f, i) => (
            <FaqItem key={f.q} q={f.q} a={f.a} defaultOpen={i === 0} />
          ))}
        </div>
      </section>

      {/* Section 22 — Final CTA */}
      <section className="mx-auto max-w-6xl px-4 pt-20 md:px-6">
        <div className="relative overflow-hidden rounded-[24px] border border-primary/30 bg-gradient-to-br from-[#0A2540] via-[#1a1060] to-[#635BFF] p-8 text-white shadow-[var(--shadow-card)] md:p-14">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-amber-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-primary/40 blur-3xl" />
          <div className="relative text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-300">
              <Sparkles className="h-3 w-3" /> Become a Nexora District Business Partner
            </span>
            <h2 className="mt-5 text-3xl font-black tracking-tight md:text-5xl">
              Connect Salons. Build Networks. <span className="text-amber-300">Grow Together.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-white/80 md:text-base">
              Turn your existing salon-owner network into recurring monthly income — with a transparent, backed-by-policy partner program.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a href="#join" className="inline-flex items-center gap-2 rounded-full bg-amber-300 px-6 py-3 text-sm font-black text-[#0A2540] shadow-lg transition-transform hover:scale-105">
                Join Free <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#join" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black text-[#0A2540] transition-transform hover:scale-105">
                Apply Now <Rocket className="h-4 w-4" />
              </a>
              <a href="#talk" className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-black text-white backdrop-blur transition-colors hover:bg-white/20">
                <HeadphonesIcon className="h-4 w-4" /> Contact Support
              </a>
            </div>
          </div>
        </div>
      </section>


      {/* Trust — Why partner with Nexora */}
      <section className="mx-auto max-w-6xl px-4 pt-20 md:px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            <ShieldCheck className="h-3 w-3" /> Why Partner With Nexora
          </span>
          <h2 className="text-heading mt-4 text-3xl font-black tracking-tight md:text-4xl">
            India's Trusted Beauty Industry OS
          </h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-base">
            Backed by real shops, real revenue and a transparent partner model — not a promise, a system.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {[
            { icon: Store, k: "12,000+", v: "Salons onboarded" },
            { icon: Users, k: "2M+", v: "Customers reached" },
            { icon: IndianRupee, k: "₹50Cr+", v: "GMV processed" },
            { icon: Trophy, k: "38%", v: "Avg. shop growth" },
          ].map((s) => (
            <div key={s.v} className="border-border bg-card rounded-[var(--radius-card)] border p-6 text-center shadow-[var(--shadow-card)]">
              <s.icon className="text-primary mx-auto h-6 w-6" />
              <div className="text-heading mt-3 text-3xl font-black">{s.k}</div>
              <div className="text-muted-foreground mt-1 text-xs font-bold uppercase tracking-wider">{s.v}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {[
            { icon: BadgeCheck, t: "Registered Indian company", b: "GST & MSME registered. Verified business entity." },
            { icon: ShieldCheck, t: "Transparent 7-day payouts", b: "Every rupee traceable. No hidden deductions." },
            { icon: FileCheck, t: "Written partner agreement", b: "Signed contract with clear terms and revenue share." },
          ].map((t) => (
            <div key={t.t} className="border-border bg-card flex items-start gap-3 rounded-[var(--radius-card)] border p-5">
              <div className="bg-success/10 text-success grid h-10 w-10 shrink-0 place-items-center rounded-xl">
                <t.icon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-heading font-bold">{t.t}</h4>
                <p className="text-muted-foreground mt-1 text-sm">{t.b}</p>
              </div>
            </div>
          ))}
        </div>
      </section>



      {/* How Growth Partners Earn */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-muted/30 to-background py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
              <Rocket className="h-3 w-3" /> How Growth Partners Earn
            </span>
            <h2 className="text-heading mt-4 text-3xl font-black tracking-tight md:text-5xl">
              Nexora Growth Partner Program
            </h2>
            <div className="text-muted-foreground mt-5 flex flex-wrap items-center justify-center gap-2 text-sm font-semibold">
              {["Ye Naukri Nahi", "Ye Franchise Nahi", "Ye MLM Nahi"].map((t) => (
                <span key={t} className="rounded-full border border-border bg-card px-3 py-1.5">{t}</span>
              ))}
            </div>
            <p className="text-heading mx-auto mt-4 max-w-2xl text-base font-bold md:text-lg">
              Ye Beauty Industry Ko Digital Banane Ka Mission Hai.
            </p>
          </div>

          {/* 1. Activation Reward */}
          <div className="mt-16">
            <div className="flex items-center gap-3">
              <span className="bg-gradient-cta text-primary-foreground grid h-10 w-10 place-items-center rounded-xl text-sm font-black shadow-[var(--shadow-glow)]">1</span>
              <h3 className="text-heading text-2xl font-black md:text-3xl">One-Time Activation Reward</h3>
              <span className="ml-auto hidden rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary md:inline-block">15 Day Model</span>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                { icon: Users, step: "STEP 1", title: "Shop / Salon Onboard Karo", body: "Apne network ke salon ko Nexora pe live karwao." },
                { icon: CalendarClock, step: "STEP 2", title: "15 Din Active Revenue Complete", body: "Shop 15 din ke andar real revenue generate kare." },
                { icon: Zap, step: "STEP 3", title: "Activation Reward Unlock", body: "Aapka one-time activation reward instantly credit." },
              ].map((s) => (
                <article key={s.step} className="border-border bg-card rounded-[var(--radius-card)] border p-6 shadow-[var(--shadow-card)]">
                  <div className="bg-primary/10 text-primary grid h-11 w-11 place-items-center rounded-xl">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div className="text-primary mt-4 text-[11px] font-black uppercase tracking-widest">{s.step}</div>
                  <h4 className="text-heading mt-1 text-lg font-bold">{s.title}</h4>
                  <p className="text-muted-foreground mt-2 text-sm">{s.body}</p>
                </article>
              ))}
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="border-border bg-card rounded-[var(--radius-card)] border p-6">
                <div className="text-muted-foreground text-xs font-black uppercase tracking-wider">Single Shop Example</div>
                <ul className="mt-4 space-y-3 text-sm">
                  {[
                    ["Salon Revenue", "₹15,000"],
                    ["Nexora Revenue (10%)", "₹1,500"],
                    ["Partner Activation Reward (10%)", "₹150"],
                  ].map(([k, v]) => (
                    <li key={k} className="flex items-center justify-between border-b border-border/60 pb-2 last:border-0 last:pb-0">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="text-heading font-black">{v}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[var(--radius-card)] bg-gradient-to-br from-[#0A2540] via-[#1a1060] to-[#635BFF] p-6 text-white shadow-[var(--shadow-card)]">
                <div className="text-xs font-black uppercase tracking-wider text-white/70">100 Active Shops</div>
                <ul className="mt-4 space-y-3 text-sm">
                  {[
                    ["Total Revenue Generated", "₹15,00,000"],
                    ["Nexora Revenue", "₹1,50,000"],
                    ["Partner Activation Rewards", "₹15,000"],
                  ].map(([k, v]) => (
                    <li key={k} className="flex items-center justify-between border-b border-white/15 pb-2 last:border-0 last:pb-0">
                      <span className="text-white/75">{k}</span>
                      <span className="font-black text-amber-300">{v}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <blockquote className="border-primary bg-primary/5 text-heading mt-6 rounded-[var(--radius-card)] border-l-4 p-5 text-sm font-semibold italic md:text-base">
              "Maine Company Ko ₹1.5 Lakh Revenue Generate Karne Me Help Ki Aur Mujhe ₹15,000 Activation Reward Mila."
            </blockquote>
          </div>

          {/* 2. 7-Day Growth Share */}
          <div className="mt-20">
            <div className="flex items-center gap-3">
              <span className="bg-gradient-cta text-primary-foreground grid h-10 w-10 place-items-center rounded-xl text-sm font-black shadow-[var(--shadow-glow)]">2</span>
              <h3 className="text-heading text-2xl font-black md:text-3xl">7-Day Growth Share</h3>
              <span className="ml-auto hidden rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary md:inline-block">Recurring Earning</span>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                { label: "First 6 Months", pct: "10%", tone: "from-emerald-400 to-emerald-600" },
                { label: "Month 7 – 12", pct: "5%", tone: "from-sky-400 to-indigo-600" },
                { label: "After 12 Months", pct: "2%", tone: "from-amber-400 to-orange-600" },
              ].map((t) => (
                <div key={t.label} className={`relative overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br ${t.tone} p-6 text-white shadow-[var(--shadow-card)]`}>
                  <TrendingUp className="h-6 w-6 opacity-90" />
                  <div className="mt-3 text-xs font-black uppercase tracking-wider text-white/85">{t.label}</div>
                  <div className="mt-1 text-4xl font-black sm:text-5xl">{t.pct}</div>
                  <div className="mt-1 text-sm font-semibold text-white/90">Partner Share</div>
                </div>
              ))}
            </div>

            <div className="border-border bg-card mt-6 rounded-[var(--radius-card)] border p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CalendarClock className="text-primary h-5 w-5" />
                  <span className="text-heading font-bold">Every 7 Days Payout Cycle</span>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">Transparent · Performance Based</span>
              </div>
              <ul className="mt-5 grid gap-3 md:grid-cols-2">
                {[
                  "Active Shops Jitni Zyada",
                  "Growth Share Utna Zyada",
                  "Performance Based System",
                  "Transparent Weekly Earnings",
                ].map((n) => (
                  <li key={n} className="flex items-start gap-2 text-sm">
                    <BadgeCheck className="text-success mt-0.5 h-4 w-4 shrink-0" />
                    <span className="text-heading font-semibold">{n}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 3. Dashboard preview */}
          <div className="mt-20">
            <div className="flex items-center gap-3">
              <span className="bg-gradient-cta text-primary-foreground grid h-10 w-10 place-items-center rounded-xl text-sm font-black shadow-[var(--shadow-glow)]">3</span>
              <h3 className="text-heading text-2xl font-black md:text-3xl">Growth Partner Dashboard</h3>
              <span className="ml-auto hidden items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary md:inline-flex">
                <LayoutDashboard className="h-3 w-3" /> Live KPIs
              </span>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {[
                { icon: Users, label: "Shops Added" },
                { icon: Activity, label: "Active Shops" },
                { icon: TrendingUp, label: "Active Revenue" },
                { icon: IndianRupee, label: "Total Revenue Generated" },
                { icon: Sparkles, label: "Nexora Revenue" },
                { icon: Wallet, label: "Your Earnings" },
                { icon: CalendarClock, label: "Pending Earnings" },
                { icon: Zap, label: "Weekly Payout" },
                { icon: Trophy, label: "Lifetime Earnings" },
                { icon: Target, label: "Next Milestone" },
              ].map((k) => (
                <div key={k.label} className="border-border bg-card rounded-[var(--radius-card)] border p-4 shadow-[var(--shadow-card)]">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 text-primary grid h-8 w-8 place-items-center rounded-lg">
                      <k.icon className="h-4 w-4" />
                    </div>
                    <span className="text-muted-foreground text-[11px] font-black uppercase tracking-wider">{k.label}</span>
                  </div>
                  <div className="text-heading mt-3 text-xl font-black">—</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Milestone Rewards · 5. Partner Benefits · 6. Program Highlights */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        {/* 4. Milestone Rewards */}
        <div>
          <div className="flex items-center gap-3">
            <span className="bg-gradient-cta text-primary-foreground grid h-10 w-10 place-items-center rounded-xl text-sm font-black shadow-[var(--shadow-glow)]">4</span>
            <h3 className="text-heading text-2xl font-black md:text-3xl">Milestone Rewards</h3>
            <span className="ml-auto hidden rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary md:inline-block">Unlock as you grow</span>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                count: "25",
                label: "Active Shops",
                tone: "from-emerald-400 to-emerald-600",
                image: rewardWelcomeKit,
                items: ["Welcome Kit"],
              },
              {
                count: "100",
                label: "Active Shops",
                tone: "from-sky-400 to-indigo-600",
                image: rewardTabletBadge,
                items: ["Tablet", "Growth Builder Badge"],
              },
              {
                count: "500",
                label: "Active Shops",
                tone: "from-amber-400 to-orange-600",
                image: rewardLaptop,
                items: ["Branded Laptop", "Platinum Growth Partner"],
              },
              {
                count: "1000+",
                label: "Active Shops",
                tone: "from-fuchsia-500 via-rose-500 to-amber-500",
                image: rewardCar,
                items: [
                  "District Business Partner",
                  "Leadership Circle",
                  "Hall Of Fame",
                  "Car Reward Program Eligibility",
                ],
              },
            ].map((m) => (
              <article key={m.count} className="border-border bg-card overflow-hidden rounded-[var(--radius-card)] border shadow-[var(--shadow-card)]">
                <div className={`bg-gradient-to-br ${m.tone} p-5 text-white`}>
                  <div className="text-xs font-black uppercase tracking-wider text-white/80">{m.label}</div>
                  <div className="mt-1 text-4xl font-black">{m.count}</div>
                </div>
                <div className="aspect-square overflow-hidden bg-muted">
                  <img src={m.image} alt={`${m.count} active shops reward`} loading="lazy" width={1024} height={1024} className="h-full w-full object-cover" />
                </div>
                <ul className="space-y-2 p-5">
                  {m.items.map((it) => (
                    <li key={it} className="text-heading flex items-start gap-2 text-sm font-semibold">
                      <BadgeCheck className="text-success mt-0.5 h-4 w-4 shrink-0" />
                      {it}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>


        {/* 5 & 6 side-by-side */}
        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {/* 5. Partner Benefits */}
          <div className="border-border bg-card rounded-[var(--radius-card)] border p-7 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-3">
              <span className="bg-gradient-cta text-primary-foreground grid h-10 w-10 place-items-center rounded-xl text-sm font-black shadow-[var(--shadow-glow)]">5</span>
              <h3 className="text-heading text-xl font-black md:text-2xl">Partner Benefits</h3>
            </div>
            <ul className="mt-6 space-y-3">
              {[
                "One-Time Activation Reward",
                "Every 7 Days Growth Share",
                "Hall Of Fame Recognition",
                "Leadership Status",
                "Business Network Building",
                "Long-Term Opportunity",
              ].map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm">
                  <BadgeCheck className="text-success mt-0.5 h-5 w-5 shrink-0" />
                  <span className="text-heading font-semibold">{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 6. Program Highlights */}
          <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br from-[#0A2540] via-[#1a1060] to-[#635BFF] p-7 text-white shadow-[var(--shadow-card)]">
            <div className="absolute inset-0 opacity-15 [background-image:radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] [background-size:24px_24px]" />
            <div className="relative">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 text-sm font-black backdrop-blur">6</span>
                <h3 className="text-xl font-black md:text-2xl">Program Highlights</h3>
              </div>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  "No Joining Fee",
                  "No Investment",
                  "No Franchise Fee",
                  "No Hidden Charges",
                  "100% Transparent System",
                  "Real Shops",
                  "Real Growth",
                  "Real Rewards",
                ].map((h) => (
                  <li key={h} className="flex items-start gap-2 text-sm">
                    <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                    <span className="font-semibold">{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Success Formula */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <div className="border-border bg-card rounded-[var(--radius-card)] border p-8 shadow-[var(--shadow-card)] md:p-12">
          <div className="flex items-center gap-3">
            <span className="bg-gradient-cta text-primary-foreground grid h-10 w-10 place-items-center rounded-xl text-sm font-black shadow-[var(--shadow-glow)]">7</span>
            <h3 className="text-heading text-2xl font-black md:text-3xl">Success Formula</h3>
          </div>
          <div className="mt-8 grid items-stretch gap-4 md:grid-cols-4">
            {[
              { k: "Jitni", v: "Active Shops", icon: Users },
              { k: "Utna", v: "Growth Share", icon: TrendingUp },
              { k: "Utni", v: "Recognition", icon: Award },
              { k: "Utni", v: "Leadership Opportunity", icon: Crown },
            ].map((s) => (
              <div key={s.v} className="relative overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-6 text-center">
                <s.icon className="text-primary mx-auto h-8 w-8" />
                <div className="text-muted-foreground mt-3 text-xs font-bold uppercase tracking-wider">{s.k}</div>
                <div className="text-heading mt-1 text-lg font-black">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20 md:px-6">
        <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br from-[#0A2540] via-[#1a1060] to-[#635BFF] p-10 text-center text-white shadow-[var(--shadow-card)] md:p-16">
          <div className="absolute inset-0 opacity-15 [background-image:radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] [background-size:24px_24px]" />
          <div className="relative">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-sm font-black backdrop-blur">8</span>
            <h2 className="mt-5 text-3xl font-black leading-tight md:text-5xl">
              Aaj Hi Nexora Growth Partner Baniye
            </h2>
            <p className="mt-3 text-base text-white/80 md:text-lg">
              Apne District Ka Growth Leader Baniye
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              {["More Shops", "More Growth", "More Rewards", "More Recognition"].map((t) => (
                <div key={t} className="rounded-xl bg-white/10 px-4 py-3 font-bold backdrop-blur">{t}</div>
              ))}
            </div>
            <a
              href="/register?type=growth-partner"
              className="bg-gradient-cta text-primary-foreground mt-10 inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-black shadow-[var(--shadow-glow)] transition hover:scale-[1.02]"
            >
              Join as Growth Partner <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>



      {/* Responsibilities */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            <Target className="h-3 w-3" /> Partner Responsibilities
          </span>
          <h2 className="text-heading mt-4 text-3xl font-black tracking-tight md:text-4xl">
            What a Growth Partner actually does
          </h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-base">
            Clear expectations. No gimmicks. This is the day-to-day of a successful district Growth Partner.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Store, t: "Onboard local shops", b: "Identify salons, spas and barbershops in your district and help them go live on Nexora." },
            { icon: GraduationCap, t: "Train shop owners", b: "Walk them through the app, POS, bookings and rewards system in the first week." },
            { icon: Activity, t: "Ensure 15-day activation", b: "Support the shop until they cross their first 15 days of active revenue on Nexora." },
            { icon: HeadphonesIcon, t: "First-line support", b: "Be the local point of contact for questions. Escalate to Nexora support when needed." },
            { icon: TrendingUp, t: "Drive recurring growth", b: "Help shops run offers, collect reviews and stay active — this compounds your 7-day share." },
            { icon: ShieldCheck, t: "Follow the code of conduct", b: "Represent Nexora with honesty. No false promises, no cash collection from shops." },
          ].map((r) => (
            <div key={r.t} className="border-border bg-card rounded-[var(--radius-card)] border p-6 shadow-[var(--shadow-card)]">
              <div className="bg-primary/10 text-primary grid h-11 w-11 place-items-center rounded-xl">
                <r.icon className="h-5 w-5" />
              </div>
              <h3 className="text-heading mt-4 font-bold">{r.t}</h3>
              <p className="text-muted-foreground mt-2 text-sm">{r.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Training & Support */}
      <section className="bg-muted/30 border-y border-border py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
                <GraduationCap className="h-3 w-3" /> Training & Support
              </span>
              <h2 className="text-heading mt-4 text-3xl font-black tracking-tight md:text-4xl">
                You never work alone
              </h2>
              <p className="text-muted-foreground mt-3 text-base">
                Every Growth Partner goes through a structured onboarding and gets lifetime access to
                training, pitch decks, and a dedicated regional manager.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "3-day onboarding bootcamp (online)",
                  "Sales pitch deck & shop demo scripts",
                  "WhatsApp partner community",
                  "Weekly performance review calls",
                  "Dedicated regional success manager",
                  "Lifetime access to Nexora Academy",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="text-success mt-0.5 h-5 w-5 shrink-0" />
                    <span className="text-heading font-semibold">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid gap-4">
              {[
                { day: "Day 0", t: "Application & KYC", b: "Submit ID, PAN and bank details. Verification in 24 hours." },
                { day: "Day 1–3", t: "Onboarding bootcamp", b: "Product, pitch, dashboard and code-of-conduct training." },
                { day: "Day 4+", t: "Field activation", b: "Start onboarding shops with your regional manager's guidance." },
                { day: "Day 15+", t: "First payout", b: "Once your first shop clears 15-day active revenue, rewards go live." },
              ].map((s) => (
                <div key={s.day} className="border-border bg-card rounded-[var(--radius-card)] border p-5 shadow-[var(--shadow-card)]">
                  <div className="text-primary text-xs font-black uppercase tracking-wider">{s.day}</div>
                  <div className="text-heading mt-1 font-bold">{s.t}</div>
                  <p className="text-muted-foreground mt-1 text-sm">{s.b}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Journey timeline */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            <Rocket className="h-3 w-3" /> Your Journey
          </span>
          <h2 className="text-heading mt-4 text-3xl font-black tracking-tight md:text-4xl">
            From visitor to active partner
          </h2>
        </div>
        <div className="mt-12 grid gap-3 md:grid-cols-4 lg:grid-cols-7">
          {[
            { n: "1", t: "Visit", d: "Explore program" },
            { n: "2", t: "Interested", d: "Try the calculator" },
            { n: "3", t: "Trust", d: "Read our story" },
            { n: "4", t: "Join", d: "Sign up in 2 min" },
            { n: "5", t: "KYC", d: "Verified in 24h" },
            { n: "6", t: "Training", d: "3-day bootcamp" },
            { n: "7", t: "Active", d: "Earn on shops" },
          ].map((s, i) => (
            <div key={s.n} className="border-border bg-card relative rounded-[var(--radius-card)] border p-4 text-center shadow-[var(--shadow-card)]">
              <div className="bg-gradient-cta text-primary-foreground mx-auto grid h-9 w-9 place-items-center rounded-full text-sm font-black shadow-[var(--shadow-glow)]">
                {s.n}
              </div>
              <div className="text-heading mt-3 text-sm font-black">{s.t}</div>
              <div className="text-muted-foreground mt-1 text-xs">{s.d}</div>
              {i < 6 && (
                <ArrowRight className="text-muted-foreground absolute -right-3 top-1/2 hidden h-4 w-4 -translate-y-1/2 lg:block" />
              )}
            </div>
          ))}
        </div>
      </section>


      {/* Registration form */}
      <section id="join" className="mx-auto max-w-2xl px-4 pb-24 md:px-6 scroll-mt-24">
        <div id="talk" />
        <div className="border-border bg-card rounded-[24px] border p-7 shadow-[var(--shadow-card)]">
          <h2 className="text-heading text-2xl font-black">Get started</h2>
          <p className="text-muted-foreground mt-1 text-sm">Our partner success team will reach out within 24 hours.</p>
          {submitted ? (
            <div className="bg-success/10 text-success mt-6 rounded-[var(--radius-card)] p-5 text-center text-sm font-bold">
              ✓ Thanks! We'll be in touch with you shortly.
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 grid gap-4 md:grid-cols-2">
              {([
                ["ownerName", "Your name"],
                ["salonName", "Salon name"],
                ["phone", "Phone"],
                ["city", "City"],
                ["email", "Email", "md:col-span-2"],
              ] as [keyof typeof form, string, string?][]).map(([k, label, cls]) => (
                <label key={k} className={cls}>
                  <span className="text-heading text-xs font-bold uppercase tracking-wider">{label}</span>
                  <input
                    value={form[k]}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                    maxLength={k === "email" ? 255 : 120}
                    className="border-border bg-background mt-1 w-full rounded-[var(--radius-button)] border px-3 py-2.5 text-sm outline-none focus:border-primary"
                  />
                  {errors[k] && <span className="text-danger mt-1 block text-xs font-semibold">{errors[k]}</span>}
                </label>
              ))}
              <button type="submit" className="bg-gradient-cta text-primary-foreground md:col-span-2 mt-2 rounded-[var(--radius-button)] px-4 py-3 text-sm font-bold shadow-[var(--shadow-glow)]">
                Join Growth Partner Program
              </button>
            </form>
          )}
        </div>
      </section>

      <StickyCTA />
    </div>
  );
}

function StickyCTA() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur transition-transform duration-300 md:bottom-4 md:left-1/2 md:right-auto md:w-auto md:-translate-x-1/2 md:rounded-full md:border md:shadow-[var(--shadow-card)] ${visible ? "translate-y-0" : "translate-y-full md:translate-y-[200%]"}`}
      aria-hidden={!visible}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-4">
        <div className="hidden text-sm font-black text-heading md:block">
          District Business Partner Program
        </div>
        <div className="flex flex-1 items-center gap-2 md:flex-none">
          <a href="#join" className="bg-gradient-cta text-primary-foreground inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-black shadow-[var(--shadow-glow)] md:flex-none">
            Join Free <ArrowRight className="h-4 w-4" />
          </a>
          <a href="#talk" className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-black text-heading md:flex-none">
            <HeadphonesIcon className="h-4 w-4" /> Talk to Team
          </a>
        </div>
      </div>
    </div>
  );
}

function FaqItem({ q, a, defaultOpen = false }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-border bg-card overflow-hidden rounded-[var(--radius-card)] border shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className="text-heading text-sm font-black">{q}</span>
        <ChevronDown className={`text-primary h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="border-t border-border/60 bg-muted/20 px-5 py-4 text-sm text-muted-foreground animate-fade-in">
          {a}
        </div>
      )}
    </div>
  );
}


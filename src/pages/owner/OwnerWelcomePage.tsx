import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeIndianRupee,
  CalendarCheck2,
  Check,
  CheckCircle2,
  Clock3,
  Globe2,
  Home,
  Images,
  IndianRupee,
  MapPin,
  MessageCircle,
  Palette,
  Scissors,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Store,
  WalletCards,
} from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import salonHero from "@/assets/partner-hero-salon.jpg";

const OWNER_TOOLS = [
  { icon: Store, title: "Salon profile", body: "Name, about, contact and location edit karein." },
  {
    icon: Scissors,
    title: "Services & prices",
    body: "Services, duration aur pricing simple form se add karein.",
  },
  {
    icon: Images,
    title: "Photo gallery",
    body: "5 photos, 1 video aur owner profile photo upload karein.",
  },
  { icon: Clock3, title: "Working hours", body: "Har din ka opening aur closing time set karein." },
  {
    icon: Home,
    title: "Home service",
    body: "Extra charge aur service radius aap control karein.",
  },
  {
    icon: Palette,
    title: "Theme colour",
    body: "Apne brand ka colour choose karein; layout hamesha clean rahega.",
  },
] as const;

const WEBSITE_SECTIONS = [
  "Hero & booking button",
  "About salon",
  "Services & pricing",
  "Gallery",
  "Reviews & ratings",
  "Working hours",
  "Contact & Google Maps",
] as const;

const BOOKING_STEPS = [
  {
    step: "1",
    title: "Customer booking bhejta hai",
    body: "Service, date, time aur WhatsApp number ke saath request Pending me aati hai.",
  },
  {
    step: "2",
    title: "Aap decision lete hain",
    body: "Confirm, Reject ya Suggest New Time — teen clear actions.",
  },
  {
    step: "3",
    title: "Customer ko update milta hai",
    body: "Naya time accept hote hi booking automatically confirmed ho jaati hai.",
  },
] as const;

function OwnerCta({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  return (
    <Link
      to="/owner/register-business"
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 ${
        compact ? "px-4 py-2.5 text-sm" : "px-6 py-3.5 text-base"
      } ${className}`}
    >
      Register Your Salon <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

export function OwnerWelcomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <PublicHeader />

      <main className="pb-20 md:pb-0">
        <section className="relative overflow-hidden border-b border-violet-100 bg-gradient-to-br from-violet-50 via-white to-amber-50">
          <div className="absolute -right-24 top-16 h-72 w-72 rounded-full bg-violet-200/40 blur-3xl" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1.02fr_.98fr] lg:px-8 lg:py-24">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
                <ShieldCheck className="h-4 w-4" />
                No monthly charge. No hidden fee.
              </div>
              <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.06] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Apna salon online laayein.{" "}
                <span className="text-violet-600">Bookings badhayein.</span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Nexora par salon register karein, ready-made website paayein aur bookings, home
                service aur earnings ek simple jagah se manage karein.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <OwnerCta />
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-base font-bold text-slate-800 transition hover:border-violet-300 hover:text-violet-700"
                >
                  Owner Login
                </Link>
              </div>

              <div className="mt-7 grid max-w-xl gap-3 text-sm text-slate-700 sm:grid-cols-3">
                {["Free registration", "Website included", "Pay only on success"].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span className="font-semibold">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl">
              <div className="overflow-hidden rounded-[28px] border border-white bg-white p-3 shadow-2xl shadow-slate-300/60">
                <img
                  src={salonHero}
                  alt="Indian salon owner managing a modern salon"
                  className="h-72 w-full rounded-[21px] object-cover sm:h-96"
                />
                <div className="grid gap-3 p-3 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <p className="text-lg font-black">Your Salon Website</p>
                    <p className="text-sm text-slate-500">
                      Services, photos, reviews, map and booking
                    </p>
                  </div>
                  <span className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white">
                    Book Now
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-5 -left-2 rounded-2xl border border-emerald-100 bg-white px-4 py-3 shadow-xl sm:-left-8">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                    <CalendarCheck2 className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-black">New booking received</p>
                    <p className="text-xs text-slate-500">Haircut • Today, 4:30 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-slate-200 sm:grid-cols-4">
            {[
              ["₹0", "Monthly charge"],
              ["10%", "Completed booking fee"],
              ["90%", "Salon wallet credit"],
              ["24–48 hr", "Withdrawal availability"],
            ].map(([value, label]) => (
              <div key={label} className="bg-white px-4 py-7 text-center">
                <p className="text-2xl font-black text-violet-700 sm:text-3xl">{value}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500 sm:text-sm">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-black uppercase tracking-widest text-violet-600">
              10 minute setup
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Registration se live website tak — bas 4 steps
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {[
              ["1", "Owner account", "Naam, mobile aur email se account banayein."],
              ["2", "Salon details", "Shop name, district aur basic information fill karein."],
              ["3", "Website ready", "Nexora aapki booking website automatically banata hai."],
              ["4", "Start bookings", "Services aur timing add karke bookings lena shuru karein."],
            ].map(([number, title, body]) => (
              <article
                key={number}
                className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-600 text-sm font-black text-white">
                  {number}
                </span>
                <h3 className="mt-5 text-lg font-black">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-slate-950 py-16 text-white lg:py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/15 px-3 py-1.5 text-xs font-bold text-violet-200">
                <Globe2 className="h-4 w-4" /> Free mini website
              </div>
              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                Har salon ko ready-made booking website
              </h2>
              <p className="mt-4 max-w-xl leading-7 text-slate-300">
                Koi coding ya page builder nahi. Sirf simple forms fill karein; clean website mobile
                aur desktop dono par automatically update hogi.
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {WEBSITE_SECTIONS.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-slate-200">
                    <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                    {item}
                  </div>
                ))}
              </div>
              <Link
                to="/owner/templates"
                className="mt-8 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/15"
              >
                View salon templates <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/5 p-4 sm:p-6">
              <div className="rounded-2xl bg-white p-5 text-slate-950">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-violet-100 text-violet-700">
                      <Sparkles className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-black">Glow Beauty Salon</p>
                      <p className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="h-3 w-3" /> Raipur, Chhattisgarh
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                    Open
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    ["Haircut & Styling", "₹499"],
                    ["Bridal Makeup", "₹4,999"],
                    ["Facial & Cleanup", "₹899"],
                  ].map(([service, price]) => (
                    <div
                      key={service}
                      className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                    >
                      <span className="text-sm font-bold">{service}</span>
                      <span className="font-black text-violet-700">{price}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3">
                  <span className="flex items-center gap-1.5 text-sm font-bold">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 4.8 rating
                  </span>
                  <span className="text-xs font-semibold text-slate-500">126 reviews</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <span className="text-sm font-black uppercase tracking-widest text-violet-600">
              Simple controls
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Salon chalane ke liye jo zaroori hai, bas wahi
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Technical settings aur confusing dashboard ke bina, har detail simple form se edit
              karein.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {OWNER_TOOLS.map((tool) => (
              <article
                key={tool.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100/50"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-50 text-violet-700">
                  <tool.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-black">{tool.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{tool.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-50 py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-sm font-black uppercase tracking-widest text-violet-600">
                Booking approval
              </span>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Har booking par final control aapka
              </h2>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {BOOKING_STEPS.map((item) => (
                <article
                  key={item.step}
                  className="rounded-2xl border border-slate-200 bg-white p-6"
                >
                  <span className="text-sm font-black text-violet-600">STEP {item.step}</span>
                  <h3 className="mt-3 text-lg font-black">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
                </article>
              ))}
            </div>
            <div className="mx-auto mt-8 flex max-w-2xl flex-wrap justify-center gap-3">
              {["Confirm Booking", "Reject Booking", "Suggest New Time"].map((action, index) => (
                <span
                  key={action}
                  className={`rounded-xl px-4 py-2.5 text-sm font-bold ${
                    index === 0
                      ? "bg-emerald-100 text-emerald-800"
                      : index === 1
                        ? "bg-rose-100 text-rose-800"
                        : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {action}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-violet-600">
              <WalletCards className="h-4 w-4" /> Clear earnings
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Successful booking par hi 10% commission
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-slate-600">
              Koi monthly plan nahi. Customer payment ke baad platform commission clear dikhega aur
              remaining amount salon wallet me credit hoga.
            </p>
            <div className="mt-6 space-y-3 text-sm">
              {[
                "Available balance 24–48 hours me",
                "Minimum withdrawal ₹100",
                "Earnings aur withdrawal history ek jagah",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 font-semibold text-slate-700">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-violet-100 bg-violet-50 p-5 sm:p-8">
            <p className="text-sm font-black uppercase tracking-wider text-violet-700">
              ₹1,000 completed booking example
            </p>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between rounded-2xl bg-white p-4">
                <span className="flex items-center gap-2 font-semibold text-slate-600">
                  <IndianRupee className="h-5 w-5" /> Customer payment
                </span>
                <span className="text-xl font-black">₹1,000</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white p-4">
                <span className="flex items-center gap-2 font-semibold text-slate-600">
                  <BadgeIndianRupee className="h-5 w-5" /> Nexora commission
                </span>
                <span className="text-xl font-black text-rose-600">− ₹100</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-emerald-600 p-5 text-white">
                <span className="flex items-center gap-2 font-bold">
                  <WalletCards className="h-5 w-5" /> Your salon wallet
                </span>
                <span className="text-2xl font-black">₹900</span>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-br from-violet-700 via-violet-600 to-fuchsia-600 py-16 text-white lg:py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <Smartphone className="mx-auto h-10 w-10" />
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              Apne salon ko aaj hi online laayein
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-violet-100">
              Registration free hai. Monthly charge nahi. Setup simple hai.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/owner/register-business"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-black text-violet-700 shadow-xl"
              >
                Register Your Salon <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 font-bold text-white"
              >
                <MessageCircle className="h-4 w-4" /> Already registered? Login
              </Link>
            </div>
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 p-3 backdrop-blur md:hidden">
        <OwnerCta compact className="w-full" />
      </div>
    </div>
  );
}

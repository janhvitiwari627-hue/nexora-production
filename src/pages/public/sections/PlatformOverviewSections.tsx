import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarCheck,
  Globe2,
  QrCode,
  ShieldCheck,
  Smartphone,
  Store,
  Target,
  Truck,
  UserRound,
} from "lucide-react";
import { InstallAppButton } from "@/components/pwa/InstallAppButton";

const ROLE_CARDS = [
  {
    icon: UserRound,
    title: "For Customers",
    text: "Salons खोजें, prices compare करें और appointment book करें.",
    to: "/customer-app",
    action: "Customer App",
    kind: "customer",
    startPath: "/app/customer",
  },
  {
    icon: Store,
    title: "For Shop Owners",
    text: "Salon setup, services, bookings और website एक simple owner app में.",
    to: "/shop-owner-app",
    action: "Owner App",
    kind: "owner",
    startPath: "/app/owner",
  },
  {
    icon: Target,
    title: "For Growth Partners",
    text: "Local salons onboard करें, leads और partner progress track करें.",
    to: "/growth-partner-app",
    action: "Partner App",
    kind: "partner",
    startPath: "/app/partner",
  },
  {
    icon: Truck,
    title: "For Brands & Distributors",
    text: "Products showcase करें और salon business leads manage करें.",
    to: "/distributor-app",
    action: "Trade App",
    kind: "distributor",
    startPath: "/portal",
  },
  {
    icon: BriefcaseBusiness,
    title: "For Beauty Professionals",
    text: "Jobs खोजें, apply करें या salon vacancy post करें.",
    to: "/jobs-app",
    action: "Jobs App",
    kind: "jobs",
    startPath: "/app/jobs",
  },
] as const;

const FLOW = [
  {
    icon: Globe2,
    title: "Salon website",
    text: "Owner simple forms से published mini website बनाता है.",
    to: "/website-builder",
  },
  {
    icon: CalendarCheck,
    title: "Fast booking",
    text: "Customer service, date, time, name और mobile select करता है.",
    to: "/booking-flow",
  },
  {
    icon: QrCode,
    title: "Clear payment",
    text: "Amount और booking reference verify किए बिना success नहीं दिखता.",
    to: "/qr-payments",
  },
] as const;

const FAQS = [
  [
    "क्या salon owner को monthly subscription देना होगा?",
    "नहीं. Owner marketplace commission model पर काम करता है; customer membership अलग benefit program है.",
  ],
  [
    "क्या सभी roles को एक ही dashboard दिखेगा?",
    "नहीं. Customer, owner, partner, distributor और jobs users के focused app entry points हैं.",
  ],
  [
    "क्या salon website owner खुद edit कर सकता है?",
    "हाँ. Content, services, prices, media, timings और contact simple forms से edit होते हैं.",
  ],
  [
    "क्या booking के समय payment automatically successful दिखेगा?",
    "नहीं. Actual payment confirmation के बिना status advance pending ही रहता है.",
  ],
] as const;

export function PlatformOverviewSections() {
  return (
    <>
      <section className="border-y border-slate-200 bg-white px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[1400px]">
          <p className="text-xs font-black uppercase tracking-[.18em] text-violet-700">
            One platform, focused apps
          </p>
          <div className="mt-3 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <h2 className="max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">
              Har user ko sirf uske kaam ka Nexora.
            </h2>
            <Link
              to="/role-selection"
              className="inline-flex items-center gap-2 text-sm font-bold text-violet-700"
            >
              Choose your app <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {ROLE_CARDS.map((card) => (
              <article
                key={card.title}
                className="group flex min-w-0 flex-col rounded-3xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:border-violet-300 hover:bg-white hover:shadow-xl"
              >
                <card.icon className="h-7 w-7 text-violet-700" />
                <h3 className="mt-5 text-lg font-bold">{card.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{card.text}</p>
                <div className="mt-5 space-y-3">
                  <InstallAppButton
                    kind={card.kind}
                    fallbackHref={card.startPath}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 text-xs font-bold text-white"
                  />
                  <Link
                    to={card.to}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-1 rounded-xl border bg-white px-3 text-sm font-bold text-violet-700"
                  >
                    View {card.action}{" "}
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-xs font-black uppercase tracking-[.18em] text-blue-700">
                Website to booking
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">
                Customer trust ka complete flow.
              </h2>
              <p className="mt-5 text-slate-600">
                Published salon information, transparent service pricing और honest payment status एक
                connected journey बनाते हैं.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {FLOW.map((item, index) => (
                <Link
                  key={item.title}
                  to={item.to}
                  className="rounded-3xl border bg-white p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <item.icon className="h-7 w-7 text-blue-700" />
                    <span className="text-sm font-black text-slate-300">0{index + 1}</span>
                  </div>
                  <h3 className="mt-8 font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 px-5 py-16 text-white sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-emerald-400" />
              <span className="text-sm font-bold text-emerald-300">Trust & Security</span>
            </div>
            <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
              Clear roles. Protected data. Honest statuses.
            </h2>
            <p className="mt-5 max-w-2xl leading-7 text-slate-300">
              Public visitors को केवल published salon data दिखता है. Owner, customer, partner और
              admin access अलग रहता है. Secrets browser में expose नहीं किए जाते.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/privacy"
                className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-950"
              >
                Privacy policy
              </Link>
              <Link
                to="/refund-cancellation"
                className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold"
              >
                Refund policy
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
            <Smartphone className="h-8 w-8 text-violet-300" />
            <h3 className="mt-5 text-2xl font-bold">Install your focused app</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Customer, Shop Owner, Growth Partner, Distributor और Jobs apps अलग start screen और
              dashboard के साथ install किए जा सकते हैं.
            </p>
            <Link
              to="/role-selection"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-violet-300"
            >
              View all apps <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-xs font-black uppercase tracking-[.18em] text-violet-700">
            FAQs
          </p>
          <h2 className="mt-3 text-center text-3xl font-black sm:text-5xl">Simple answers.</h2>
          <div className="mt-10 divide-y overflow-hidden rounded-3xl border bg-white">
            {FAQS.map(([question, answer]) => (
              <details key={question} className="group p-6">
                <summary className="cursor-pointer list-none font-bold">{question}</summary>
                <p className="mt-3 text-sm leading-6 text-slate-600">{answer}</p>
              </details>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              to="/help"
              className="inline-flex items-center gap-2 text-sm font-bold text-violet-700"
            >
              Open Help Center <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

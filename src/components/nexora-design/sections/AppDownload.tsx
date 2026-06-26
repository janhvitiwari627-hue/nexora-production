import { Apple, Play, QrCode, ShieldCheck, Zap, Gift } from "lucide-react";
import FadeIn from "../FadeIn";

const benefits = [
  { icon: Zap, text: "Book in under 60 seconds" },
  { icon: Gift, text: "Track rewards & cashback" },
  { icon: ShieldCheck, text: "Verified professionals only" },
];

function PhoneScreen({ variant }: { variant: "home" | "booking" | "rewards" }) {
  return (
    <div className="relative h-[460px] w-56 shrink-0 overflow-hidden rounded-[2.5rem] border-[7px] border-slate-900 bg-white shadow-2xl shadow-indigo-900/20">
      {/* Notch */}
      <div className="absolute left-1/2 top-3 z-20 h-5 w-20 -translate-x-1/2 rounded-full bg-slate-900" />

      {/* Screen Content */}
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 px-5 pb-8 pt-12 text-white">
          <div className="flex items-center justify-between">
            <div className="h-6 w-6 rounded-full bg-white/20" />
            <div className="h-6 w-6 rounded-full bg-white/20" />
          </div>
          <p className="mt-4 text-xs opacity-80">Good evening</p>
          <p className="text-lg font-bold">Find your look</p>
          <div className="mt-3 h-8 rounded-lg bg-white/20" />
        </div>

        {/* Body */}
        <div className="flex-1 space-y-3 overflow-hidden bg-slate-50 px-3 pt-3">
          {variant === "home" && (
            <>
              <div className="h-24 rounded-xl bg-indigo-100" />
              <div className="grid grid-cols-2 gap-2">
                <div className="h-16 rounded-xl bg-white shadow-sm" />
                <div className="h-16 rounded-xl bg-white shadow-sm" />
                <div className="h-16 rounded-xl bg-white shadow-sm" />
                <div className="h-16 rounded-xl bg-white shadow-sm" />
              </div>
              <div className="h-20 rounded-xl bg-white shadow-sm" />
            </>
          )}
          {variant === "booking" && (
            <>
              <div className="h-32 rounded-xl bg-cover bg-center" style={{ backgroundImage: `url(https://images.pexels.com/photos/7195801/pexels-photo-7195801.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=300&w=400)` }} />
              <div className="space-y-2">
                <div className="h-4 w-3/4 rounded bg-slate-200" />
                <div className="h-4 w-1/2 rounded bg-slate-200" />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[10, 11, 12, 1].map((t) => (
                  <div key={t} className="flex h-10 flex-col items-center justify-center rounded-lg bg-white text-[10px] font-semibold text-slate-700 shadow-sm">
                    {t}:00
                  </div>
                ))}
              </div>
              <div className="h-10 rounded-xl bg-slate-900" />
            </>
          )}
          {variant === "rewards" && (
            <>
              <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-4 text-white">
                <p className="text-[10px] opacity-80">Nexora Points</p>
                <p className="text-2xl font-bold">2,450</p>
              </div>
              <div className="h-16 rounded-xl bg-white shadow-sm" />
              <div className="h-16 rounded-xl bg-white shadow-sm" />
              <div className="h-16 rounded-xl bg-white shadow-sm" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AppDownload() {
  return (
    <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-violet-400/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <FadeIn>
            <div className="max-w-xl">
              <span className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                Nexora App
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Your beauty routine, in your pocket.
              </h2>
              <p className="mt-5 text-lg text-slate-500">
                Book appointments, manage memberships, and unlock exclusive
                rewards — all in one beautifully simple app.
              </p>

              <div className="mt-8 space-y-4">
                {benefits.map((b) => (
                  <div key={b.text} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <b.icon className="h-5 w-5" />
                    </div>
                    <p className="font-medium text-slate-700">{b.text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95"
                >
                  <Apple className="h-5 w-5" />
                  App Store
                </a>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-colors hover:border-indigo-300 hover:text-indigo-700"
                >
                  <Play className="h-5 w-5 fill-current" />
                  Google Play
                </a>
              </div>

              <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-800">
                  <QrCode className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Scan to download</p>
                  <p className="text-xs text-slate-500">Get the app on your phone</p>
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn direction="left" className="relative flex justify-center lg:justify-end">
            <div className="flex items-end gap-4 overflow-x-auto pb-6 pt-10 hide-scrollbar sm:gap-6">
              <div className="hidden sm:block translate-y-8">
                <PhoneScreen variant="home" />
              </div>
              <PhoneScreen variant="booking" />
              <div className="hidden sm:block -translate-y-8">
                <PhoneScreen variant="rewards" />
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

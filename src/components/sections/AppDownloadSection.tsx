import { Bell, Calendar, Smartphone, WifiOff } from "lucide-react";
import { InstallAppButton } from "@/components/pwa/InstallAppButton";

const BENEFITS = [
  { icon: Calendar, label: "Instant Booking", desc: "Skip the wait, book in 2 taps." },
  { icon: WifiOff, label: "Offline Access", desc: "View bookings even without signal." },
  { icon: Bell, label: "Push Notifications", desc: "Real-time reminders & exclusive drops." },
];

export function AppDownloadSection() {
  const pwaUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/app/customer`
      : "https://nexora.app/app/customer";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    pwaUrl,
  )}&color=0A2540&bgcolor=FFFFFF&margin=10`;

  return (
    <section className="mx-auto mt-20 max-w-7xl px-4 md:px-6">
      <div
        className="relative overflow-hidden rounded-[var(--radius-card-lg)] border border-border p-8 shadow-[var(--shadow-card)] md:p-14"
        style={{
          background: "linear-gradient(135deg, #f5f3ff 0%, #ecfeff 50%, #fdf2f8 100%)",
        }}
      >
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary shadow-sm">
              <Smartphone className="h-3 w-3" /> Mobile App
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-heading md:text-5xl">
              Get Nexora on your phone.
            </h2>
            <p className="mt-3 max-w-md text-muted-foreground">
              Your favorite salons, in your pocket. Faster bookings, smarter reminders, member perks
              built in.
            </p>

            <ul className="mt-6 space-y-3">
              {BENEFITS.map((b) => (
                <li key={b.label} className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-primary shadow-sm">
                    <b.icon className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-sm font-bold text-heading">{b.label}</div>
                    <div className="text-xs text-muted-foreground">{b.desc}</div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <InstallAppButton
                kind="customer"
                fallbackHref="/app/customer"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-gradient-cta px-5 py-3 text-sm font-bold text-primary-foreground shadow-lg transition hover:scale-[1.03]"
              />
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            {/* Phone mockup */}
            <div className="relative h-[460px] w-[230px] rounded-[42px] border-[10px] border-[#0A2540] bg-[#0A2540] shadow-[0_30px_80px_-20px_rgba(10,37,64,0.45)]">
              <div className="absolute top-2 left-1/2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-[#0A2540]" />
              <div className="relative h-full w-full overflow-hidden rounded-[32px] bg-white">
                <div className="h-32 bg-gradient-to-br from-[#635BFF] to-[#00D4FF] p-4 text-white">
                  <div className="text-[10px] font-bold uppercase opacity-80">Tonight</div>
                  <div className="mt-1 text-base font-black leading-tight">
                    Your booking
                    <br />
                    is confirmed ✨
                  </div>
                </div>
                <div className="space-y-2 p-3">
                  {["Haircut · 7:00 PM", "Looks Unisex Salon", "Stylist · Riya"].map((t) => (
                    <div
                      key={t}
                      className="rounded-lg bg-muted px-3 py-2 text-[11px] font-semibold text-heading"
                    >
                      {t}
                    </div>
                  ))}
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-lg border border-border px-2 py-2"
                    >
                      <div className="h-8 w-8 rounded bg-muted" />
                      <div className="flex-1 space-y-1">
                        <div className="h-2 w-3/4 rounded bg-muted" />
                        <div className="h-2 w-1/2 rounded bg-muted" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* QR */}
            <div className="absolute -right-2 -bottom-2 hidden flex-col items-center rounded-2xl border border-border bg-white p-3 shadow-xl md:flex">
              <img src={qrUrl} alt="Scan to install Nexora" className="h-24 w-24 rounded" />
              <div className="mt-1.5 text-center text-[10px] font-bold text-heading">
                Scan to install
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

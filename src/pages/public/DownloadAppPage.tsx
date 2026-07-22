import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  Calendar,
  Gift,
  QrCode,
  Smartphone,
  Sparkles,
  Star,
  Wallet,
} from "lucide-react";
import { InstallAppButton } from "@/components/pwa/InstallAppButton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const BENEFITS = [
  {
    icon: Calendar,
    title: "60-Second Booking",
    desc: "From search to confirmed slot in under a minute.",
  },
  { icon: QrCode, title: "Scan & Pay", desc: "Nexora QR checkout at partner salons." },
  { icon: Wallet, title: "Wallet & Rewards", desc: "Earn cashback and redeem instantly." },
  { icon: Gift, title: "Exclusive Offers", desc: "App-only deals near you every week." },
  { icon: Bell, title: "Smart Reminders", desc: "Never miss a slot with real-time alerts." },
  { icon: Star, title: "Reviews & Favourites", desc: "Save salons and share your love." },
];

export default function DownloadAppPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-5xl px-4 py-16 md:py-24">
        <section className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5" /> Available now
            </div>
            <div className="mt-5 flex items-center gap-3">
              <img
                src="/customer-pwa-icon-192.png"
                alt="Nexora"
                className="h-14 w-14 rounded-2xl object-cover shadow-md"
              />
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Nexora Customer App</h1>
            </div>
            <p className="mt-4 text-lg text-muted-foreground">
              Install the Nexora Customer PWA directly from your browser. Your existing login,
              bookings, rewards and profile continue in the installed app.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <InstallAppButton kind="customer" fallbackHref="/app/customer" />
              <Button size="lg" variant="outline" asChild>
                <Link to="/app/customer">
                  Open Customer App <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="ghost" asChild>
                <Link to="/">Continue to Website</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              No APK or app-store account is needed. Android and desktop use Chrome or Edge; iPhone
              and iPad use Safari's Add to Home Screen option.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="relative aspect-[9/16] w-64 rounded-[2.5rem] border-8 border-foreground/90 bg-gradient-to-br from-primary/90 to-primary p-4 shadow-2xl">
              <div className="flex h-full flex-col items-center justify-center gap-4 rounded-3xl bg-background/95 p-6 text-center">
                <img
                  src="/customer-pwa-icon-192.png"
                  alt="Nexora Customer App"
                  className="h-20 w-20 rounded-3xl object-cover shadow-lg"
                />
                <div className="text-lg font-semibold">Nexora</div>
                <div className="text-xs text-muted-foreground">Beauty. Booked. Rewarded.</div>
                <div className="mt-2 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  Install now
                </div>
                <Smartphone className="h-8 w-8 text-primary" />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <h2 className="text-center text-3xl font-bold">What you'll get in the app</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((feature) => (
              <Card key={feature.title} className="p-6">
                <feature.icon className="h-6 w-6 text-primary" />
                <h3 className="mt-3 font-semibold">{feature.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

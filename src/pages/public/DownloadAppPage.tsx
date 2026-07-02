import { Link } from "@tanstack/react-router";
import { Smartphone, Sparkles, Calendar, QrCode, Wallet, Gift, Bell, Star, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CustomerAppHeader } from "@/components/pwa/CustomerAppHeader";
import { InstallBanner } from "@/components/pwa/InstallBanner";

const FEATURES = [
  { icon: Calendar, title: "Instant Booking", desc: "Book your favourite salon in under 30 seconds." },
  { icon: QrCode, title: "Scan & Pay", desc: "Nexora QR checkout at partner salons." },
  { icon: Wallet, title: "Wallet & Rewards", desc: "Earn cashback and redeem instantly." },
  { icon: Gift, title: "Exclusive Offers", desc: "App-only deals near you every week." },
  { icon: Bell, title: "Smart Reminders", desc: "Never miss a slot with real-time alerts." },
  { icon: Star, title: "Reviews & Favourites", desc: "Save salons and share your love." },
];

export default function DownloadAppPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 md:py-20">
        {/* Hero */}
        <section className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5" /> Customer App · Mobile-first PWA
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              Nexora Customer App
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Discover salons, book instantly, pay via QR, and earn rewards — all from one beautifully simple app that installs straight to your home screen.
            </p>
            <div className="mt-6">
              <InstallBanner />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button size="lg" variant="outline" asChild>
                <Link to="/search">Browse Salons</Link>
              </Button>
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4" /> Works on Android, iOS & desktop — no store needed.
            </p>
          </div>
          <div className="flex justify-center">
            <div className="relative aspect-[9/16] w-64 rounded-[2.5rem] border-8 border-foreground/90 bg-gradient-to-br from-primary/90 to-primary p-4 shadow-2xl">
              <div className="flex h-full flex-col items-center justify-center gap-4 rounded-3xl bg-background/95 p-6 text-center">
                <Smartphone className="h-12 w-12 text-primary" />
                <div className="text-lg font-semibold">Nexora</div>
                <div className="text-xs text-muted-foreground">Beauty. Booked. Rewarded.</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mt-20">
          <h2 className="text-center text-3xl font-bold">Everything you need in your pocket</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Card key={f.title} className="p-6">
                <f.icon className="h-6 w-6 text-primary" />
                <h3 className="mt-3 font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Install steps */}
        <section className="mt-20 rounded-2xl border bg-muted/30 p-8 md:p-12">
          <h2 className="text-2xl font-bold">How to install</h2>
          <ol className="mt-6 grid gap-4 text-sm md:grid-cols-3">
            <li className="rounded-lg bg-background p-4"><b>1.</b> Tap <em>Install App</em> above.</li>
            <li className="rounded-lg bg-background p-4"><b>2.</b> Choose <em>Add to Home Screen</em>.</li>
            <li className="rounded-lg bg-background p-4"><b>3.</b> Open Nexora from your home screen — done!</li>
          </ol>
        </section>
      </main>
    </div>
  );
}

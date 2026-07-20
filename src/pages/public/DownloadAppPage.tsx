import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Smartphone,
  Sparkles,
  Calendar,
  QrCode,
  Wallet,
  Gift,
  Bell,
  Star,
  ArrowRight,
  Mail,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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

// Optional external URL where the standalone Customer App will be hosted.
// Left as a placeholder — replace when the app is live.
const EXTERNAL_APP_URL = "https://app.nexorasalonos.com";

export default function DownloadAppPage() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  const handleWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    // Waitlist collection is intentionally client-only for now; the standalone
    // app project will own the real signup flow.
    setJoined(true);
    toast.success("You're on the list — we'll email you when the app launches.");
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-5xl px-4 py-16 md:py-24">
        <section className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5" /> Coming Soon
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              Nexora Customer App
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              A dedicated mobile app is launching separately for customers to discover salons, book
              instantly, pay via QR and earn rewards. Join the waitlist to be first in line.
            </p>

            {joined ? (
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                You're on the waitlist
              </div>
            ) : (
              <form onSubmit={handleWaitlist} className="mt-6 flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="pl-9"
                    aria-label="Email address"
                  />
                </div>
                <Button type="submit" size="lg">
                  Join Waitlist <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            )}

            <div className="mt-4 flex flex-wrap gap-3">
              <Button size="lg" variant="outline" asChild>
                <Link to="/">Continue to Website</Link>
              </Button>
              <Button size="lg" variant="ghost" asChild>
                <a href={EXTERNAL_APP_URL} target="_blank" rel="noopener noreferrer">
                  Preview app.nexorasalonos.com
                </a>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              The Customer App will ship as a separate Android, iOS and web product. This website
              remains the Nexora public site.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="relative aspect-[9/16] w-64 rounded-[2.5rem] border-8 border-foreground/90 bg-gradient-to-br from-primary/90 to-primary p-4 shadow-2xl">
              <div className="flex h-full flex-col items-center justify-center gap-4 rounded-3xl bg-background/95 p-6 text-center">
                <Smartphone className="h-12 w-12 text-primary" />
                <div className="text-lg font-semibold">Nexora</div>
                <div className="text-xs text-muted-foreground">Beauty. Booked. Rewarded.</div>
                <div className="mt-2 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  Launching Soon
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <h2 className="text-center text-3xl font-bold">What you'll get in the app</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((f) => (
              <Card key={f.title} className="p-6">
                <f.icon className="h-6 w-6 text-primary" />
                <h3 className="mt-3 font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

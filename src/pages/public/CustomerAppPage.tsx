import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Smartphone, MapPin, Tag, UserCheck, Zap, MessageCircle, QrCode, Gift, History, Download, ExternalLink, Apple, Play, Share, Plus, MoreVertical, Chrome, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { toast } from "sonner";

const BENEFITS = [
  { icon: MapPin, title: "Nearby salon search", desc: "Verified salons around you, ranked by rating." },
  { icon: Tag, title: "Price comparison", desc: "Transparent, upfront pricing across salons." },
  { icon: UserCheck, title: "Staff selection", desc: "Pick your favourite stylist or therapist." },
  { icon: Zap, title: "60-second booking", desc: "From search to confirmed slot in under a minute." },
  { icon: MessageCircle, title: "WhatsApp confirmation", desc: "Instant booking updates on WhatsApp." },
  { icon: QrCode, title: "Nexora QR rewards", desc: "Scan-and-pay to earn cashback every visit." },
  { icon: Gift, title: "Referral benefits", desc: "Invite friends and unlock bonus rewards." },
  { icon: History, title: "Booking history", desc: "All your visits, receipts and favourites — one tap away." },
];

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function CustomerAppPage() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    if (window.matchMedia?.("(display-mode: standalone)").matches) setInstalled(true);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (deferred) {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setDeferred(null);
      return;
    }
    toast.message("Add to Home Screen", {
      description: "Open this page in Chrome (Android) or Safari (iOS) and tap the browser menu → Add to Home Screen.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 md:py-20">
        {/* Hero */}
        <section className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1 text-xs font-medium">
              <Smartphone className="h-3.5 w-3.5" /> Customer App
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              Nexora Customer App
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Nearby verified salons, transparent prices, 60-second booking and QR rewards.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" onClick={handleInstall} disabled={installed}>
                <Download className="mr-2 h-4 w-4" />
                {installed ? "App Installed" : "Install Nexora App"}
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/search">
                  Continue in Browser <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {!deferred && !installed && (
              <p className="mt-4 text-sm text-muted-foreground">
                Tip: open in Chrome and tap <b>Add to Home Screen</b> to install.
              </p>
            )}

            {/* Store placeholders */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="secondary" size="lg" disabled className="opacity-70">
                <Play className="mr-2 h-4 w-4" /> Get it on Google Play
                <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px]">Coming Soon</span>
              </Button>
              <Button variant="secondary" size="lg" disabled className="opacity-70">
                <Apple className="mr-2 h-4 w-4" /> Download on the App Store
                <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px]">Coming Soon</span>
              </Button>
            </div>
          </div>

          {/* Mockup */}
          <div className="flex justify-center">
            <div className="relative aspect-[9/19] w-64 rounded-[2.5rem] border-8 border-foreground/90 bg-foreground p-2 shadow-2xl">
              <div className="flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-primary/10 via-background to-background">
                <div className="p-4">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Nexora</div>
                  <div className="mt-1 text-sm font-semibold">Salons near you</div>
                </div>
                <div className="mx-3 rounded-xl bg-background p-3 shadow-sm">
                  <div className="h-16 rounded-md bg-muted" />
                  <div className="mt-2 h-2 w-2/3 rounded bg-muted" />
                  <div className="mt-1 h-2 w-1/3 rounded bg-muted" />
                </div>
                <div className="mx-3 mt-2 rounded-xl bg-background p-3 shadow-sm">
                  <div className="h-16 rounded-md bg-muted" />
                  <div className="mt-2 h-2 w-1/2 rounded bg-muted" />
                </div>
                <div className="mt-auto rounded-b-[1.5rem] bg-primary/95 p-3 text-center text-xs font-medium text-primary-foreground">
                  Book in 60 seconds
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="mt-20">
          <h2 className="text-center text-3xl font-bold">Why customers love Nexora</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b) => (
              <Card key={b.title} className="p-5">
                <b.icon className="h-6 w-6 text-primary" />
                <h3 className="mt-3 font-semibold">{b.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{b.desc}</p>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

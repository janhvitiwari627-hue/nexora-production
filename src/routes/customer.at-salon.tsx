import { createFileRoute, Link } from "@tanstack/react-router";
import { QrCode, ScanLine, Sparkles } from "lucide-react";

export const Route = createFileRoute("/customer/at-salon")({
  head: () => ({
    meta: [
      { title: "At the Salon — Nexora" },
      {
        name: "description",
        content:
          "Check in, scan the QR to pay, and earn instant rewards while you are at the salon.",
      },
    ],
  }),
  component: AtSalonPage,
});

function AtSalonPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="bg-gradient-cta grid h-11 w-11 place-items-center rounded-xl text-primary-foreground shadow-[var(--shadow-glow)]">
          <ScanLine className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-heading">At the Salon</h1>
          <p className="text-sm text-muted-foreground">
            Everything you need while you are in the chair.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/customer/bookings"
          className="group rounded-2xl border border-border/60 bg-card p-5 transition hover:border-primary/60 hover:shadow-lg"
        >
          <QrCode className="mb-3 h-6 w-6 text-primary" />
          <div className="text-base font-semibold text-heading">Show my booking</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Present your appointment QR to the front desk.
          </p>
        </Link>
        <Link
          to="/customer/rewards"
          className="group rounded-2xl border border-border/60 bg-card p-5 transition hover:border-primary/60 hover:shadow-lg"
        >
          <Sparkles className="mb-3 h-6 w-6 text-primary" />
          <div className="text-base font-semibold text-heading">Rewards & tier</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Redeem points before you pay.
          </p>
        </Link>
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Scan the Nexora QR at the counter to check in and earn instant points.
      </p>
    </div>
  );
}

import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, Sparkles } from "lucide-react";

/**
 * /salon/$slug/book — booking flow.
 * Uses a non-nested filename (`salon.$slug_.book`) so it does not inherit
 * the /salon/$slug parent route (which redirects to /site/$businessSlug).
 */
export const Route = createFileRoute("/salon/$slug_/book")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/site/$slug/book",
      params: { slug: params.slug },
      search: { service: undefined },
    });
  },
  head: ({ params }) => ({
    meta: [{ title: `Book at ${params.slug} — Nexora` }],
  }),
  component: BookingFlowPage,
});

const STEPS = ["Service", "Time", "Confirm"] as const;

function BookingFlowPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [service, setService] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      // Placeholder confirmation ID until backend is wired.
      const bookingId = `BK-${Date.now().toString(36).toUpperCase()}`;
      navigate({ to: "/dashboard/bookings/$id", params: { id: bookingId } });
    }
  };

  return (
    <main className="mx-auto max-w-md px-4 py-6">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">Booking at {slug}</div>
      <h1 className="mt-1 text-2xl font-bold">{STEPS[step]}</h1>

      <ol className="mt-4 flex gap-2">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`h-1 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`}
            aria-label={`${label} ${i <= step ? "complete" : "pending"}`}
          />
        ))}
      </ol>

      <div className="mt-6 space-y-3">
        {step === 0 && (
          <>
            {["Haircut", "Beard trim", "Hair color"].map((s) => (
              <Card
                key={s}
                onClick={() => setService(s)}
                className={`cursor-pointer p-4 ${service === s ? "border-primary ring-2 ring-primary/30" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <div className="flex-1 text-sm font-medium">{s}</div>
                  <div className="text-xs text-muted-foreground">from ₹299</div>
                </div>
              </Card>
            ))}
          </>
        )}

        {step === 1 && (
          <div className="grid grid-cols-3 gap-2">
            {["10:00", "11:30", "13:00", "15:00", "16:30", "18:00"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSlot(t)}
                className={`rounded-lg border px-3 py-2 text-sm ${slot === t ? "border-primary bg-primary/10" : "bg-card"}`}
              >
                <Clock className="mx-auto mb-1 h-3.5 w-3.5" />
                {t}
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <Card className="space-y-2 p-4 text-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>{service ?? "—"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Today · {slot ?? "—"}</span>
            </div>
          </Card>
        )}
      </div>

      <div className="mt-6 flex gap-2">
        {step > 0 && (
          <Button variant="outline" className="flex-1" onClick={() => setStep(step - 1)}>
            Back
          </Button>
        )}
        <Button
          className="flex-1"
          disabled={(step === 0 && !service) || (step === 1 && !slot)}
          onClick={next}
        >
          {step === STEPS.length - 1 ? "Confirm booking" : "Continue"}
        </Button>
      </div>
    </main>
  );
}

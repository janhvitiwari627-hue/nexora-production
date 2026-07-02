import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Calendar, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/customer/bookings/$bookingId")({
  head: ({ params }) => ({
    meta: [{ title: `Booking ${params.bookingId} — Nexora` }],
  }),
  component: BookingConfirmationPage,
});

function BookingConfirmationPage() {
  const { bookingId } = Route.useParams();
  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold">Booking confirmed</h1>
        <p className="text-sm text-muted-foreground">
          Reference <span className="font-mono">{bookingId}</span>
        </p>
      </div>

      <div className="mt-6 space-y-3 rounded-xl border bg-card p-4">
        <div className="flex items-start gap-3">
          <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium">Appointment</div>
            <div className="text-xs text-muted-foreground">Details will appear here.</div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium">Salon</div>
            <div className="text-xs text-muted-foreground">Address & directions.</div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-4 w-4 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium">Rewards</div>
            <div className="text-xs text-muted-foreground">Points will credit after your visit.</div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <Button asChild variant="outline" className="flex-1">
          <Link to="/customer/bookings">All bookings</Link>
        </Button>
        <Button asChild className="flex-1">
          <Link to="/customer/home">Back to home</Link>
        </Button>
      </div>
    </main>
  );
}

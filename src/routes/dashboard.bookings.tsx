import { createFileRoute } from "@tanstack/react-router";
import { PublicBookingsPage } from "@/pages/customer/PublicBookingsPage";
import { OwnerBookingsPage } from "@/pages/owner/OwnerBookingsPage";
import { useOwnerContext } from "@/hooks/use-owner-context";

export const Route = createFileRoute("/dashboard/bookings")({
  head: () => ({
    meta: [
      { title: "My Bookings — Nexora" },
      {
        name: "description",
        content:
          "View your upcoming, completed, cancelled and rescheduled appointments — reschedule, cancel, get directions or rebook in one tap.",
      },
      { property: "og:title", content: "My Bookings — Nexora" },
      {
        property: "og:description",
        content: "Manage every appointment from one beautifully simple dashboard.",
      },
    ],
  }),
  component: BookingsDashboard,
});

function BookingsDashboard() {
  const owner = useOwnerContext();
  if (owner.isLoading) {
    return (
      <main className="grid min-h-[60vh] place-items-center text-sm text-muted-foreground">
        Loading bookings…
      </main>
    );
  }
  return owner.hasSalon ? <OwnerBookingsPage /> : <PublicBookingsPage />;
}

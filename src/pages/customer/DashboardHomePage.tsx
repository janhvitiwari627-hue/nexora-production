import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { ProfileHeaderWidget } from "./widgets/ProfileHeaderWidget";
import { QuickActionsRow } from "./widgets/QuickActionsRow";
import { UpcomingBookingWidget } from "./widgets/UpcomingBookingWidget";
import { RewardProgressCard } from "./widgets/RewardProgressCard";

export function DashboardHomePage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-10">
        <div className="space-y-6">
          <ProfileHeaderWidget />
          <QuickActionsRow />
          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <section className="space-y-3">
              <h2 className="text-lg font-bold">Upcoming Appointment</h2>
              <UpcomingBookingWidget />
            </section>
            <section className="space-y-3">
              <h2 className="text-lg font-bold">Rewards</h2>
              <RewardProgressCard />
            </section>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

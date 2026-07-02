import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { ProfileHeaderWidget } from "./widgets/ProfileHeaderWidget";
import { QuickActionsRow } from "./widgets/QuickActionsRow";
import { UpcomingBookingWidget } from "./widgets/UpcomingBookingWidget";
import { RewardProgressCard } from "./widgets/RewardProgressCard";
import { MembershipStatusCard } from "./widgets/MembershipStatusCard";
import { FavoriteShopsCarousel } from "./widgets/FavoriteShopsCarousel";
import { RecentActivityFeed } from "./widgets/RecentActivityFeed";
import { RecommendedServicesSection } from "./widgets/RecommendedServicesSection";
import { ExclusiveOffersSection } from "./widgets/ExclusiveOffersSection";
import { MyApplicationsWidget } from "./widgets/MyApplicationsWidget";

export function DashboardHomePage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-10">
        <div className="space-y-8">
          <ProfileHeaderWidget />
          <QuickActionsRow />

          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <section className="space-y-3">
              <h2 className="text-lg font-bold">Upcoming Appointment</h2>
              <UpcomingBookingWidget />
            </section>
            <div className="space-y-6">
              <section className="space-y-3">
                <h2 className="text-lg font-bold">Rewards</h2>
                <RewardProgressCard />
              </section>
              <MembershipStatusCard />
            </div>
          </div>

          <FavoriteShopsCarousel />

          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <RecommendedServicesSection />
            <RecentActivityFeed />
          </div>

          <MyApplicationsWidget />

          <ExclusiveOffersSection />
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

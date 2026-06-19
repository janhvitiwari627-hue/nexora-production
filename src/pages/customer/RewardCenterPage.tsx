import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { RewardBalanceHero } from "./rewards/RewardBalanceHero";
import { PointsBreakdown } from "./rewards/PointsBreakdown";
import { TierProgressBar } from "./rewards/TierProgressBar";
import { RewardHistoryTable } from "./rewards/RewardHistoryTable";
import { RedeemRewardsSection } from "./rewards/RedeemRewardsSection";
import { ExpiringSoonAlert } from "./rewards/ExpiringSoonAlert";
import { EarningGuide } from "./rewards/EarningGuide";

export function RewardCenterPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 sm:py-10">
        <RewardBalanceHero />
        <ExpiringSoonAlert />
        <PointsBreakdown />
        <TierProgressBar />
        <RedeemRewardsSection />
        <RewardHistoryTable />
        <EarningGuide />
      </main>
      <PublicFooter />
    </div>
  );
}

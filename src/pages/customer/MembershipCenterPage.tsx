import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { ActivePlanCard } from "./membership/ActivePlanCard";
import { SavingsEarnedCounter } from "./membership/SavingsEarnedCounter";
import { BenefitsChecklist } from "./membership/BenefitsChecklist";
import { UpgradePathVisual } from "./membership/UpgradePathVisual";
import { PlanComparisonTable } from "./membership/PlanComparisonTable";
import { MembershipHistorySection } from "./membership/MembershipHistorySection";

export function MembershipCenterPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 sm:py-10">
        <header>
          <h1 className="text-2xl font-black sm:text-3xl">Membership Center</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your card, your benefits, and your upgrade path — all in one place.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <ActivePlanCard />
          <SavingsEarnedCounter />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <BenefitsChecklist />
          <UpgradePathVisual />
        </div>

        <PlanComparisonTable />
        <MembershipHistorySection />
      </main>
      <PublicFooter />
    </div>
  );
}

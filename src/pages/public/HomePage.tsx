import { motion } from "framer-motion";
import { type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { HeroSection } from "@/components/sections/HeroSection";
import { CategorySection } from "@/components/sections/CategorySection";
import { TopRatedShopsSection } from "@/components/sections/TopRatedShopsSection";
import { RecommendedSection } from "@/components/sections/RecommendedSection";
import { SponsoredBrandsSection } from "@/components/sections/SponsoredBrandsSection";
import { SponsoredVideosSection } from "@/components/sections/SponsoredVideosSection";
import { OffersSection } from "@/components/sections/OffersSection";
import { NearbyShopsSection } from "@/components/sections/NearbyShopsSection";
import { TrendingSection } from "@/components/sections/TrendingSection";
import { MembershipSection } from "@/components/sections/MembershipSection";
import { AppDownloadSection } from "@/components/sections/AppDownloadSection";
import { Button } from "@/components/ui/button";

function Reveal({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function HomePage() {
  return (
    <div className="min-h-screen bg-background [&>section]:py-16 md:[&>section]:py-[120px]">
      <PublicHeader />

      <HeroSection />

      <Reveal>
        <CategorySection />
      </Reveal>
      <Reveal>
        <TopRatedShopsSection />
      </Reveal>
      <Reveal>
        <RecommendedSection />
      </Reveal>
      <Reveal>
        <OffersSection />
      </Reveal>
      <Reveal>
        <SponsoredBrandsSection />
      </Reveal>
      <Reveal>
        <SponsoredVideosSection />
      </Reveal>
      <Reveal>
        <NearbyShopsSection />
      </Reveal>
      <Reveal>
        <TrendingSection />
      </Reveal>
      <Reveal>
        <MembershipSection />
      </Reveal>
      <Reveal>
        <AppDownloadSection />
      </Reveal>

      {/* Owner CTA */}
      <Reveal>
        <section className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="relative overflow-hidden rounded-[var(--radius-card-lg)] bg-gradient-hero p-10 text-primary-foreground md:p-16">
            <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
            <div className="relative grid items-center gap-6 md:grid-cols-[1fr_auto]">
              <div>
                <h3 className="text-3xl font-black tracking-tight md:text-4xl">
                  Own a salon? Run it on Nexora.
                </h3>
                <p className="mt-2 max-w-xl opacity-90">
                  One platform for bookings, staff, inventory, marketing and payments.
                  Free for the first 30 days.
                </p>
              </div>
              <Button
                size="lg"
                className="h-12 rounded-[var(--radius-button)] bg-card px-7 font-bold text-heading hover:bg-card/90"
              >
                For business owners
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </Reveal>

      <PublicFooter />
    </div>
  );
}

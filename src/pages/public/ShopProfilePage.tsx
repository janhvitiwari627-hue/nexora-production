import { lazy, Suspense, useState } from "react";
import { motion } from "framer-motion";
import { ShopCardSkeleton } from "@/components/shared/SkeletonLoader";
import { MOCK_SHOP } from "./shop/mockShop";
import { HeroCarousel } from "./shop/HeroCarousel";
import { StickySubHeader } from "./shop/StickySubHeader";
import { QuickActionBar } from "./shop/QuickActionBar";
import { TabNav, SHOP_TABS, type ShopTab } from "./shop/TabNav";

// Lazy-load tab content (loads on first visit)
const TabsModule = () => import("./shop/tabs");
const OverviewTab = lazy(async () => ({ default: (await TabsModule()).OverviewTab }));
const ServicesTab = lazy(async () => ({ default: (await TabsModule()).ServicesTab }));
const StaffTab = lazy(async () => ({ default: (await TabsModule()).StaffTab }));
const GalleryTab = lazy(async () => ({ default: (await TabsModule()).GalleryTab }));
const ReviewsTab = lazy(async () => ({ default: (await TabsModule()).ReviewsTab }));
const OffersTab = lazy(async () => ({ default: (await TabsModule()).OffersTab }));
const MembershipTab = lazy(async () => ({ default: (await TabsModule()).MembershipTab }));
const AboutTab = lazy(async () => ({ default: (await TabsModule()).AboutTab }));
const LocationTab = lazy(async () => ({ default: (await TabsModule()).LocationTab }));
const PoliciesTab = lazy(async () => ({ default: (await TabsModule()).PoliciesTab }));
const FAQsTab = lazy(async () => ({ default: (await TabsModule()).FAQsTab }));
const ContactTab = lazy(async () => ({ default: (await TabsModule()).ContactTab }));

export function ShopProfilePage() {
  const shop = MOCK_SHOP;
  const [active, setActive] = useState<ShopTab>("Overview");
  const [visited, setVisited] = useState<Set<ShopTab>>(new Set(["Overview"]));

  const switchTab = (t: ShopTab) => {
    setActive(t);
    setVisited((prev) => {
      if (prev.has(t)) return prev;
      const n = new Set(prev);
      n.add(t);
      return n;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <StickySubHeader name={shop.name} rating={shop.rating} reviewCount={shop.review_count} />

      <HeroCarousel
        images={shop.cover_images}
        name={shop.name}
        category={shop.category}
        area={shop.area}
        city={shop.city}
        badges={shop.badges}
        verified={shop.is_verified}
      />

      <QuickActionBar
        phone={shop.phone}
        whatsapp={shop.whatsapp}
        lat={shop.lat}
        lng={shop.lng}
      />

      <TabNav active={active} onChange={switchTab} />

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <Suspense fallback={<SkeletonLoader className="h-96 w-full" />}>
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            {SHOP_TABS.map((t) => {
              if (t !== active || !visited.has(t)) return null;
              switch (t) {
                case "Overview":
                  return <OverviewTab key={t} shop={shop} go={(n) => switchTab(n as ShopTab)} />;
                case "Services":
                  return <ServicesTab key={t} shop={shop} />;
                case "Staff":
                  return <StaffTab key={t} shop={shop} />;
                case "Gallery":
                  return <GalleryTab key={t} shop={shop} />;
                case "Reviews":
                  return <ReviewsTab key={t} shop={shop} />;
                case "Offers":
                  return <OffersTab key={t} shop={shop} />;
                case "Membership":
                  return <MembershipTab key={t} shop={shop} />;
                case "About":
                  return <AboutTab key={t} shop={shop} />;
                case "Location":
                  return <LocationTab key={t} shop={shop} />;
                case "Policies":
                  return <PoliciesTab key={t} shop={shop} />;
                case "FAQs":
                  return <FAQsTab key={t} shop={shop} />;
                case "Contact":
                  return <ContactTab key={t} shop={shop} />;
                default:
                  return null;
              }
            })}
          </motion.div>
        </Suspense>
      </main>
    </div>
  );
}

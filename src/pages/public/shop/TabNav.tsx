import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export const SHOP_TABS = [
  "Overview",
  "Services",
  "Staff",
  "Gallery",
  "Reviews",
  "Offers",
  "Membership",
  "About",
  "Location",
  "Policies",
  "FAQs",
  "Contact",
] as const;

export type ShopTab = (typeof SHOP_TABS)[number];

export function TabNav({
  active,
  onChange,
}: {
  active: ShopTab;
  onChange: (t: ShopTab) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current?.querySelector<HTMLButtonElement>(`[data-tab="${active}"]`);
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [active]);

  return (
    <div className="border-border bg-card/95 sticky top-[64px] z-20 border-b backdrop-blur">
      <div
        ref={ref}
        className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-2 py-1 md:px-6 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        {SHOP_TABS.map((t) => {
          const isActive = t === active;
          return (
            <button
              key={t}
              data-tab={t}
              type="button"
              onClick={() => onChange(t)}
              className={cn(
                "relative shrink-0 px-3 py-3 text-sm font-semibold transition md:px-4",
                isActive ? "text-heading" : "text-muted-foreground hover:text-heading",
              )}
            >
              {t}
              {isActive && (
                <motion.span
                  layoutId="shop-tab-underline"
                  className="bg-gradient-cta absolute inset-x-2 -bottom-px h-0.5 rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

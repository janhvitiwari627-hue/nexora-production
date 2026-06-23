import type { ShopData } from "../types";
import type { TemplateConfig } from "../templates";
import { SectionTitle } from "./WServices";
import { Award, Cake, Gift, PartyPopper, Sparkles } from "lucide-react";

export function WLoyalty({ shop, template }: { shop: ShopData; template: TemplateConfig }) {
  const items = [
    { icon: Sparkles, title: "Reward Points", body: `Earn ${shop.loyalty.pointsPerVisit} points every visit.` },
    { icon: Gift, title: "Referral Rewards", body: `Get ${shop.loyalty.referralPoints} points for every friend you refer.` },
    { icon: Cake, title: "Birthday Reward", body: shop.loyalty.birthdayReward },
    { icon: PartyPopper, title: "Festival Reward", body: shop.loyalty.festivalReward },
  ];
  return (
    <section id="loyalty" className="bg-muted/30 px-6 py-16 md:px-12">
      <SectionTitle font={template.headingFont}>Loyalty Program</SectionTitle>
      <p className="text-muted-foreground mt-2 text-center text-sm">Stay loyal. Get rewarded.</p>
      <div className="mx-auto mt-8 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
          <div key={it.title} className="border bg-white p-5 text-center shadow-sm" style={{ borderRadius: template.radius }}>
            <div
              className="mx-auto grid h-12 w-12 place-items-center text-white"
              style={{ backgroundColor: template.colors.primary, borderRadius: template.radius }}
            >
              <it.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-3 font-semibold">{it.title}</h3>
            <p className="text-muted-foreground mt-1 text-xs">{it.body}</p>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-6 flex max-w-md items-center justify-center gap-2 rounded-full border bg-white px-4 py-2 text-xs text-muted-foreground">
        <Award className="h-4 w-4" style={{ color: template.colors.secondary }} />
        Members unlock priority booking and higher rewards.
      </div>
    </section>
  );
}
